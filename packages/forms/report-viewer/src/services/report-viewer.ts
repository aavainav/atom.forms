import { ComponentType } from "react";
import { IFormCatalogItem, IFormCatalogService, IFormComponentProps } from "@forms/catalog";
import { IControllerManager, IFormIdentity, IFormMapper, FormFactory, FormModel } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { IReportViewerData, IReportViewerOptions } from "../options";
import { INavigationRegistrationService, IReportViewerRoute } from "./navigation";

type Mutable<T> = { -readonly [P in keyof T]: T[P] };

export const IReportViewerService = createService<IReportViewerService>("forms-report-viewer-service");
export const IReportViewerRegistrationService = createService<IReportViewerRegistrationService>("forms-report-viewer-registration-service");

/** Defines the route/request context a form was loaded under (e.g. matched route params and the current query string), so a data reader can resolve a specific record. */
export interface IFormDataContext {
    readonly params: Readonly<Record<string, string | undefined>>;
    readonly searchParams: URLSearchParams;
}

/** Identifies a specific catalog form to load, for hosts that are already bound to one form rather than resolving it from the loaded data. Every part is optional, since an omitted one falls back to the loaded data. */
export type IFormReportIdentity = Partial<IFormIdentity>;

/** Describes a form resolved from the form catalog and ready to render. */
export interface IInitialForm {
    /** The catalog item the form was resolved from; it carries the identity a saved report must be stamped with. */
    readonly catalogItem: IFormCatalogItem;
    /** The form model. */
    readonly form: FormModel;
    /** The form factory used to create the form, and pages. */
    readonly formFactory: FormFactory;
    /** The component used to render the form. */
    readonly Component: ComponentType<IFormComponentProps>;
}

/**
 * Defines the read half of the host data boundary: a host-supplied source of report data. Implementations are responsible
 * for fetching from whatever source(s) they need and mapping the result into the shape the target form expects.
 * The write half is IFormDataWriter.
 */
export interface IFormDataReader {
    getData(context: IFormDataContext): Promise<IReportViewerData | undefined>;
}

/**
 * Defines the write half of the host data boundary: a host-supplied destination for report data. Implementations own
 * persistence and any mapping back into the host's own record shape; the report viewer only hands the data over.
 * The read half is IFormDataReader.
 */
export interface IFormDataWriter {
    saveData(data: IReportViewerData, context: IFormDataContext): Promise<void>;
}

export interface IReportViewerService {
    /** Gets whether forms should render read-only by default, from the module options/settings. */
    readonly isReadOnly: boolean;
    /** Gets whether the form with the given identity can be saved, which it can once a mapper is registered to extract its data and a writer is registered to persist it. */
    canSaveForm: (identity: IFormIdentity) => boolean;
    /** Gets the forms registered with this report viewer, each paired with the route it is reachable at. */
    getForms: () => Promise<Array<IFormRegistration>>;
    /** Gets the report data to load for the given context, from the registered data reader if one exists, otherwise falling back to the static data supplied via module options/settings. */
    getData: (context: IFormDataContext) => Promise<IReportViewerData | undefined>;
    /** Gets the options registered for the given form, in the order they are rendered in the options bar. */
    getOptions: (catalogItem: IFormCatalogItem) => Array<IReportViewerOption>;
    /** Gets the panels registered for the given form, which are mounted at the report viewer's root. */
    getPanels: (catalogItem: IFormCatalogItem) => Array<IReportViewerPanel>;
    /** Loads the catalog form matching `identity` (or, when omitted, the given data's `name`/`version`) and populates it with that data. */
    loadForm: (data: IReportViewerData | undefined, identity?: IFormReportIdentity) => Promise<IInitialForm | undefined>;
    /**
     * Resolves the report data for the given context, loads the matching catalog form, and populates it with that data.
     * When `identity` is omitted, the catalog form is resolved from the loaded data's `name`/`version` instead.
     */
    loadFormReport: (context: IFormDataContext, identity?: IFormReportIdentity) => Promise<IInitialForm | undefined>;
    /**
     * Extracts report data from the given form and hands it to the registered data writer, if one exists. The data
     * is returned whether or not a writer consumed it, so a host that persists the data itself can use this too.
     */
    saveForm: (form: FormModel, catalogItem: IFormCatalogItem, context: IFormDataContext) => Promise<IReportViewerData>;
}

/**
 * Defines an option rendered in the report viewer's options bar.
 *
 * **Every option is registered, the report viewer's own included.** The bar renders whatever `getOptions` answers
 * with and knows nothing else, so validate, save and day/night sit in the same list as print and violations and are
 * gated the same way. That is also what lets something other than the bar — the sandbox's home page, say — ask what
 * a form offers without rendering any of it.
 */
export interface IReportViewerOption {
    /** Identifies the option; registering the same id twice throws. */
    readonly id: string;
    /** Where the option sits in the bar, ascending. The report viewer's own are validate 100, save 200 and day/night 900. */
    readonly order: number;
    /**
     * What the option is called, shown as its tooltip and by anything listing what a form offers.
     *
     * It is handed back to the option's own component rather than repeated inside it, so the name an option is
     * listed under and the name it shows on hover cannot drift apart.
     */
    readonly title: string;
    /** The component rendered for the option. */
    readonly Component: ComponentType<IReportViewerOptionProps>;
    /** Whether the option is offered for the given form; it is always offered when omitted. */
    readonly canShow?: (catalogItem: IFormCatalogItem) => boolean;
}

/**
 * Defines a panel rendered at the report viewer's root, alongside the modal, notification and validation managers.
 *
 * A panel is what an option opens when what it opens is not a modal: an off canvas is `position: fixed`, and the
 * options bar is itself `position-fixed` and so a stacking context, which means a panel rendered from inside the
 * bar is ranked only within it however high its z-index. Registering the panel here puts it outside the bar, and
 * lets a package own a panel without the report viewer taking a dependency on that package.
 */
export interface IReportViewerPanel {
    /** Identifies the panel; registering the same id twice throws. */
    readonly id: string;
    /** The component rendered for the panel. It is mounted for as long as the form is, and decides for itself whether it is showing. */
    readonly Component: ComponentType<IReportViewerPanelProps>;
    /** Whether the panel is mounted for the given form; it is always mounted when omitted. */
    readonly canShow?: (catalogItem: IFormCatalogItem) => boolean;
}

/** Defines the props handed to every panel mounted at the report viewer's root. */
export interface IReportViewerPanelProps {
    /** The catalog item the form was loaded from, which carries its identity. */
    readonly catalogItem: IFormCatalogItem;
    /** The controllers belonging to the form the panel acts on. */
    readonly controllers: IControllerManager;
}

/** Defines the props handed to every option rendered in the report viewer's options bar. */
export interface IReportViewerOptionProps extends IReportViewerPanelProps {
    /** The name the option was registered under, which it shows as its tooltip. */
    readonly title: string;
}

/**
 * Defines the model for registering a catalog form with the report viewer. The identity is the one the form
 * registered with the catalog, so a host can resolve a registered form's route back to what the catalog knows
 * about it; the form's status and type are per-instance state and so are no part of a registration.
 */
export interface IFormRegistration extends IFormIdentity {
    /** The route for the form. The route will handle loading/initializing a form. */
    readonly route: IReportViewerRoute;
}

/** Defines a service for registering forms with the report viewer. */
export interface IReportViewerRegistrationService {
    /**
     * Registers a catalog form and the route it is reachable at, which is where the form is loaded and initialized.
     * Only one route may be registered per form name, since a route belongs to a form rather than to one of its versions.
     */
    registerForm: (registration: IFormRegistration) => void;
    /** Registers the reader responsible for supplying report data to load. Only one reader may be registered. */
    registerDataReader: (reader: IFormDataReader) => void;
    /** Registers the writer responsible for persisting saved report data. Only one writer may be registered. */
    registerDataWriter: (writer: IFormDataWriter) => void;
    /**
     * Registers the mapper that translates between the identified catalog form and the data contract it publishes.
     * Only one mapper may be registered per identity, and a form without one simply neither populates nor saves.
     */
    registerMapper: <TForm extends FormModel, TData extends object>(identity: IFormIdentity, mapper: IFormMapper<TForm, TData>) => void;
    /** Registers an option to render in the report viewer's options bar. Only one option may be registered per id. */
    registerOption: (option: IReportViewerOption) => void;
    /** Registers a panel to mount at the report viewer's root, which is where an off canvas belongs. Only one panel may be registered per id. */
    registerPanel: (panel: IReportViewerPanel) => void;
}

@Singleton
export class ReportViewerService implements IReportViewerService, IReportViewerRegistrationService {
    private readonly _dataReader?: IFormDataReader;
    private readonly _dataWriter?: IFormDataWriter;

    private readonly _forms: Map<string, IFormRegistration> = new Map<string, IFormRegistration>();
    private readonly _mappers: Map<string, IFormMapper<FormModel, IReportViewerData>> = new Map<string, IFormMapper<FormModel, IReportViewerData>>();
    private readonly _options: Map<string, IReportViewerOption> = new Map<string, IReportViewerOption>();
    private readonly _panels: Map<string, IReportViewerPanel> = new Map<string, IReportViewerPanel>();

    constructor(
        @IFormCatalogService private readonly formCatalogService: IFormCatalogService,
        @INavigationRegistrationService private readonly navigationRegistrationService: INavigationRegistrationService,
        @IReportViewerOptions private readonly options: IReportViewerOptions) {
    }

    get forms(): Array<IFormRegistration> {
        return Array.from(this._forms.values());
    }

    get isReadOnly(): boolean {
        return this.options.isReadOnly ?? false;
    }

    canSaveForm(identity: IFormIdentity): boolean {
        // save is only offered when the data can both be extracted and be put somewhere; without a writer the
        // extracted data would be discarded and the user still told the report had been saved
        return !!this._dataWriter && !!this.getMapper(identity);
    }

    async getForms(): Promise<Array<IFormRegistration>> {
        return this.forms;
    }

    async getData(context: IFormDataContext): Promise<IReportViewerData | undefined> {
        return this._dataReader ? await this._dataReader.getData(context) : this.options.data;
    }

    getOptions(catalogItem: IFormCatalogItem): Array<IReportViewerOption> {
        return Array.from(this._options.values())
            .filter(option => !option.canShow || option.canShow(catalogItem))
            .sort((a, b) => a.order - b.order);
    }

    getPanels(catalogItem: IFormCatalogItem): Array<IReportViewerPanel> {
        // panels are not ordered: each one positions itself against an edge of the viewport rather than sharing a
        // strip with the others, so there is nothing for an order to mean
        return Array.from(this._panels.values()).filter(panel => !panel.canShow || panel.canShow(catalogItem));
    }

    async loadForm(data: IReportViewerData | undefined, identity?: IFormReportIdentity): Promise<IInitialForm | undefined> {
        const name = identity?.name ?? data?.name;
        if (!name) {
            return undefined;
        }
    
        const catalogItem = await this.formCatalogService.get({ name, version: identity?.version ?? data?.version });
        const Component = await catalogItem.component();
        const formFactory = new catalogItem.formFactory();
        let form = await formFactory.createForm().initialize();

        // the mapper is resolved from the catalog item rather than the requested identity, which may have named no
        // version and so been answered with the latest
        const mapper = this.getMapper(catalogItem);

        if (data && mapper) {
            // a mapper for a form whose pages repeat has to create a page per record the data carries, which it
            // can only do asynchronously; one for a form of fixed pages returns the form itself and this awaits nothing
            form = await mapper.populate(form, data);
        }

        return { catalogItem, form, formFactory, Component };
    }

    async loadFormReport(context: IFormDataContext, identity?: IFormReportIdentity): Promise<IInitialForm | undefined> {
        const data = await this.getData(context);
        return this.loadForm(data, identity);
    }

    async saveForm(form: FormModel, catalogItem: IFormCatalogItem, context: IFormDataContext): Promise<IReportViewerData> {
        const mapper = this.getMapper(catalogItem);
        const values = mapper ? mapper.extract(form) : {};

        // a form model never assigns its own name/version, so the identity is stamped from the catalog item the
        // form was resolved under; without it, saved data could not be resolved back to a form by loadForm.
        const data: IReportViewerData = {
            ...values,
            name: catalogItem.name,
            description: catalogItem.description,
            status: form.status,
            type: form.type,
            version: catalogItem.version
        };

        await this._dataWriter?.saveData(data, context);

        return data;
    }

    registerForm(registration: IFormRegistration): void {
        if (this._forms.has(registration.name)) {
            throw new Error(`A form with the name of ${registration.name} has already been registered with the report viewer.`);
        }

        this.navigationRegistrationService.registerChildRoute("report-viewer", registration.route);
        this._forms.set(registration.name, registration);
    }

    registerDataReader(reader: IFormDataReader): void {
        if (this._dataReader) {
            throw new Error("A data reader has already been registered with the report viewer.");
        }

        (<Mutable<IFormDataReader | undefined>>this._dataReader) = reader;
    }

    registerDataWriter(writer: IFormDataWriter): void {
        if (this._dataWriter) {
            throw new Error("A data writer has already been registered with the report viewer.");
        }

        (<Mutable<IFormDataWriter | undefined>>this._dataWriter) = writer;
    }

    registerMapper<TForm extends FormModel, TData extends object>(identity: IFormIdentity, mapper: IFormMapper<TForm, TData>): void {
        // a mapper is always looked up against a resolved catalog item, which names a concrete version, so a mapper
        // registered without one could never be matched; that would surface as a form that silently refuses to
        // populate or save rather than as an error here.
        if (!identity.version) {
            throw new Error(`A mapper must be registered with the version of the form it maps, but the mapper for ${identity.name} named none.`);
        }

        const key = getMapperKey(identity);

        if (this._mappers.has(key)) {
            throw new Error(`A mapper for the form with the name of ${identity.name} and version ${identity.version} has already been registered with the report viewer.`);
        }

        // each form publishes its own contract, so the registry can only hold them erased; this is the one place the
        // concrete pair is widened, which keeps the cast off every form module's registration.
        this._mappers.set(key, <IFormMapper<FormModel, IReportViewerData>><unknown>mapper);
    }

    registerOption(option: IReportViewerOption): void {
        if (this._options.has(option.id)) {
            throw new Error(`An option with the id of ${option.id} has already been registered with the report viewer.`);
        }

        this._options.set(option.id, option);
    }

    registerPanel(panel: IReportViewerPanel): void {
        if (this._panels.has(panel.id)) {
            throw new Error(`A panel with the id of ${panel.id} has already been registered with the report viewer.`);
        }

        this._panels.set(panel.id, panel);
    }

    /** Gets the mapper registered for the given form, if one was registered. */
    private getMapper(identity: IFormIdentity): IFormMapper<FormModel, IReportViewerData> | undefined {
        return this._mappers.get(getMapperKey(identity));
    }
}

/** Keys a mapper by the form it belongs to. Registration rejects an identity without a version, so both sides of the lookup name a concrete one. */
function getMapperKey({ name, version }: IFormIdentity): string {
    return `${name}@${version}`;
}