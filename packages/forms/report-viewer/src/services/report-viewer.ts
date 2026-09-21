import { ComponentType } from "react";
import { getAuditController, AuditRecord } from "@forms/audit";
import { IFormCatalogService, IFormComponentProps, IResolvedFormCatalogItem } from "@forms/catalog";
import { IControllerManager, IFormIdentity, IModalOptions, IPopulateData, IReportData, FormModel } from "@forms/core";
import { getReviewController, IReviewComment } from "@forms/review";
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
    /** Hands the form's extracted data back to the host when the report is saved, unless the host has a `writeBundle`. A manager with neither leaves the form unsaveable. */
    write?(data: IReportData): Promise<void>;
    /** Hands the audit records raised since the last write back to the host, after each settled batch of them. Append-only: the host adds them to what it holds, matching by id, and is never handed a record twice once it has taken it. */
    writeAudit?(records: ReadonlyArray<AuditRecord>): Promise<void>;
    /** Hands the whole report back to the host in one call when it is saved, in place of `write`. For a host that keeps a report as one document. */
    writeBundle?(bundle: IReportBundle): Promise<void>;
    /** Hands the review comments back to the host each time one is added, resolved or reopened, all of them each time. They are review metadata, never part of what `write` receives. */
    writeComments?(comments: ReadonlyArray<IReviewComment>): Promise<void>;
}

/** What a data manager's `read` returns: the record, and everything else the host holds for it, in one object. */
export interface IReadDataResult<TData extends object = IReportData> extends IPopulateData<TData> {
    /** The audit history of the report, for the history to carry on from. Shown, never written back. */
    readonly audit?: ReadonlyArray<AuditRecord>;
    /** The review comments made on the report. */
    readonly comments?: ReadonlyArray<IReviewComment>;
}

/** Everything the report viewer holds about a report, as one object: what a host is handed to keep it as a document, or to export it. */
export interface IReportBundle {
    /** The audit history: what was loaded for the report, then what has been raised since. */
    readonly audit: ReadonlyArray<AuditRecord>;
    /** Every review comment. */
    readonly comments: ReadonlyArray<IReviewComment>;
    /** The report's data, with the identity and status stamped on it, as `write` receives it. */
    readonly data: IReportData;
    /** When the bundle was made, in milliseconds since the epoch. */
    readonly exportedAt: number;
    /** The shape of the bundle, for a host reading one back to tell which it is. */
    readonly version: 1;
}

/** Describes a form resolved from the form catalog and ready to render. */
export interface IInitialForm {
    /** The audit history the host held for the report, if any. */
    readonly audit?: ReadonlyArray<AuditRecord>;
    /** The catalog item the form was resolved from; printing and violations resolve against this, not the form. */
    readonly catalogItem: IResolvedFormCatalogItem;
    /** The review comments the host held for the report, if any. */
    readonly comments?: ReadonlyArray<IReviewComment>;
    /** The form model -- self-describing: its own mapper, value-list ids and violation list travel with it. */
    readonly form: FormModel<any>;
    /** The component used to render the form. */
    readonly Component: ComponentType<IFormComponentProps>;
}

export interface IReportViewerService {
    /** Whether the form's data can be extracted -- true once it carries a mapper. */
    canExtractData: (form: FormModel<any>) => boolean;
    /** Whether the form has review to show: a reviewable form always does, an editable one only when the host can keep comments for its officer to resolve, and a viewable one never. */
    canReview: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => boolean;
    /** Whether the form can be saved -- true once it carries a mapper and the data manager can write, by `write` or `writeBundle`. */
    canSaveForm: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => boolean;
    /** Extracts the form's published data, unpersisted -- what `saveForm` sends to the data manager. */
    extractData: (form: FormModel<any>) => IReportData;
    /** Gathers everything held about the report -- its data, the audit history and the review comments -- into one object, unpersisted. */
    getBundle: (form: FormModel<any>, controllers: IControllerManager) => IReportBundle;
    /** The form's options, in the order the bar renders them. */
    getOptions: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => Array<IReportViewerOption>;
    /**
     * Resolves, builds and populates the identified form. `reason` passes through to the data manager -- `"open"`
     * for a first load, `"new"` for a reset. Nothing to populate leaves the form as its constructor built it.
     */
    loadForm: <TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>, reason?: ReadReason) => Promise<IInitialForm>;
    /**
     * Extracts the form's data and hands it to the data manager, if it can write. Returned either way, so a host that
     * persists it itself can reuse this. With the controllers, and a data manager that has a `writeBundle`, the whole
     * bundle is written in one call instead; without them only the data can be, so `write` is used.
     */
    saveForm: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>, controllers?: IControllerManager) => Promise<IReportData>;
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

    canReview(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): boolean {
        return form.mode === "reviewable" || (form.mode === "editable" && (!!dataManager?.writeComments || !!dataManager?.writeBundle));
    }

    canSaveForm(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>): boolean {
        return !!form.mapper && (!!dataManager?.write || !!dataManager?.writeBundle);
    }

    extractData(form: FormModel<any>): IReportData {
        return form.extractData();
    }

    getBundle(form: FormModel<any>, controllers: IControllerManager): IReportBundle {
        return {
            audit: getAuditController(controllers).history,
            comments: getReviewController(controllers).comments,
            data: this.extractData(form),
            exportedAt: Date.now(),
            version: 1
        };
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

        return { audit: result?.audit, catalogItem, comments: result?.comments, form: form.clean(), Component: catalogItem.component };
    }

    registerOption(option: IReportViewerOption): void {
        if (this.options.has(option.id)) {
            throw new Error(`An option with the id of ${option.id} has already been registered with the report viewer.`);
        }

        this.options.set(option.id, option);
    }

    async saveForm(form: FormModel<any>, dataManager?: IReportViewerDataManager<any>, controllers?: IControllerManager): Promise<IReportData> {
        const data = this.extractData(form);

        if (dataManager?.writeBundle && controllers) {
            await dataManager.writeBundle({ ...this.getBundle(form, controllers), data });
        }
        else {
            await dataManager?.write?.(data);
        }

        return data;
    }
}
