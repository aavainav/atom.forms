import { ComponentType } from "react";
import { createService, Singleton } from "@shrub/core";
import { IControllerManager, IFormIdentity, IFormMapper, IReportViewerData, FormFactoryConstructor, FormModel, FormModelConstructor, FormType, Schema, SchemaConstructor } from "@forms/core";

export const IFormCatalogService = createService<IFormCatalogService>("forms-catalog-service");
export const IFormCatalogRegistrationService = createService<IFormCatalogRegistrationService>("forms-catalog-registration-service");
export const IFormDataHooks = createService<IFormDataHooks>("form-data-hooks");

/** Defines the props required by a form catalog item's rendering component. */
export interface IFormComponentProps {
    /** The controllers belonging to this form. The form controller owns the form model and is how every edit is applied. */
    readonly controllers: IControllerManager;
    /** When true, the form's editing affordances (add/delete page, drag-and-drop import) should not be offered; individual fields report their own disabled state via `FieldModel.isEnabled`. */
    readonly isReadOnly: boolean;
}

/** Defines the route/request context a form was loaded under (e.g. matched route params and the current query string), so a data reader can resolve a specific record. */
export interface IFormDataContext {
    readonly params: Readonly<Record<string, string | undefined>>;
    readonly searchParams: URLSearchParams;
}

/** Default values for a newly created record, together with which of its own fields should come back locked rather than editable. */
export interface IFormDefaults {
    readonly data: IReportViewerData;
    readonly readOnlyFields?: ReadonlySet<string>;
}

/**
 * Defines the read half of a catalog item's data boundary: a host-supplied source of its report data. Implementations
 * are responsible for fetching from whatever source(s) they need and mapping the result into the shape the target
 * form expects. The write half is `IFormDataWriter`.
 */
export interface IFormDataReader {
    getData(context: IFormDataContext): Promise<IReportViewerData | undefined>;
    /**
     * Gets the values a new record for this form should start with, and optionally which of them should come back
     * locked rather than editable. Called by `IReportViewerService.loadFormReport` only once `getData` has resolved
     * nothing to load, i.e. the user is creating a record rather than opening one. Optional: a reader that only
     * ever opens existing records can leave this unimplemented.
     *
     * Unrelated to `FieldModel.setDefaultValue()`, which resets a single field back to its own type's zero-value -
     * this supplies the values a whole new record should start with, and is never called for an existing one.
     */
    getDefaultData?(context: IFormDataContext): Promise<IFormDefaults | undefined>;
}

/**
 * Defines the write half of a catalog item's data boundary: a host-supplied destination for its report data.
 * Implementations own persistence and any mapping back into the host's own record shape; the report viewer only
 * hands the data over. The read half is `IFormDataReader`.
 */
export interface IFormDataWriter {
    saveData(data: IReportViewerData, context: IFormDataContext): Promise<void>;
}

/**
 * Defines a host's hooks into a catalog form's data boundary: a way to supply a data reader/writer for a form
 * without the form package itself - which registers the catalog item and has no idea what a host's own data source
 * looks like - needing to know about it. A host implements this once and registers it as a service; whatever picks
 * up a catalog item to load or save (typically a form's own route loader) asks this for the identity's reader/writer
 * and attaches whichever it gets back onto the item before handing it to `IReportViewerService`. Optional: a host
 * with nothing to supply for a given identity, or no host implementation registered at all, simply leaves a
 * catalog item's `dataReader`/`dataWriter` unset, and it loads and saves nothing.
 */
export interface IFormDataHooks {
    /** Returns the data reader to use for the given form, if this host supplies one for it. */
    getDataReader?(identity: IFormIdentity): IFormDataReader | undefined;
    /** Returns the data writer to use for the given form, if this host supplies one for it. */
    getDataWriter?(identity: IFormIdentity): IFormDataWriter | undefined;
}

/** Defines a form registered with the form catalog, keyed by name and version. */
export interface IFormCatalogItem<TForm extends FormModel = FormModel, TSchema extends Schema = Schema, TData extends object = IReportViewerData> {
    readonly name: string;
    readonly description: string;
    readonly type: FormType;
    readonly version: string;

    /** The form model constructor used to create and build the initial model. */
    readonly ctor: FormModelConstructor<TForm>;
    /** The form schema. Used to define the form model structure. */
    readonly schema: SchemaConstructor<TSchema>;
    /** The form factory. This is used to create the new form model and any additional pages. */
    readonly formFactory: FormFactoryConstructor<TForm>;

    /** The main form component to render the form in the ui. */
    readonly component: () => Promise<ComponentType<IFormComponentProps>>;

    /** Translates between this form and the data contract it publishes. A form without one simply neither populates nor saves. */
    readonly mapper?: IFormMapper<TForm, TData>;
    /**
     * Supplies the report data to load for this form. Never set by the catalog itself - the form package that
     * registers this item has no host-specific data source to give it. A host attaches one via `IFormDataHooks`
     * before handing the item to `IReportViewerService`; a form with none set never has anything to load.
     */
    readonly dataReader?: IFormDataReader;
    /** Persists this form's saved report data. Attached the same way as `dataReader`, and for the same reason never set by the catalog itself. */
    readonly dataWriter?: IFormDataWriter;

    /** The id of the violation list this citation draws its charges from, for a form that has one. */
    readonly violationListId?: string;
    /** The ids of the value lists this form's option fields draw on. */
    readonly valueListIds?: ReadonlyArray<string>;
}

/** Defines a service for resolving forms registered with the form catalog. */
export interface IFormCatalogService {
    readonly catalogItems: ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>>;
    /** Gets the catalog item matching the given identity, returning its latest version if the identity does not specify one. */
    get(identity: IFormIdentity): Promise<IFormCatalogItem>;
    /** Gets the latest version of every registered catalog item, keyed by name. */
    getLatestVersions(): Promise<Map<string, IFormCatalogItem>>;
}

/** Defines a service for registering a form with the form catalog. */
export interface IFormCatalogRegistrationService {
    registerCatalogItem<TForm extends FormModel, TSchema extends Schema, TData extends object = IReportViewerData>(catalogItem: IFormCatalogItem<TForm, TSchema, TData>): void;
}

@Singleton
export class FormCatalogService implements IFormCatalogService, IFormCatalogRegistrationService {
    private readonly _catalogItems: Map<string, Map<string, IFormCatalogItem>> = new Map<string, Map<string, IFormCatalogItem>>();

    get catalogItems(): ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>> {
        return this._catalogItems;
    }

    async get({ name, version }: IFormIdentity): Promise<IFormCatalogItem> {
        const versionMap = this.getVersionMap(name);

        if (version) {
            const catalogItem = versionMap.get(version);

            if (!catalogItem) {
                throw new Error(`Form type with name ${name} and version ${version} not found in catalog.`);
            }

            return catalogItem;
        }

        return this.getLatestVersion(name, versionMap);
    }

    async getLatestVersions(): Promise<Map<string, IFormCatalogItem>> {
        const latestVersions = new Map<string, IFormCatalogItem>();

        this._catalogItems.forEach((versionMap, name) => {
            latestVersions.set(name, this.getLatestVersion(name, versionMap));
        });

        return latestVersions;
    }

    registerCatalogItem<TForm extends FormModel, TSchema extends Schema, TData extends object = IReportViewerData>(catalogItem: IFormCatalogItem<TForm, TSchema, TData>): void {
        if (!this._catalogItems.has(catalogItem.name)) {
            this._catalogItems.set(catalogItem.name, new Map<string, IFormCatalogItem>());
        }

        const versionMap = this._catalogItems.get(catalogItem.name)!;

        if (versionMap.has(catalogItem.version)) {
            throw new Error(`A form with the name of ${catalogItem.name} and version ${catalogItem.version} has already been registered with the form catalog.`);
        }

        // each form publishes its own contract, so the registry can only hold its mapper erased; this is the one
        // place the concrete pair is widened, which keeps the cast off every form module's registration.
        versionMap.set(catalogItem.version, catalogItem as unknown as IFormCatalogItem);
    }

    private getLatestVersion(name: string, versionMap: Map<string, IFormCatalogItem>): IFormCatalogItem {
        // versions are sorted descending on read so registration can happen incrementally across modules.
        const latestVersion = Array.from(versionMap.keys()).sort((a, b) => b.localeCompare(a))[0];

        if (!latestVersion) {
            throw new Error(`No versions found for form type with name ${name}.`);
        }

        return versionMap.get(latestVersion)!;
    }

    private getVersionMap(name: string): Map<string, IFormCatalogItem> {
        const versionMap = this._catalogItems.get(name);

        if (!versionMap) {
            throw new Error(`Form type with name ${name} not found in catalog.`);
        }

        return versionMap;
    }
}

/**
 * Attaches whatever data reader/writer `hooks` answers with for the catalog item's identity, if any - the one
 * place a resolved catalog item picks up the host-supplied half of its data boundary. Called with `undefined`
 * (no `IFormDataHooks` registered) or with hooks that answer nothing for this identity, the item comes back
 * unchanged.
 */
export function withDataHooks<TForm extends FormModel, TSchema extends Schema, TData extends object>(catalogItem: IFormCatalogItem<TForm, TSchema, TData>, hooks: IFormDataHooks | undefined): IFormCatalogItem<TForm, TSchema, TData> {
    const dataReader = hooks?.getDataReader?.(catalogItem);
    const dataWriter = hooks?.getDataWriter?.(catalogItem);

    if (!dataReader && !dataWriter) {
        return catalogItem;
    }

    return { ...catalogItem, dataReader: dataReader ?? catalogItem.dataReader, dataWriter: dataWriter ?? catalogItem.dataWriter };
}
