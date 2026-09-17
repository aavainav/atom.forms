import { ComponentType } from "react";
import { IFormCatalogService, IFormComponentProps, IResolvedFormCatalogItem } from "@forms/catalog";
import { IControllerManager, IFormIdentity, IModalOptions, IPopulateData, IReportData, FormModel } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

export type ReadReason = "open" | "new";

export const IReportViewerService = createService<IReportViewerService>("forms-report-viewer-service");
export const IReportViewerOptionRegistrationService = createService<IReportViewerOptionRegistrationService>("forms-report-viewer-option-registration-service");

/**
 * The host's side of a form's data: where a record comes from, and where the form's published data goes back to.
 * Handed to the report viewer as a prop rather than registered, so a host holds one per record, not one per form.
 */
export interface IReportViewerDataManager<TData extends object = IReportData> {
    /**
     * Reads the host's record into the form's own contract. Called with `"open"` on a first load and `"new"` when
     * resetting to a blank form -- a manager whose data isn't tied to a specific record can ignore which one it gets.
     */
    read(reason: ReadReason): Promise<IReadDataResult<TData> | undefined>;
    /** Hands the form's extracted data back to the host. A manager without one leaves the form unsaveable. */
    write?(data: IReportData): Promise<void>;
}

/** What a data manager's `read` returns. */
export type IReadDataResult<TData extends object = IReportData> = IPopulateData<TData>;

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
    /** Whether the form's data can be extracted -- true once it carries a mapper. */
    canExtractData: (form: FormModel<any>) => boolean;
    /** Whether the form can be saved -- true once it carries a mapper and the data manager can write. */
    canSaveForm: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => boolean;
    /** Extracts the form's published data, unpersisted -- what `saveForm` sends to the data manager. */
    extractData: (form: FormModel<any>) => IReportData;
    /** The form's options, in the order the bar renders them. */
    getOptions: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => Array<IReportViewerOption>;
    /**
     * Resolves, builds and populates the identified form. `reason` passes through to the data manager -- `"open"`
     * for a first load, `"new"` for a reset. Nothing to populate leaves the form as its constructor built it.
     */
    loadForm: <TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>, reason?: ReadReason) => Promise<IInitialForm>;
    /** Extracts the form's data and hands it to the data manager, if it can write. Returned either way, so a host that persists it itself can reuse this. */
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
 * Registers an option to render in the report viewer's options bar. `ReportViewerModule` registers its own
 * built-ins here, keeping `@forms/violations`/`@forms/printing` from registering up into this package. Public
 * since it's also how a host adds its own option.
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

    canExtractData(form: FormModel<any>): boolean {
        return !!form.mapper;
    }

    canSaveForm(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): boolean {
        return !!form.mapper && !!dataManager?.write;
    }

    extractData(form: FormModel<any>): IReportData {
        return form.extractData();
    }

    getOptions(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): Array<IReportViewerOption> {
        return Array.from(this.options.values()).filter(option => !option.canShow || option.canShow(form, dataManager));
    }

    async loadForm<TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>, reason: ReadReason = "open"): Promise<IInitialForm> {
        const catalogItem = await this.formCatalogService.get(identity);
        let form = await new catalogItem.ctor().initialize();

        const result = await dataManager?.read(reason);

        if (result) {
            form = await form.populate(<IPopulateData<IReportData>>result);
        }

        return { catalogItem, form: form.clean(), Component: catalogItem.component };
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
