import { ComponentType } from "react";
import { createService, Singleton } from "@shrub/core";
import { IControllerManager, IFormIdentity, FormModel, FormModelConstructor, FormType, Schema, SchemaConstructor } from "@forms/core";

export const IFormCatalogService = createService<IFormCatalogService>("forms-catalog-service");
export const IFormCatalogRegistrationService = createService<IFormCatalogRegistrationService>("forms-catalog-registration-service");

/** Defines the props required by a form catalog item's rendering component. */
export interface IFormComponentProps {
    /** The controllers belonging to this form. The form controller owns the form model and is how every edit is applied. */
    readonly controllers: IControllerManager;
    /** When true, the form's editing affordances (add/delete page, drag-and-drop import) should not be offered; individual fields report their own disabled state via `FieldModel.isEnabled`. */
    readonly isReadOnly: boolean;
}

/**
 * A form registered with the catalog, keyed by name and version -- the cheap, always-available half of a form's
 * registration. Nothing about the form's own code (model, schema, component) is imported until `load()` is called.
 */
export interface IFormCatalogItem {
    readonly name: string;
    readonly description: string;
    readonly type: FormType;
    readonly version: string;

    /**
     * Loads this form's own code and builds its schema. Called at most once per identity -- `get` caches the
     * returned promise, so a form already opened is never re-loaded or rebuilt.
     */
    readonly load: () => Promise<ILoadedFormCatalogItem>;
}

/** What loading a catalog item's own code resolves to -- everything needed to construct and render one instance of the form. */
export interface ILoadedFormCatalogItem<TForm extends FormModel<any> = FormModel<any>, TSchema extends Schema = Schema> {
    /** The form model constructor used to create a new, uninitialized instance of the form. */
    readonly ctor: FormModelConstructor<TForm>;
    /** The form schema constructor. Constructing it builds the form's whole definition tree. */
    readonly schema: SchemaConstructor<TSchema>;
    /** The main form component to render the form in the ui. */
    readonly component: ComponentType<IFormComponentProps>;
}

/** A registered catalog item together with what loading it resolved to. */
export type IResolvedFormCatalogItem = IFormCatalogItem & ILoadedFormCatalogItem;

/** Defines a service for resolving forms registered with the form catalog. */
export interface IFormCatalogService {
    readonly catalogItems: ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>>;
    /**
     * Gets the catalog item matching the identity, defaulting to its latest version. Loads and caches the form's
     * code on first request, so opening it again never re-runs `load()`.
     */
    get(identity: IFormIdentity): Promise<IResolvedFormCatalogItem>;
    /** Gets the latest version of every registered catalog item, keyed by name. Never loads any form's own code -- safe to call to list what's available. */
    getLatestVersions(): Promise<Map<string, IFormCatalogItem>>;
}

/** Defines a service for registering a form with the form catalog. */
export interface IFormCatalogRegistrationService {
    registerCatalogItem(catalogItem: IFormCatalogItem): void;
}

@Singleton
export class FormCatalogService implements IFormCatalogService, IFormCatalogRegistrationService {
    private readonly _catalogItems: Map<string, Map<string, IFormCatalogItem>> = new Map<string, Map<string, IFormCatalogItem>>();
    private readonly _resolved: Map<string, Promise<IResolvedFormCatalogItem>> = new Map<string, Promise<IResolvedFormCatalogItem>>();

    get catalogItems(): ReadonlyMap<string, ReadonlyMap<string, IFormCatalogItem>> {
        return this._catalogItems;
    }

    async get(identity: IFormIdentity): Promise<IResolvedFormCatalogItem> {
        const catalogItem = await this.getRegistered(identity);
        const key = this.getCatalogItemKey(catalogItem);

        let resolved = this._resolved.get(key);

        if (!resolved) {
            // the promise is cached rather than the resolved value, so a form opened twice in quick succession
            // shares one load, and `load()`'s own schema construction never runs more than once
            resolved = catalogItem.load().then(loaded => ({ ...catalogItem, ...loaded }));
            this._resolved.set(key, resolved);
        }

        return resolved;
    }

    async getLatestVersions(): Promise<Map<string, IFormCatalogItem>> {
        const latestVersions = new Map<string, IFormCatalogItem>();

        this._catalogItems.forEach((versionMap, name) => {
            latestVersions.set(name, this.getLatestVersion(name, versionMap));
        });

        return latestVersions;
    }

    registerCatalogItem(catalogItem: IFormCatalogItem): void {
        if (!this._catalogItems.has(catalogItem.name)) {
            this._catalogItems.set(catalogItem.name, new Map<string, IFormCatalogItem>());
        }

        const versionMap = this._catalogItems.get(catalogItem.name)!;

        if (versionMap.has(catalogItem.version)) {
            throw new Error(`A form with the name of ${catalogItem.name} and version ${catalogItem.version} has already been registered with the form catalog.`);
        }

        versionMap.set(catalogItem.version, catalogItem);
    }

    private async getRegistered({ name, version }: IFormIdentity): Promise<IFormCatalogItem> {
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

    /** Keys a catalog item by its own name and version, for the resolved-item cache. */
    private getCatalogItemKey({ name, version }: IFormCatalogItem): string {
        return `${name}@${version}`;
    }
}