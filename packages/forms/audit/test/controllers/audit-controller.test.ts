import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IWorkflowEntry, Controller, ControllerManager, FormActivity, FormArrival, RegisterController, RuleCollection } from "@forms/core";

import { AuditController, editQuietPeriod, getAuditController, maxPendingRecords } from "../../src/controllers/audit-controller";
import type { IAuditController } from "../../src/controllers/audit-controller";

import type { AuditRecord } from "../../src/models/audit-record";
import { failingRule, stubForm } from "../fixtures/stub-form";
import type { IStubFormOptions } from "../fixtures/stub-form";

const now = 1_700_000_000_000;

interface IWatch {
    readonly audit: IAuditController;
    readonly manager: ControllerManager;
    readonly records: Array<AuditRecord>;
}

/** Loads a form into a manager and starts listening to the audit controller it creates. `arrival` is how the manager was told the form arrives, as the report viewer does. */
function watch(data: object = { name: "Dana" }, options?: IStubFormOptions, arrival?: FormArrival): IWatch {
    const manager = new ControllerManager();
    manager.setArrival(arrival);
    manager.loadForm(stubForm(data, options));

    const audit = getAuditController(manager);
    const records: Array<AuditRecord> = [];
    audit.onRecord(record => records.push(record));

    return { audit, manager, records };
}

function edit(manager: ControllerManager, data: object, options?: IStubFormOptions): void {
    manager.getFormController().setForm(stubForm(data, options));
}

/** Makes an update naming what it was, the way a drop or the violations panel does. */
function reasonedEdit(manager: ControllerManager, data: object, reason: FormActivity, options?: IStubFormOptions): void {
    manager.getFormController().update({ update: () => stubForm(data, options), reason });
}

function kinds(records: ReadonlyArray<AuditRecord>): Array<string> {
    return records.map(record => record.kind);
}

declare module "@forms/core" {
    interface IFormActivityMap {
        /** A kind only these tests report with a change, standing in for one a package above core declares. */
        "test-changed": { readonly note: string };
    }

    interface IControllerActivityMap {
        /** A kind only these tests report, standing in for one a package above core declares. */
        "test-reported": { readonly note: string };
    }
}

@RegisterController("audit-test-reporter")
class ReporterController extends Controller {
    public report(note: string): void {
        this.emitActivity({ kind: "test-reported", note });
    }
}

function reporter(manager: ControllerManager): ReporterController {
    return manager.getController<ReporterController>("audit-test-reporter");
}

/** Lets the quiet period pass. */
function settle(): void {
    vi.advanceTimersByTime(editQuietPeriod);
}

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
});

afterEach(() => {
    vi.useRealTimers();
});

describe("AuditController", () => {
    describe("registration", () => {
        it("is created when a form is loaded, without being asked for", () => {
            const { records } = watch();

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("registers under the audit key", () => {
            expect(AuditController.key).toBe("audit");
            expect(getAuditController(watch().manager).key).toBe("audit");
        });
    });

    describe("form-opened", () => {
        it("records the form being opened, stamped with its identity and the time", () => {
            const { records } = watch();

            expect(records).toEqual([{ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "form-opened", mode: "editable", status: "draft" }]);
        });

        it("records the status the form arrived with", () => {
            const { records } = watch({ name: "Dana" }, { status: "issued" });

            expect(records[0]).toMatchObject({ kind: "form-opened", status: "issued" });
        });

        it("holds what was raised before anything listened for the first listener, in order", () => {
            const manager = new ControllerManager();
            manager.loadForm(stubForm());
            const audit = getAuditController(manager);
            audit.recordSaved();

            const first: Array<AuditRecord> = [];
            audit.onRecord(record => first.push(record));

            expect(kinds(first)).toEqual(["form-opened", "saved"]);
        });

        it("does not replay held records to a second listener", () => {
            const manager = new ControllerManager();
            manager.loadForm(stubForm());
            const audit = getAuditController(manager);
            audit.onRecord(() => { });

            const second: Array<AuditRecord> = [];
            audit.onRecord(record => second.push(record));

            expect(second).toHaveLength(0);
        });

        /** A host that reuses one manager remounts its recorder for each form, so a form loaded in between must still be heard. */
        it("holds what was raised while nothing was listening for the next listener, as when a recorder is remounted", () => {
            const manager = new ControllerManager();
            manager.loadForm(stubForm());
            const audit = getAuditController(manager);
            audit.onRecord(() => { }).remove();

            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

            const later: Array<AuditRecord> = [];
            audit.onRecord(record => later.push(record));

            expect(later.map(record => [record.kind, record.form.id])).toEqual([["form-closed", "form-1"], ["form-opened", "form-2"]]);
        });

        it("holds no more than the latest few while nothing is listening", () => {
            const manager = new ControllerManager();
            manager.loadForm(stubForm());
            const audit = getAuditController(manager);

            for (let count = 0; count < maxPendingRecords + 50; count++) {
                audit.recordSaved();
            }

            const held: Array<AuditRecord> = [];
            audit.onRecord(record => held.push(record));

            expect(held).toHaveLength(maxPendingRecords);
            expect(kinds(held)).not.toContain("form-opened");
        });

        it("records a different form loaded into the same manager", () => {
            const { manager, records } = watch();

            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

            expect(records.map(record => [record.kind, record.form.id])).toEqual([["form-opened", "form-1"], ["form-closed", "form-1"], ["form-opened", "form-2"]]);
        });

        it("records a new form set on the controller, and measures its edits from the state it arrived in", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" }, { id: "form-2" });
            edit(manager, { name: "Riley B" }, { id: "form-2" });
            settle();

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["form-closed", "form-1"],
                ["form-opened", "form-2"],
                ["fields-edited", "form-2"]
            ]);
            expect(records[3]).toMatchObject({ fields: ["name"] });
        });
    });

    describe("how the form arrived", () => {
        it("says the form was loaded, with what came with the record, when the manager was told so", () => {
            const { records } = watch({ name: "Dana" }, { mode: "reviewable", status: "inReview" }, { kind: "loaded", formId: "form-1", auditRecords: 4, comments: 1, transitions: 2 });

            expect(records).toHaveLength(1);
            expect(records[0]).toMatchObject({ kind: "form-loaded", auditRecords: 4, comments: 1, mode: "reviewable", status: "inReview", transitions: 2 });
        });

        it("says the form was started, and why, when the manager was told so", () => {
            const { records } = watch({ name: "Dana" }, undefined, { kind: "started", formId: "form-1", reason: "new" });

            expect(records).toHaveLength(1);
            expect(records[0]).toMatchObject({ kind: "form-started", mode: "editable", reason: "new", status: "draft" });
        });

        it("says only that the form was opened when nothing said how it arrived", () => {
            const { records } = watch();

            expect(records[0]).toMatchObject({ kind: "form-opened", mode: "editable", status: "draft" });
        });

        it("says only that the form was opened when it was told how a different form arrived", () => {
            const { records } = watch({ name: "Dana" }, undefined, { kind: "loaded", formId: "form-9", auditRecords: 1, comments: 0, transitions: 0 });

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("says how a form swapped in arrived when the manager is told before it goes in", () => {
            const { manager, records } = watch();

            manager.setArrival({ kind: "started", formId: "form-2", reason: "new" });
            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["form-closed", "form-1"],
                ["form-started", "form-2"]
            ]);
        });
    });

    describe("form-closed", () => {
        it("records the form being closed, with where it stood", () => {
            const { audit, records } = watch({ name: "Dana" }, { isDirty: true, mode: "reviewable", status: "inReview" });

            audit.recordClosed();

            expect(records[1]).toEqual({ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, isDirty: true, kind: "form-closed", mode: "reviewable", status: "inReview" });
        });

        it("records edits still pending first", () => {
            const { audit, manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            audit.recordClosed();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "form-closed"]);
        });

        it("records it once for each form opened", () => {
            const { audit, manager, records } = watch();

            audit.recordClosed();
            audit.recordClosed();
            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));
            audit.recordClosed();

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["form-closed", "form-1"],
                ["form-opened", "form-2"],
                ["form-closed", "form-2"]
            ]);
        });

        it("is attributed to the user, as every record is", () => {
            const { audit, manager, records } = watch();
            manager.setUser({ id: "u-1", name: "Officer One" });

            audit.recordClosed();

            expect(records[1].by).toEqual({ id: "u-1", name: "Officer One" });
        });

        it("is recorded when the manager closes, with edits still pending recorded first", () => {
            const { manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            manager.close();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "form-closed"]);
        });

        it("is recorded once when the manager closes more than once", () => {
            const { manager, records } = watch();

            manager.close();
            manager.close();

            expect(kinds(records)).toEqual(["form-opened", "form-closed"]);
        });

        it("is followed by the form being restored when the manager is reopened, and a later close is recorded", () => {
            const { manager, records } = watch({ name: "Dana" }, { mode: "reviewable", status: "inReview" });

            manager.close();
            manager.reopen();
            manager.close();

            expect(records.map(record => [record.kind, "mode" in record ? record.mode : undefined])).toEqual([
                ["form-opened", "reviewable"],
                ["form-closed", "reviewable"],
                ["form-restored", "reviewable"],
                ["form-closed", "reviewable"]
            ]);
        });

        it("keeps the history that was loaded for the report when it is opened again", () => {
            const { audit, manager } = watch();
            const loaded: AuditRecord = { at: 1, form: { id: "form-0", name: "Stub Form", revision: 0, version: "1.0" }, id: "loaded-1", kind: "saved" };
            audit.load([loaded]);

            manager.close();
            manager.reopen();

            expect(audit.history[0]).toBe(loaded);
        });

        it("does not open the form again when a different form was opened in between", () => {
            const { manager, records } = watch();

            manager.close();
            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));
            manager.reopen();

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["form-closed", "form-1"],
                ["form-opened", "form-2"]
            ]);
        });

        it("is not recorded for a manager that closes after the controller is disposed", () => {
            const { manager, records } = watch();

            manager.disposeController(AuditController.key);
            manager.close();

            expect(kinds(records)).toEqual(["form-opened"]);
        });
    });

    describe("status-changed", () => {
        it("records a status change, naming both statuses", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { status: "issued" });

            expect(records[1]).toEqual({ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, from: "draft", kind: "status-changed", to: "issued" });
        });

        it("records the edits made before it first", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" });
            edit(manager, { name: "Riley" }, { status: "issued" });

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "status-changed"]);
        });

        it("records nothing when the status is unchanged", () => {
            const { manager, records } = watch({ name: "Dana" }, { status: "issued" });

            edit(manager, { name: "Dana" }, { status: "issued" });

            expect(kinds(records)).toEqual(["form-opened"]);
        });
    });

    describe("workflow-transition", () => {
        const submit: IWorkflowEntry = { at: 5, by: { id: "u-1", name: "Officer One" }, from: "draft", to: "inReview", transition: "submit" };
        const approve: IWorkflowEntry = { at: 6, by: { id: "u-2", name: "Reviewer One" }, from: "inReview", note: "Looks right.", to: "approved", transition: "approve" };

        it("records a transition, naming it and both statuses", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "inReview" });

            expect(records[1]).toEqual({ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, from: "draft", kind: "workflow-transition", to: "inReview", transition: "submit" });
        });

        it("records it instead of a change of status, since the transition is what changed it", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "inReview" });

            expect(kinds(records)).toEqual(["form-opened", "workflow-transition"]);
        });

        it("carries the note kept with the transition, and leaves the key out when there is none", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit, approve], status: "approved" });

            expect(records[1]).not.toHaveProperty("note");
            expect(records[2]).toMatchObject({ note: "Looks right.", transition: "approve" });
        });

        it("records each of several the one change made, in the order they were made", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit, approve], status: "approved" });

            expect(records.slice(1).map(record => record.kind === "workflow-transition" ? record.transition : record.kind)).toEqual(["submit", "approve"]);
        });

        it("records the edits made before it first", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" });
            edit(manager, { name: "Riley" }, { history: [submit], status: "inReview" });

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "workflow-transition"]);
        });

        it("records only what was done since, not the history the form arrived with", () => {
            const { manager, records } = watch({ name: "Dana" }, { history: [submit], status: "inReview" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "inReview" });
            edit(manager, { name: "Dana" }, { history: [submit, approve], status: "approved" });

            expect(kinds(records)).toEqual(["form-opened", "workflow-transition"]);
            expect(records[1]).toMatchObject({ transition: "approve" });
        });

        it("still records a change of status the transitions do not account for", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "voided" });

            expect(kinds(records)).toEqual(["form-opened", "workflow-transition", "status-changed"]);
            expect(records[2]).toMatchObject({ from: "inReview", to: "voided" });
        });

        it("is attributed to the user, as every record is", () => {
            const { manager, records } = watch({ name: "Dana" });
            manager.setUser({ id: "u-1", name: "Officer One" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "inReview" });

            expect(records[1].by).toEqual({ id: "u-1", name: "Officer One" });
        });

        it("is part of the history the report is shown with", () => {
            const { audit, manager } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { history: [submit], status: "inReview" });

            expect(kinds(audit.history)).toEqual(["form-opened", "workflow-transition"]);
        });
    });

    describe("fields-edited", () => {
        it("records what changed once the form has been left alone", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Aiken", name: "Riley" });
            vi.advanceTimersByTime(editQuietPeriod - 1);

            expect(kinds(records)).toEqual(["form-opened"]);

            vi.advanceTimersByTime(1);

            expect(records[1]).toEqual({ at: now + editQuietPeriod, id: expect.any(String), fields: ["name"], form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "fields-edited" });
        });

        it("records a burst of edits as one", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Aiken", name: "R" });
            vi.advanceTimersByTime(500);
            edit(manager, { city: "Aiken", name: "Ri" });
            vi.advanceTimersByTime(500);
            edit(manager, { city: "Columbia", name: "Ri" });
            settle();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited"]);
            expect(records[1]).toMatchObject({ fields: ["city", "name"] });
        });

        it("records nothing when an edit changes no value", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" });
            settle();

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("records an edit only once", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" });
            settle();
            settle();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited"]);
        });

        it("measures each set of edits from the last one recorded", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Aiken", name: "Riley" });
            settle();
            edit(manager, { city: "Columbia", name: "Riley" });
            settle();

            expect(records.slice(1)).toMatchObject([{ fields: ["name"] }, { fields: ["city"] }]);
        });

        it("records nothing for a form with no mapper, which cannot be compared", () => {
            const { manager, records } = watch({}, { hasMapper: false });

            edit(manager, { name: "Riley" }, { hasMapper: false });
            settle();

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("records pending edits when flushed, and only once", () => {
            const { audit, manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            audit.flush();
            audit.flush();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited"]);
        });

        it("records the old form's pending edits under its own identity before a different form replaces it", () => {
            const { manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            manager.loadForm(stubForm({}, { id: "form-2" }));

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["fields-edited", "form-1"],
                ["form-closed", "form-1"],
                ["form-opened", "form-2"]
            ]);
        });
    });

    describe("dropped", () => {
        it("records what changed immediately, naming what was dropped", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            reasonedEdit(manager, { city: "Aiken", name: "Riley" }, { kind: "dropped", type: "person" });

            expect(records[1]).toEqual({ at: now, id: expect.any(String), fields: ["name"], form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "dropped", type: "person" });
        });

        it("does not wait out the quiet period", () => {
            const { manager, records } = watch({ name: "Dana" });

            reasonedEdit(manager, { name: "Riley" }, { kind: "dropped", type: "vehicle" });

            expect(kinds(records)).toEqual(["form-opened", "dropped"]);
        });

        it("records edits made before it first", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Columbia", name: "Dana" });
            reasonedEdit(manager, { city: "Columbia", name: "Riley" }, { kind: "dropped", type: "violation" });

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "dropped"]);
            expect(records[1]).toMatchObject({ fields: ["city"] });
            expect(records[2]).toMatchObject({ fields: ["name"] });
        });

        it("leaves nothing pending for the edit it caused, so the next one measures from here", () => {
            const { manager, records } = watch({ name: "Dana" });

            reasonedEdit(manager, { name: "Riley" }, { kind: "dropped", type: "person" });
            settle();
            edit(manager, { name: "Sam" });
            settle();

            expect(kinds(records)).toEqual(["form-opened", "dropped", "fields-edited"]);
            expect(records[2]).toMatchObject({ fields: ["name"] });
        });

        it("records nothing for a form with no mapper", () => {
            const { manager, records } = watch({}, { hasMapper: false });

            reasonedEdit(manager, {}, { kind: "dropped", type: "person" }, { hasMapper: false });

            expect(kinds(records)).toEqual(["form-opened"]);
        });
    });

    /** The audit has no code of its own for a kind a package declares: it records the activity as reported, with the fields the change touched. */
    describe("an activity another package reports with a change", () => {
        it("records what changed immediately, as the package reported it", () => {
            const { manager, records } = watch({ name: "Dana" });

            reasonedEdit(manager, { name: "Riley" }, { kind: "test-changed", note: "hello" });

            expect(records[1]).toEqual({ at: now, id: expect.any(String), fields: ["name"], form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "test-changed", note: "hello" });
        });

        it("records edits made before it first", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Columbia", name: "Dana" });
            reasonedEdit(manager, { city: "Columbia", name: "Riley" }, { kind: "test-changed", note: "hello" });

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "test-changed"]);
        });

        it("records nothing for an update that names nothing", () => {
            const { manager, records } = watch({ name: "Dana" });

            manager.getFormController().update({ update: () => stubForm({ name: "Riley" }) });

            expect(kinds(records)).toEqual(["form-opened"]);
        });
    });

    describe("reported activity", () => {
        it("records what a controller reports, as it reported it", () => {
            const { manager, records } = watch();

            reporter(manager).report("hello");

            expect(records[1]).toEqual({ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "test-reported", note: "hello" });
        });

        it("attributes it to the user", () => {
            const { manager, records } = watch();
            manager.setUser({ id: "9", name: "Lt. Osei" });

            reporter(manager).report("hello");

            expect(records[1].by).toEqual({ id: "9", name: "Lt. Osei" });
        });

        it("records edits made before it first", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" });
            reporter(manager).report("hello");

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "test-reported"]);
        });
    });

    describe("validated", () => {
        it("records the issues found, naming each failing field once", () => {
            const { manager, records } = watch();

            manager.getRulesController(new RuleCollection([failingRule("first-name", "dob"), failingRule("first-name")])).validate();

            expect(records[1]).toMatchObject({ kind: "validated", issueCount: 3, fields: ["first-name", "dob"] });
        });

        it("records a clean validation", () => {
            const { manager, records } = watch();

            manager.getRulesController().validate();

            expect(records[1]).toMatchObject({ kind: "validated", issueCount: 0, fields: [] });
        });

        it("records pending edits before the validation", () => {
            const { manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            manager.getRulesController().validate();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "validated"]);
        });
    });

    describe("printing", () => {
        it("records a print starting and ending once each, though it begins twice", () => {
            const { manager, records } = watch();
            const print = manager.getPrintController();

            print.begin({ layout: "top-down", pageNames: ["citation"] });
            print.begin({ layout: "top-down", pageNames: ["citation"], scale: 0.9 });
            print.end();

            expect(records.slice(1)).toMatchObject([{ kind: "print-started", layout: "top-down", pageNames: ["citation"] }, { kind: "print-ended" }]);
        });

        it("leaves the page names out when every page prints", () => {
            const { manager, records } = watch();

            manager.getPrintController().begin({ layout: "side-by-side" });

            expect(records[1]).toEqual({ at: now, id: expect.any(String), form: { id: "form-1", name: "Stub Form", revision: 0, version: "1.0" }, kind: "print-started", layout: "side-by-side" });
        });

        it("records nothing for ending a print that never began", () => {
            const { manager, records } = watch();

            manager.getPrintController().end();

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("records pending edits before the print starts", () => {
            const { manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            manager.getPrintController().begin({ layout: "top-down" });

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "print-started"]);
        });
    });

    describe("saving", () => {
        it("records a save, after the edits it kept", () => {
            const { audit, manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            audit.recordSaved();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "saved"]);
        });

        it("records a save that failed", () => {
            const { audit, records } = watch();

            audit.recordSaveFailed();

            expect(kinds(records)).toEqual(["form-opened", "save-failed"]);
        });
    });

    describe("report data", () => {
        it("records report data being shown, naming the tab", () => {
            const { audit, records } = watch();

            audit.recordDataViewed("audit");

            expect(records[1]).toMatchObject({ kind: "report-data-viewed", tab: "audit" });
        });

        it("records report data being copied, naming the tab", () => {
            const { audit, records } = watch();

            audit.recordDataCopied("all");

            expect(records[1]).toMatchObject({ kind: "report-data-copied", tab: "all" });
        });

        it("records the edits made before it first", () => {
            const { audit, manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            audit.recordDataViewed("data");
            edit(manager, { name: "Sam" });
            audit.recordDataCopied("data");

            expect(kinds(records)).toEqual(["form-opened", "fields-edited", "report-data-viewed", "fields-edited", "report-data-copied"]);
        });
    });

    describe("dispose", () => {
        it("records edits still pending when the manager is disposed", () => {
            const { manager, records } = watch({ name: "Dana" });
            edit(manager, { name: "Riley" });

            manager.dispose();

            expect(kinds(records)).toEqual(["form-opened", "fields-edited"]);
        });

        it("stops observing once disposed", () => {
            const { manager, records } = watch({ name: "Dana" });

            manager.disposeController("audit");
            edit(manager, { name: "Riley" });
            manager.getPrintController().begin({ layout: "top-down" });
            settle();

            expect(kinds(records)).toEqual(["form-opened"]);
        });

        it("stops recording what controllers report once disposed", () => {
            const { manager, records } = watch();
            const source = reporter(manager);

            manager.disposeController("audit");
            source.report("hello");

            expect(kinds(records)).toEqual(["form-opened"]);
        });
    });

    describe("ids", () => {
        it("gives every record an id of its own", () => {
            const { audit, records } = watch();

            audit.recordSaved();
            audit.recordSaved();

            expect(new Set(records.map(record => record.id)).size).toBe(3);
        });
    });

    describe("who", () => {
        const rivera = { agency: "Riverside Police Department", badgeId: "4471", id: "4471", name: "Sgt. Rivera", rank: "Sergeant" };

        it("attributes the records raised after a user is set to that user, and not the ones before", () => {
            const { audit, manager, records } = watch();

            manager.setUser(rivera);
            audit.recordSaved();

            expect(records[0].by).toBeUndefined();
            expect(records[1].by).toEqual(rivera);
        });

        it("attributes the form being opened when the user was set before the form was loaded", () => {
            const manager = new ControllerManager();
            manager.setUser(rivera);
            manager.loadForm(stubForm());
            const records: Array<AuditRecord> = [];
            getAuditController(manager).onRecord(record => records.push(record));

            expect(records[0]).toMatchObject({ kind: "form-opened", by: rivera });
        });

        it("attributes a record to the whole of the user, not only their name", () => {
            const { audit, manager, records } = watch();

            manager.setUser(rivera);
            audit.recordSaved();

            expect(records[1].by).toMatchObject({ agency: "Riverside Police Department", badgeId: "4471", rank: "Sergeant" });
        });

        it("stops attributing records once the user is cleared", () => {
            const { audit, manager, records } = watch();

            manager.setUser(rivera);
            manager.setUser(undefined);
            audit.recordSaved();

            expect(records[1].by).toBeUndefined();
        });
    });

    describe("history", () => {
        const loaded: AuditRecord = { at: 1, by: { id: "9", name: "Lt. Osei" }, form: { id: "form-0", name: "Stub Form", revision: 0, version: "1.0" }, id: "loaded-1", kind: "saved" };

        it("holds what has been raised, in order", () => {
            const { audit } = watch();

            audit.recordSaved();

            expect(kinds(audit.history)).toEqual(["form-opened", "saved"]);
        });

        it("is the same array until a record is added, so it can be a snapshot", () => {
            const { audit } = watch();
            const before = audit.history;

            expect(audit.history).toBe(before);

            audit.recordSaved();

            expect(audit.history).not.toBe(before);
        });

        it("puts what was loaded ahead of what has been raised, and raises a change", () => {
            const { audit } = watch();
            let changes = 0;
            audit.onChanged(() => { changes += 1; });

            audit.load([loaded]);

            expect(audit.history.map(record => record.id)).toEqual(["loaded-1", audit.session[0].id]);
            expect(changes).toBe(1);
        });

        it("raises a change each time a record is added", () => {
            const { audit } = watch();
            let changes = 0;
            audit.onChanged(() => { changes += 1; });

            audit.recordSaved();
            audit.recordSaveFailed();

            expect(changes).toBe(2);
        });

        it("leaves what was loaded out of the session, which is only what was raised", () => {
            const { audit } = watch();

            audit.load([loaded]);

            expect(kinds(audit.session)).toEqual(["form-opened"]);
        });

        it("forgets what was loaded when a different form replaces the form, since it is not that report", () => {
            const { audit, manager } = watch();
            audit.load([loaded]);

            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

            expect(audit.history.map(record => [record.kind, record.form.id])).toEqual([["form-opened", "form-2"]]);
        });

        it("keeps the records of a form that was replaced in the session, for whoever is writing them, and out of the history", () => {
            const { audit, manager } = watch();

            manager.loadForm(stubForm({ name: "Riley" }, { id: "form-2" }));

            expect(audit.session.map(record => record.form.id)).toEqual(["form-1", "form-1", "form-2"]);
            expect(audit.history.map(record => record.form.id)).toEqual(["form-2"]);
        });

        it("lets go of it all when it is disposed", () => {
            const { audit } = watch();
            audit.load([loaded]);

            audit.dispose();

            expect(audit.history).toEqual([]);
            expect(audit.session).toEqual([]);
        });
    });
});
