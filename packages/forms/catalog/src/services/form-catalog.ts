import { ComponentType } from "react";
import { createService, Singleton } from "@shrub/core";
import { IControllerManager, IFormIdentity, FormFactoryConstructor, FormModel, FormModelConstructor, Schema, SchemaConstructor } from "@forms/core";

export const IFormCatalogService = createService<IFormCatalogService>("forms-catalog-service");
export const IFormCatalogRegistrationService = createService<IFormCatalogRegistrationService>("forms-catalog-registration-service");

/** Defines the props required by a form catalog item's rendering component. */
export interface IFormComponentProps {
    /** The controllers belonging to this form. The form controller owns the form model and is how every edit is applied. */
    readonly controllers: IControllerManager;
    /** When true, the form's editing affordances (add/delete page, drag-and-drop import) should not be offered; individual fields report their own disabled state via `FieldModel.isEnabled`. */
    readonly isReadOnly: boolean;
}

/** Defines a form registered with the form catalog, keyed by name and version. */
export interface IFormCatalogItem<TForm extends FormModel = FormModel, TSchema extends Schema = Schema> {
    readonly name: string;
    readonly description: string;
    readonly version: string;

    /** The form model constructor used to create and build the initial model. */
    readonly ctor: FormModelConstructor<TForm>;
    /** The form schema. Used to define the form model structure. */
    readonly schema: SchemaConstructor<TSchema>;
    /** The form factory. This is used to create the new form model and any additional pages. */
    readonly formFactory: FormFactoryConstructor<TForm>;

    /** The main form component to render the form in the ui. */
    readonly component: () => Promise<ComponentType<IFormComponentProps>>;
}

/** Defines a service for resolving forms registered with the form catalog. */
export interface IFormCatalogService {
    readonly catalogItems: ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>>;
    /** Gets the catalog item matching the given identity, returning its latest version if the identity does not specify one. */
    get(identity: IFormIdentity): Promise<IFormCatalogItem>;
    /** Gets the latest version of every registered catalog item, keyed by name. */
    getLatestVersions(): Promise<Map<string, IFormCatalogItem>>;
}

/** Defines a service for registering forms with the form catalog. */
export interface IFormCatalogRegistrationService {
    registerCatalogItem<TForm extends FormModel, TSchema extends Schema>(catalogItem: IFormCatalogItem<TForm, TSchema>): void;
}

@Singleton
export class FormCatalogService implements IFormCatalogService, IFormCatalogRegistrationService {
    private readonly _catalogItems: Map<string, Map<string, IFormCatalogItem>> = new Map<string, Map<string, IFormCatalogItem>>();

    get catalogItems(): ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>> {
        return this._catalogItems;
    }

    registerCatalogItem<TForm extends FormModel, TSchema extends Schema>(catalogItem: IFormCatalogItem<TForm, TSchema>): void {
        if (!this._catalogItems.has(catalogItem.name)) {
            this._catalogItems.set(catalogItem.name, new Map<string, IFormCatalogItem>());
        }

        const versionMap = this._catalogItems.get(catalogItem.name)!;

        if (versionMap.has(catalogItem.version)) {
            throw new Error(`A form with the name of ${catalogItem.name} and version ${catalogItem.version} has already been registered with the form catalog.`);
        }

        versionMap.set(catalogItem.version, catalogItem as unknown as IFormCatalogItem);
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

    private getVersionMap(name: string): Map<string, IFormCatalogItem> {
        const versionMap = this._catalogItems.get(name);

        if (!versionMap) {
            throw new Error(`Form type with name ${name} not found in catalog.`);
        }

        return versionMap;
    }

    private getLatestVersion(name: string, versionMap: Map<string, IFormCatalogItem>): IFormCatalogItem {
        // versions are sorted descending on read so registration can happen incrementally across modules.
        const latestVersion = Array.from(versionMap.keys()).sort((a, b) => b.localeCompare(a))[0];

        if (!latestVersion) {
            throw new Error(`No versions found for form type with name ${name}.`);
        }

        return versionMap.get(latestVersion)!;
    }
}
