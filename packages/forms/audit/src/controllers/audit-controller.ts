import { EventEmitter, IEvent, IEventListener } from "@common/event-emitter";
import { Controller, ControllerKey, FormModel, IController, IControllerChangedEventArgs, IControllerManager, IPrintController, IRulesController, RegisterController } from "@forms/core";

import { AuditRecord, AuditRecordDetail, IAuditFormIdentity } from "../models/audit-record";
import { getChangedPaths } from "../utils/changed-paths";

/** How long a form must sit idle, in milliseconds, before its edits are recorded together. */
export const editQuietPeriod = 1500;

/** The most records held for the next listener while nothing is listening; the oldest are dropped. */
export const maxPendingRecords = 100;

/** The form being watched, as last seen. */
interface IWatchedForm {
    readonly form: FormModel<any>;
    readonly identity: IAuditFormIdentity;
}

/** Defines the controller that turns what happens to a form into records. */
export interface IAuditController extends IController {
    /** Raised for each record. Any raised while nothing listens are held for the next listener. */
    readonly onRecord: IEvent<AuditRecord>;

    /** Records any edits still waiting out the quiet period. */
    flush(): void;
    /** Records that the form was saved. */
    recordSaved(): void;
    /** Records that saving the form failed. */
    recordSaveFailed(): void;
}

/**
 * Watches the form, rules and print controllers and records what they report. Eager, so it misses nothing.
 * Edits are found by diffing the mapper's extract, so a form with no mapper goes unrecorded.
 */
@RegisterController("audit", { eager: true })
export class AuditController extends Controller implements IAuditController {
    private readonly _record = new EventEmitter<AuditRecord>(`${this.key}:record`, { onFirstListenerAdd: () => this.deliverPending() });

    private baseline?: unknown;
    private editTimer?: ReturnType<typeof setTimeout>;
    private isPrinting = false;
    private listener?: IEventListener;
    private pending: Array<AuditRecord> = [];
    private watched?: IWatchedForm;

    get onRecord(): IEvent<AuditRecord> {
        return this._record.event;
    }

    public dispose(): void {
        this.flush();

        this.listener?.remove();
        this.listener = undefined;
        this.pending = [];
    }

    public flush(): void {
        if (this.editTimer === undefined || !this.watched) {
            return;
        }

        clearTimeout(this.editTimer);
        this.editTimer = undefined;

        const after = this.watched.form.mapper?.extract(this.watched.form);
        const fields = getChangedPaths(this.baseline, after);

        // the next diff starts here
        this.baseline = after;

        if (fields.length) {
            this.raise({ kind: "fields-edited", fields });
        }
    }

    public recordSaved(): void {
        this.flush();
        this.raise({ kind: "saved" });
    }

    public recordSaveFailed(): void {
        this.flush();
        this.raise({ kind: "save-failed" });
    }

    public start(): void {
        this.listener = this.manager.onControllerChanged(event => this.observe(event));
        this.open(this.manager.getFormController().form);
    }

    private deliverPending(): void {
        const held = this.pending;
        this.pending = [];

        for (const record of held) {
            this._record.emit(record);
        }
    }

    private observe(event: IControllerChangedEventArgs): void {
        switch (event.key) {
            case ControllerKey.form:
                this.observeForm();
                break;
            case ControllerKey.print:
                this.observePrint(event.controller as IPrintController);
                break;
            case ControllerKey.rules:
                this.observeRules(event.controller as IRulesController);
                break;
        }
    }

    private observeForm(): void {
        const form = this.manager.getFormController().form;

        if (!this.watched) {
            return;
        }

        // a different form replaced the watched one
        if (form.id !== this.watched.identity.id) {
            this.flush();
            this.open(form);
            return;
        }

        // the manager announcing the form we started on
        if (form === this.watched.form) {
            return;
        }

        this.watched = { ...this.watched, form };

        if (form.mapper) {
            this.scheduleEdit();
        }
    }

    private observePrint(controller: IPrintController): void {
        const state = controller.state;

        // begin fires twice per print (the second adds the scale), so only the edges count
        if (state && !this.isPrinting) {
            this.isPrinting = true;
            this.flush();
            this.raise({ kind: "print-started", layout: state.layout, pageNames: state.pageNames });
        }
        else if (!state && this.isPrinting) {
            this.isPrinting = false;
            this.raise({ kind: "print-ended" });
        }
    }

    private observeRules(controller: IRulesController): void {
        const issues = controller.getIssueCollection().getIssues();

        this.flush();
        this.raise({ kind: "validated", issueCount: issues.length, fields: [...new Set(issues.map(issue => issue.field.name))] });
    }

    private open(form: FormModel<any>): void {
        this.watched = { form, identity: { id: form.id ?? "", name: form.name, version: form.version } };
        this.baseline = form.mapper?.extract(form);

        this.raise({ kind: "form-opened" });
    }

    private raise(detail: AuditRecordDetail): void {
        if (!this.watched) {
            return;
        }

        const record: AuditRecord = { ...detail, at: Date.now(), form: this.watched.identity };

        if (this._record.count > 0) {
            this._record.emit(record);
        }
        else {
            // held for the next listener, such as a recorder about to be mounted again
            this.pending.push(record);

            if (this.pending.length > maxPendingRecords) {
                this.pending.shift();
            }
        }
    }

    private scheduleEdit(): void {
        clearTimeout(this.editTimer);
        this.editTimer = setTimeout(() => this.flush(), editQuietPeriod);
    }
}

/** Gets the audit controller, which core's manager has no accessor for. */
export function getAuditController(controllers: IControllerManager): IAuditController {
    return controllers.getController<IAuditController>(AuditController.key);
}
