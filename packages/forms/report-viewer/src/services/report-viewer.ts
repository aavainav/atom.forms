import { ComponentType } from "react";
import { IFormCatalogItem, IFormComponentProps, IFormDataContext } from "@forms/catalog";
import { FormFactory, FormModel, IControllerManager, IFormIdentity, IReportViewerData } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { IReportViewerOptions } from "../options";

export const IReportViewerService = createService<IReportViewerService>("forms-report-viewer-service");
export const IReportViewerRegistrationService = createService<IReportViewerRegistrationService>("forms-report-viewer-registration-service");

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

export interface IReportViewerService {
    /** Gets whether forms should render read-only by default, from the module options/settings. */
    readonly isReadOnly: boolean;
    /** Gets whether the given catalog item's report data can be extracted, which it can once it carries a mapper. */
    canExtractData: (catalogItem: IFormCatalogItem) => boolean;
    /** Gets whether the given catalog item's form can be saved, which it can once it carries both a mapper and a data writer. */
    canSaveForm: (catalogItem: IFormCatalogItem) => boolean;
    /**
     * Extracts the report data the given form publishes, stamped with the identity the form model carries. The
     * catalog item's mapper is what does the extracting. This is the data `saveForm` hands to the catalog item's
     * data writer, without persisting any of it.
     */
    extractData: (form: FormModel, catalogItem: IFormCatalogItem) => IReportViewerData;
    /** Gets the options registered for the given form, in the order they are rendered in the options bar. */
    getOptions: (catalogItem: IFormCatalogItem) => Array<IReportViewerOption>;
    /** Gets the panels registered for the given form, which are mounted at the report viewer's root. */
    getPanels: (catalogItem: IFormCatalogItem) => Array<IReportViewerPanel>;
    /**
     * Builds the given catalog item's form and populates it with `data`, via the catalog item's own mapper.
     * `readOnlyFields` names which of the data's own fields should come back locked rather than editable, and is
     * meaningful only when the catalog item's mapper has wired those fields up for locking (see `FormMapper.write`).
     */
    loadForm: (catalogItem: IFormCatalogItem, data: IReportViewerData | undefined, readOnlyFields?: ReadonlySet<string>) => Promise<IInitialForm>;
    /**
     * Resolves the report data for the given context through the catalog item's own data reader, and loads the
     * item's form populated with it. When the reader has nothing to load, falls back to its `getDefaultData` so a
     * newly created record starts with whatever defaults the catalog item's reader has configured, locking
     * whichever of them it named.
     */
    loadFormReport: (catalogItem: IFormCatalogItem, context: IFormDataContext) => Promise<IInitialForm>;
    /**
     * Extracts report data from the given form and hands it to the catalog item's data writer, if it has one. The
     * data is returned whether or not a writer consumed it, so a host that persists the data itself can use this too.
     */
    saveForm: (form: FormModel, catalogItem: IFormCatalogItem, context: IFormDataContext) => Promise<IReportViewerData>;
}

/** Defines an option rendered in the report viewer's options bar. */
export interface IReportViewerOption {
    /** Identifies the option; registering the same id twice throws. */
    readonly id: string;
    /** Where the option sits in the bar, ascending. The report viewer's own are validate 100, save 200 and day/night 900. */
    readonly order: number;
    /** What the option is called, shown as its tooltip and by anything listing what a form offers. */
    readonly title: string;
    /** The component rendered for the option. */
    readonly Component: ComponentType<IReportViewerOptionProps>;
    /** Whether the option is offered for the given form; it is always offered when omitted. */
    readonly canShow?: (catalogItem: IFormCatalogItem) => boolean;
}

/** Defines a panel rendered at the report viewer's root, alongside the modal, notification and validation managers. */
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

/** Defines a service for registering forms with the report viewer. */
export interface IReportViewerRegistrationService {
    /** Registers an option to render in the report viewer's options bar. Only one option may be registered per id. */
    registerOption: (option: IReportViewerOption) => void;
    /** Registers a panel to mount at the report viewer's root, which is where an off canvas belongs. Only one panel may be registered per id. */
    registerPanel: (panel: IReportViewerPanel) => void;
}

@Singleton
export class ReportViewerService implements IReportViewerService, IReportViewerRegistrationService {
    private readonly _options: Map<string, IReportViewerOption> = new Map<string, IReportViewerOption>();
    private readonly _panels: Map<string, IReportViewerPanel> = new Map<string, IReportViewerPanel>();

    constructor(@IReportViewerOptions private readonly options: IReportViewerOptions) {
    }

    get isReadOnly(): boolean {
        return this.options.isReadOnly ?? false;
    }

    canExtractData(catalogItem: IFormCatalogItem): boolean {
        return !!catalogItem.mapper;
    }

    canSaveForm(catalogItem: IFormCatalogItem): boolean {
        // save is only offered when the data can both be extracted and be put somewhere; without a writer the
        // extracted data would be discarded and the user still told the report had been saved
        return !!catalogItem.mapper && !!catalogItem.dataWriter;
    }

    extractData(form: FormModel, catalogItem: IFormCatalogItem): IReportViewerData {
        const values = catalogItem.mapper ? catalogItem.mapper.extract(form) : {};

        // a form model declares the identity it is registered under and stamps it on itself, so the whole of
        // IForm comes off the form; without it, saved data could not be resolved back to a form by loadForm.
        return {
            ...values,
            name: form.name,
            description: form.description,
            status: form.status,
            type: form.type,
            version: form.version
        };
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

    async loadForm(catalogItem: IFormCatalogItem, data: IReportViewerData | undefined, readOnlyFields?: ReadonlySet<string>): Promise<IInitialForm> {
        const Component = await catalogItem.component();
        const formFactory = new catalogItem.formFactory();
        let form = await formFactory.createForm().initialize();

        if (data && catalogItem.mapper) {
            // a mapper for a form whose pages repeat has to create a page per record the data carries, which it
            // can only do asynchronously; one for a form of fixed pages returns the form itself and this awaits nothing
            form = await catalogItem.mapper.populate(form, data, readOnlyFields);
        }

        return { catalogItem, form, formFactory, Component };
    }

    async loadFormReport(catalogItem: IFormCatalogItem, context: IFormDataContext): Promise<IInitialForm> {
        const data = await catalogItem.dataReader?.getData(context);
        if (data) {
            return this.loadForm(catalogItem, data);
        }

        const defaults = await catalogItem.dataReader?.getDefaultData?.(context);
        return this.loadForm(catalogItem, defaults?.data, defaults?.readOnlyFields);
    }

    async saveForm(form: FormModel, catalogItem: IFormCatalogItem, context: IFormDataContext): Promise<IReportViewerData> {
        const data = this.extractData(form, catalogItem);

        await catalogItem.dataWriter?.saveData(data, context);

        return data;
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
}
