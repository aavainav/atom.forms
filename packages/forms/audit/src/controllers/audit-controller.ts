import { IEvent, IEventListener, EventEmitter } from "@common/event-emitter";
import { IController, IControllerChangedEventArgs, IControllerManager, IPrintController, IRulesController, ActivityEventArgs, Controller, ControllerKey, FormModel, RegisterController } from "@forms/core";

import { IAuditFormIdentity, AuditRecord, AuditRecordDetail } from "../models/audit-record";
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
    /** The history of the report the form is: what was loaded for it, then the records raised for it since. The same array until a record is added, so a subscriber can take it as its snapshot. */
    readonly history: ReadonlyArray<AuditRecord>;
    /** Raised for each record. Any raised while nothing listens are held for the next listener. */
    readonly onRecord: IEvent<AuditRecord>;
    /** Every record raised since the controller started, for whichever form, in the order they were raised. The same array until a record is added. */
    readonly session: ReadonlyArray<AuditRecord>;

    /** Records any edits still waiting out the quiet period. */
    flush(): void;
    /** Loads the history the host holds for the report, ahead of the records raised since. */
    load(records: ReadonlyArray<AuditRecord>): void;
    /** Records that the form was closed, once for each form opened. Edits still pending are recorded first. */
    recordClosed(): void;
    /** Records that the form was saved. */
    recordSaved(): void;
    /** Records that saving the form failed. */
    recordSaveFailed(): void;
}

/** Gets the audit controller, which core's manager has no accessor for. */
export function getAuditController(controllers: IControllerManager): IAuditController {
    return controllers.getController<IAuditController>(AuditController.key);
}

/**
 * Watches the form, rules and print controllers and records what they report, and whatever other controllers report
 * through the manager. Eager, so it misses nothing.
 * Edits are found by diffing the mapper's extract, so a form with no mapper goes unrecorded.
 */
@RegisterController("audit", { eager: true })
export class AuditController extends Controller implements IAuditController {
    private _history: ReadonlyArray<AuditRecord> = [];
    private _loaded: ReadonlyArray<AuditRecord> = [];
    private readonly _record = new EventEmitter<AuditRecord>(`${this.key}:record`, { onFirstListenerAdd: () => this.deliverPending() });

    private _session: ReadonlyArray<AuditRecord> = [];
    private activityListener?: IEventListener;
    private baseline?: unknown;
    private closedListener?: IEventListener;
    private editTimer?: ReturnType<typeof setTimeout>;
    private isClosed = false;
    private isPrinting = false;
    private listener?: IEventListener;
    private pending: Array<AuditRecord> = [];
    private watched?: IWatchedForm;

    get history(): ReadonlyArray<AuditRecord> {
        return this._history;
    }

    get onRecord(): IEvent<AuditRecord> {
        return this._record.event;
    }

    get session(): ReadonlyArray<AuditRecord> {
        return this._session;
    }

    public dispose(): void {
        this.flush();

        this.activityListener?.remove();
        this.activityListener = undefined;
        this.closedListener?.remove();
        this.closedListener = undefined;
        this.listener?.remove();
        this.listener = undefined;
        this.pending = [];
        this._history = [];
        this._loaded = [];
        this._session = [];
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

    public load(records: ReadonlyArray<AuditRecord>): void {
        this._loaded = records;
        this.refresh();
    }

    public recordClosed(): void {
        this.flush();

        if (!this.watched || this.isClosed) {
            return;
        }

        const { form } = this.watched;

        this.isClosed = true;
        this.raise({ kind: "form-closed", isDirty: form.getIsDirty(), mode: form.mode, status: form.status });
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
        this.activityListener = this.manager.onActivity(args => this.observeActivity(args));
        this.closedListener = this.manager.onClosed(() => this.recordClosed());
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
            this.recordClosed();
            this.open(form);
            return;
        }

        // the manager announcing the form we started on
        if (form === this.watched.form) {
            return;
        }

        const previous = this.watched.form;

        // a form's history only grows, so what is past the length it had is what was done since
        const transitions = form.history.slice(previous.history.length);

        // a status the transitions account for is recorded as them, not a second time as a change of status
        const explained = transitions.at(-1)?.to ?? previous.status;

        if (transitions.length || form.status !== previous.status) {
            // edits made under the old status come first
            this.flush();
        }

        for (const { from, note, to, transition } of transitions) {
            this.raise({ kind: "workflow-transition", from, to, transition, ...(note ? { note } : {}) });
        }

        if (form.status !== explained) {
            this.raise({ kind: "status-changed", from: explained, to: form.status });
        }

        // revision moves independently of id -- a save between two observations must not leave it stale
        this.watched = { ...this.watched, form, identity: { ...this.watched.identity, revision: form.revision ?? 0 } };

        if (form.mapper) {
            this.scheduleEdit();
        }
    }

    /** Something reported through the manager, recorded as it came and after the edits that preceded it. One that came with a change to the form also names the fields the change touched. */
    private observeActivity(args: ActivityEventArgs): void {
        if (!this.watched) {
            return;
        }

        if (!("form" in args)) {
            this.flush();
            this.raise(args.activity);
            return;
        }

        const { activity, form } = args;

        // with no mapper there is nothing to diff, so nothing to say about what changed
        if (!form.mapper) {
            return;
        }

        // one atomic change, not a burst to coalesce: edits before it are a separate episode, and it is diffed and recorded now, ahead of observe for the same change
        this.flush();

        const after = form.mapper.extract(form);
        const fields = getChangedPaths(this.baseline, after);
        this.baseline = after;

        this.raise({ ...activity, fields });
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
        this.isClosed = false;
        // what was loaded is the history of the report the last form was, which this one is not
        this._loaded = [];
        this.watched = { form, identity: { id: form.id ?? "", revision: form.revision ?? 0, name: form.name, version: form.version } };
        this.baseline = form.mapper?.extract(form);

        this.raise({ kind: "form-opened", status: form.status, mode: form.mode });
    }

    private raise(detail: AuditRecordDetail): void {
        if (!this.watched) {
            return;
        }

        const record: AuditRecord = { ...detail, at: Date.now(), by: this.manager.user, form: this.watched.identity, id: crypto.randomUUID() };

        this._session = [...this._session, record];
        this.refresh();

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

    private refresh(): void {
        // a form swapped in after this one leaves its records in the session, for whoever is writing them, but not in this history
        const current = this.watched?.identity.id;

        this._history = [...this._loaded, ...this._session.filter(record => record.form.id === current)];
        this.emitChanged();
    }

    private scheduleEdit(): void {
        clearTimeout(this.editTimer);
        this.editTimer = setTimeout(() => this.flush(), editQuietPeriod);
    }
}
