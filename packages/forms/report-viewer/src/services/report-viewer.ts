import { ComponentType } from "react";
import { getAuditController, AuditRecord } from "@forms/audit";
import { IFormCatalogService, IFormComponentProps, IResolvedFormCatalogItem } from "@forms/catalog";
import { IActor, IControllerManager, IFormIdentity, IModalOptions, IPopulateData, IReportData, FormArrival, FormModel, ReadOnlyFields, RuleIssueCollection } from "@forms/core";
import { getReviewController, IReviewComment } from "@forms/review";
import { IWorkflowService } from "@forms/workflow";
import { createService, Singleton } from "@shrub/core";

export type ReadReason = "open" | "new";

declare module "@forms/core" {
    interface IFormActivityMap {
        /** A preset was applied to the report. `preset` is its id; the fields it changed are worked out from the form. */
        "preset-applied": { readonly preset: string };
    }
}

export const IReportViewerService = createService<IReportViewerService>("forms-report-viewer-service");
export const IReportViewerOptionRegistrationService = createService<IReportViewerOptionRegistrationService>("forms-report-viewer-option-registration-service");

/**
 * The host's side of a form's data: where a record comes from, and where the form's published data goes back to.
 * Handed to the report viewer as a prop rather than registered, so a host holds one per record, not one per form.
 */
export interface IReportViewerDataManager<TData extends object = IReportData> {
    /** Deletes a preset the user saved. Without it a personal preset cannot be deleted. */
    deletePreset?(id: string): Promise<void>;
    /**
     * Reads the host's record into the form's own contract. Called with `"open"` on a first load and `"new"` when
     * resetting to a blank form, from `template` when the user picked one -- a manager whose data isn't tied to a
     * specific record can ignore both.
     */
    read(reason: ReadReason, template?: string): Promise<IReadDataResult<TData> | undefined>;
    /** Lists the presets a user can apply to the report they are writing, data and all. Without it the presets option is not offered. */
    readPresets?(): Promise<ReadonlyArray<IReportPreset<TData>>>;
    /** Lists the templates a new report can start from. Without it, only the form's own default is offered. */
    readTemplates?(): Promise<ReadonlyArray<IReportTemplate>>;
    /** Hands the form's extracted data back to the host when the report is saved, unless the host has a `writeBundle`. A manager with neither leaves the form unsaveable. */
    write?(data: IReportData): Promise<void>;
    /** Hands the audit records raised since the last write back to the host, after each settled batch of them. Append-only: the host adds them to what it holds, matching by id, and is never handed a record twice once it has taken it. */
    writeAudit?(records: ReadonlyArray<AuditRecord>): Promise<void>;
    /** Hands the whole report back to the host in one call when it is saved, in place of `write`. For a host that keeps a report as one document. */
    writeBundle?(bundle: IReportBundle): Promise<void>;
    /** Hands the review comments back to the host each time one is added, resolved or reopened, all of them each time. They are review metadata, never part of what `write` receives. */
    writeComments?(comments: ReadonlyArray<IReviewComment>): Promise<void>;
    /** Keeps a preset the user saved from the report, and may refuse by throwing. Without it the panel offers no way to save one. */
    writePreset?(preset: IReportPreset<TData>): Promise<void>;
}

/** What a data manager's `read` returns: the record, and everything else the host holds for it, in one object. */
export interface IReadDataResult<TData extends object = IReportData> extends IPopulateData<TData> {
    /** The audit history of the report, for the history to carry on from. Shown, never written back. */
    readonly audit?: ReadonlyArray<AuditRecord>;
    /** The review comments made on the report. */
    readonly comments?: ReadonlyArray<IReviewComment>;
}

/** Data the user can apply to the report they are writing. */
export interface IReportPreset<TData extends object = IReportData> {
    /** What the preset sets, in the form's own contract. A list of pages is paired with the report's by position. */
    readonly data: Partial<TData>;
    /** Says a little more about what the preset sets, shown under its title. */
    readonly description?: string;
    /** The heading the preset is listed under in the panel. */
    readonly group?: string;
    /** Identifies the preset, and is what the audit records when it is applied. */
    readonly id: string;
    /** One the current user saved, listed under "My presets" and open to being deleted. */
    readonly isPersonal?: boolean;
    /** Which of `data` the host considers settled: applying the preset locks them. A personal preset never has any. */
    readonly readOnlyFields?: ReadOnlyFields<TData>;
    /** What the preset is called in the panel. */
    readonly title: string;
}

/** A starting point the host offers for a new report; the data behind it comes from `read`. */
export interface IReportTemplate {
    /** Says a little more about what the template starts a report with, shown under its title. */
    readonly description?: string;
    /** The heading the template is listed under in the picker. */
    readonly group?: string;
    /** Identifies the template, and is what `read` is given when it is picked. */
    readonly id: string;
    /** Replaces the form's own default as what a new report starts from, hiding it, and is preselected in the picker. At most one. */
    readonly isDefault?: boolean;
    /** What the template is called in the picker. */
    readonly title: string;
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
    /** Whether the host had a record to give, or the form was built without one. */
    readonly hasRecord: boolean;
    /** Why the host was asked: `open` for a first load, `new` for starting a new form. */
    readonly reason: ReadReason;
    /** The template a new form was started from, if the user picked one. */
    readonly template?: string;
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
    /** Extracts the form's published data, unpersisted -- what `save` sends to the data manager. */
    extractData: (form: FormModel<any>) => IReportData;
    /** How a loaded form arrived, for the audit to say of it: read from a record the host held, or started without one, from the template the user picked if they did. A new form is started even when the host gave it defaults to start from. */
    getArrival: (initialForm: IInitialForm) => FormArrival;
    /** Gathers everything held about the report -- its data, the audit history and the review comments -- into one object, unpersisted. */
    getBundle: (form: FormModel<any>, controllers: IControllerManager) => IReportBundle;
    /** The form's options, in the order the bar renders them. */
    getOptions: (form: FormModel<any>, dataManager?: IReportViewerDataManager<any>) => Array<IReportViewerOption>;
    /**
     * Resolves, builds and populates the identified form. `reason` and `template` pass through to the data manager --
     * `"open"` for a first load, `"new"` for a reset, from the template the user picked if they did. Nothing to
     * populate leaves the form as its constructor built it.
     */
    loadForm: <TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>, reason?: ReadReason, template?: string) => Promise<IInitialForm>;
    /**
     * Puts a loaded form in place of the one the controllers hold, with the history the host held for it. How it
     * arrived is said first, so the audit records it as the form goes in.
     */
    openForm: (controllers: IControllerManager, initialForm: IInitialForm) => void;
    /**
     * Puts the audit history and the comments the host held for the report into the controllers, in place of any held
     * before. `openForm` does this as it swaps a form in; a form rendered for the first time is given its history here.
     */
    restoreHistory: (controllers: IControllerManager, initialForm: IInitialForm) => void;
    /**
     * Saves the report as it stands: writes it a revision on, puts the saved form in the controllers clean, and tells
     * the audit. A data manager that has a `writeBundle` is given the whole bundle in one call, the audit history and
     * the comments with the data, instead of the data alone. Rejects with what went wrong, after telling the audit it
     * failed, leaving the report as it was. Rejects too when the host cannot write.
     */
    save: (controllers: IControllerManager, dataManager?: IReportViewerDataManager<any>) => Promise<void>;
    /**
     * Makes the transition on the report and, when the host can write, saves the result: both happen or neither does.
     * The report is replaced with the result and the audit is told, and it moves in memory only when there is no
     * host to write to. Rejects with what went wrong -- the transition refused, or the save failed -- leaving the report as it was.
     */
    transition: (controllers: IControllerManager, id: string, by: IActor, issues: RuleIssueCollection, dataManager?: IReportViewerDataManager<any>) => Promise<void>;
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
    /** Who is using the report, which a change to it is attributed to. Without one a transition cannot be made. */
    readonly user?: IActor;

    /** Opens a modal at the report viewer's root -- never inside the options bar, which is a stacking context. */
    readonly showModal: (options: IModalOptions) => void;
}

@Singleton
export class ReportViewerService implements IReportViewerService, IReportViewerOptionRegistrationService {
    private readonly options = new Map<string, IReportViewerOption>();

    constructor(
        @IFormCatalogService private readonly formCatalogService: IFormCatalogService,
        @IWorkflowService private readonly workflowService: IWorkflowService) {
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

    getArrival({ audit, comments, form, hasRecord, reason, template }: IInitialForm): FormArrival {
        const formId = form.id ?? "";

        return hasRecord && reason === "open"
            ? { kind: "loaded", formId, auditRecords: audit?.length ?? 0, comments: comments?.length ?? 0, transitions: form.history.length }
            : { kind: "started", formId, reason, ...(template ? { template } : {}) };
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

    async loadForm<TData extends object>(identity: IFormIdentity, dataManager?: IReportViewerDataManager<TData>, reason: ReadReason = "open", template?: string): Promise<IInitialForm> {
        const catalogItem = await this.formCatalogService.get(identity);
        const result = await dataManager?.read(reason, template);
        const record = result?.data as IReportData | undefined;
        let form = await new catalogItem.ctor(record?.id, record?.revision).initialize();

        if (result) {
            form = await form.populate(<IPopulateData<IReportData>>result);

            // populate no longer restores a record's status or workflow history itself -- that's the workflow
            // service's job, run here as an explicit second step so a loaded record arrives with the lock its
            // status carries already applied. Safe for a form with no workflow too: the service only sets the
            // status (which the watermark reads regardless) and applies no lock when there is none to apply.
            form = this.workflowService.restoreWorkflow(form, result.status, result.workflow);
        }

        return { audit: result?.audit, catalogItem, comments: result?.comments, form: form.clean(), hasRecord: !!result, reason, template, Component: catalogItem.component };
    }

    openForm(controllers: IControllerManager, initialForm: IInitialForm): void {
        // said before the form goes in, which is when the audit records how it arrived
        controllers.setArrival(this.getArrival(initialForm));
        controllers.getFormController().setForm(initialForm.form);
        this.restoreHistory(controllers, initialForm);
    }

    registerOption(option: IReportViewerOption): void {
        if (this.options.has(option.id)) {
            throw new Error(`An option with the id of ${option.id} has already been registered with the report viewer.`);
        }

        this.options.set(option.id, option);
    }

    restoreHistory(controllers: IControllerManager, initialForm: IInitialForm): void {
        // what was held for the last report goes with it
        getAuditController(controllers).load(initialForm.audit ?? []);
        getReviewController(controllers).load(initialForm.comments ?? []);
    }

    async save(controllers: IControllerManager, dataManager?: IReportViewerDataManager<any>): Promise<void> {
        const formController = controllers.getFormController();

        if (!this.canSaveForm(formController.form, dataManager)) {
            throw new Error("The host cannot keep reports.");
        }

        // the form controller owns the current model and replaces it on every edit, so it is read now
        await this.persist(formController.form.incrementRevision(), controllers, dataManager);
        // the form as it is now, so what was typed while the save was under way is kept
        formController.update({ update: now => now.incrementRevision().clean() });
        // the audit reads the revision off the form it watches, so the saved form goes in first
        getAuditController(controllers).recordSaved();
    }

    async transition(controllers: IControllerManager, id: string, by: IActor, issues: RuleIssueCollection, dataManager?: IReportViewerDataManager<any>): Promise<void> {
        const formController = controllers.getFormController();
        // the form controller owns the current model and replaces it on every edit, so it is read now
        let next = this.workflowService.transition(formController.form, id, by, { issues, openComments: getReviewController(controllers).openCount });
        const isSaved = this.canSaveForm(next, dataManager);

        if (isSaved) {
            next = next.incrementRevision();
            await this.persist(next, controllers, dataManager);
        }

        // the audit records the transition as the form is replaced, and then the save that kept it
        formController.update({ update: () => next.clean() });

        if (isSaved) {
            getAuditController(controllers).recordSaved();
        }
    }

    /** Writes the form to the host, telling the audit when it could not. */
    private async persist(form: FormModel<any>, controllers: IControllerManager, dataManager?: IReportViewerDataManager<any>): Promise<void> {
        try {
            const data = this.extractData(form);

            if (dataManager?.writeBundle) {
                await dataManager.writeBundle({ ...this.getBundle(form, controllers), data });
            }
            else {
                await dataManager?.write?.(data);
            }
        }
        catch (error) {
            getAuditController(controllers).recordSaveFailed();
            throw error instanceof Error ? error : new Error("The report could not be saved.");
        }
    }
}
