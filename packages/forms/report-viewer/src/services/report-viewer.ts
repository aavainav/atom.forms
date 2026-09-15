import { ComponentType } from "react";
import { IFormCatalogService, IFormComponentProps, IResolvedFormCatalogItem } from "@forms/catalog";
import { FormModel, IControllerManager, IFormIdentity, IModalOptions, IReportData } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

export const IReportViewerService = createService<IReportViewerService>("forms-report-viewer-service");
export const IReportViewerOptionRegistrationService = createService<IReportViewerOptionRegistrationService>("forms-report-viewer-option-registration-service");

/**
 * Defines the host's side of a form's data: where the record the form is populated from comes from, and where the
 * data the form publishes goes back to. It is handed to the report viewer as a prop rather than registered
 * anywhere, so a host holds one per record it is showing rather than one per form.
 */
export interface IReportViewerDataManager<TData extends object = IReportData> {
    /** Reads the host's record and transforms it into the contract the form publishes. */
    read(): Promise<IReadDataResult<TData> | undefined>;
    /** Hands the form's extracted data back to the host. A manager without one leaves the form unsaveable. */
    write?(data: IReportData): Promise<void>;
}

/** Defines what a data manager read. */
export interface IReadDataResult<TData extends object = IReportData> {
    /** The record, in the shape the target form's own contract publishes. */
    readonly data: TData;
    /** Which of `data`'s own fields come back locked rather than editable. */
    readonly readOnlyFields?: ReadonlyArray<keyof TData & string>;
}

/** Describes a form resolved from the form catalog and ready to render. */
export interface IInitialForm {
    /** The catalog item the form was resolved from; printing and violations resolve against this, not the form. */
    readonly catalogItem: IResolvedFormCatalogItem;
    /** The form model -- self-describing: its own mapper, value-list ids and violation list travel with it. */
    readonly form: FormModel<any>;
    /** The component used to render the form. */
    readonly Component: ComponentType<IFormComponentProps>;
}

export interface IReportViewerService {
    /** Gets whether the given form's report data can be extracted, which it can once it carries a mapper. */
    canExtractData: (form: FormModel<any>) => boolean;
    /** Gets whether the given form can be saved, which it can once it carries a mapper and the data manager can write. */
    canSaveForm: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => boolean;
    /**
     * Extracts the report data the given form publishes, stamped with the identity the form model carries. The
     * form's own mapper is what does the extracting. This is the data `saveForm` hands to the data manager,
     * without persisting any of it.
     */
    extractData: (form: FormModel<any>) => IReportData;
    /** Gets the options the given form offers, in the order they are rendered in the options bar. */
    getOptions: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => Array<IReportViewerOption>;
    /**
     * Resolves the identified form from the catalog, builds it, and populates it with whatever the data manager
     * reads, through the form's own mapper. A manager that reads nothing, or a form with no mapper, simply leaves
     * the form as its constructor built it.
     */
    loadForm: <TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>) => Promise<IInitialForm>;
    /**
     * Extracts report data from the given form and hands it to the data manager, if it can write. The data is
     * returned whether or not it was consumed, so a host that persists the data itself can use this too.
     */
    saveForm: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => Promise<IReportData>;
}

/** Describes an option offered in the report viewer's options bar, in the order the bar renders them. */
export interface IReportViewerOption {
    /** Identifies the option; registering the same id twice throws. */
    readonly id: string;
    /** What the option is called, shown as its tooltip and by anything listing what a form offers. */
    readonly title: string;
    /** The component rendered for the option. Every one of them is loaded lazily, so the bar renders them under a suspense boundary. */
    readonly Component: ComponentType<IReportViewerOptionProps>;
    /** Whether the option is offered for the given form; it is always offered when omitted. */
    readonly canShow?: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => boolean;
}

/**
 * Defines a service for registering an option to render in the report viewer's options bar. `ReportViewerModule`
 * is the only thing that calls this today, registering its own six built-ins from its own `configure()` -- the
 * report viewer stays the sole importer of `@forms/violations`/`@forms/printing` rather than having them register
 * up into it, which is what keeps the dependency direction one-way. The seam is public rather than private to that
 * module because it is the natural extension point for a host that wants to add its own option.
 */
export interface IReportViewerOptionRegistrationService {
    /** Registers an option to render in the report viewer's options bar. Registering the same id twice throws. */
    registerOption: (option: IReportViewerOption) => void;
}

/** Defines the props handed to every panel mounted at the report viewer's root. */
export interface IReportViewerPanelProps {
    /** The catalog item the form was loaded from, which carries its identity. */
    readonly catalogItem: IResolvedFormCatalogItem;
    /** The controllers belonging to the form the panel acts on. */
    readonly controllers: IControllerManager;
    /** Reports a failure to the user through the report viewer's own notifications. */
    readonly onError: (message: string) => void;
}

/** Defines the props handed to every option rendered in the report viewer's options bar. */
export interface IReportViewerOptionProps extends IReportViewerPanelProps {
    /** The name the option is offered under, which it shows as its tooltip. */
    readonly title: string;
    /** The data manager the form was rendered with, if any. Save writes through it. */
    readonly dataManager?: IReportViewerDataManager<any>;
    /** Opens a modal at the report viewer's root -- never inside the options bar, which is a stacking context. */
    readonly showModal: (options: IModalOptions) => void;
}

@Singleton
export class ReportViewerService implements IReportViewerService, IReportViewerOptionRegistrationService {
    private readonly options = new Map<string, IReportViewerOption>();

    constructor(@IFormCatalogService private readonly formCatalogService: IFormCatalogService) {
    }

    /** Gets whether the given form's report data can be extracted, which it can once it carries a mapper. */
    canExtractData(form: FormModel<any>): boolean {
        return !!form.mapper;
    }

    // saving needs both halves: a mapper to extract the data and somewhere to hand it to. with a mapper and no
    // writer the data would be extracted, dropped, and the report still reported as saved.
    /** Gets whether the given form can be saved, which it can once it carries a mapper and the data manager can write. */
    canSaveForm(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): boolean {
        return !!form.mapper && !!dataManager?.write;
    }

    extractData(form: FormModel<any>): IReportData {
        const values = form.mapper ? form.mapper.extract(form) : {};

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

    /** Gets the registered options offered for the given form, in the order they were registered. */
    getOptions(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): Array<IReportViewerOption> {
        return Array.from(this.options.values()).filter(option => !option.canShow || option.canShow(form, dataManager));
    }

    async loadForm<TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>): Promise<IInitialForm> {
        const catalogItem = await this.formCatalogService.get(identity);
        let form = await new catalogItem.ctor().initialize();

        const result = await dataManager?.read();

        if (result && form.mapper) {
            // the mapper takes the locked fields as a set because that is what it looks them up in, while the host
            // hands them over as an array because that is what a caller writes
            const readOnlyFields = result.readOnlyFields && new Set<string>(result.readOnlyFields);

            // a mapper for a form whose pages repeat has to create a page per record the data carries, which it
            // can only do asynchronously; one for a form of fixed pages returns the form itself and this awaits nothing
            form = await form.mapper.populate(form, <IReportData><unknown>result.data, readOnlyFields);
        }

        return { catalogItem, form, Component: catalogItem.component };
    }

    registerOption(option: IReportViewerOption): void {
        if (this.options.has(option.id)) {
            throw new Error(`An option with the id of ${option.id} has already been registered with the report viewer.`);
        }

        this.options.set(option.id, option);
    }

    async saveForm(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): Promise<IReportData> {
        const data = this.extractData(form);

        await dataManager?.write?.(data);

        return data;
    }
}
