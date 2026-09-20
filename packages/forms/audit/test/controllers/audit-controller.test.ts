import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ControllerManager, RuleCollection } from "@forms/core";

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

/** Loads a form into a manager and starts listening to the audit controller it creates. */
function watch(data: object = { name: "Dana" }, options?: IStubFormOptions): IWatch {
    const manager = new ControllerManager();
    manager.loadForm(stubForm(data, options));

    const audit = getAuditController(manager);
    const records: Array<AuditRecord> = [];
    audit.onRecord(record => records.push(record));

    return { audit, manager, records };
}

function edit(manager: ControllerManager, data: object, options?: IStubFormOptions): void {
    manager.getFormController().setForm(stubForm(data, options));
}

function kinds(records: ReadonlyArray<AuditRecord>): Array<string> {
    return records.map(record => record.kind);
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

            expect(records).toEqual([{ at: now, form: { id: "form-1", name: "Stub Form", version: "1.0" }, kind: "form-opened", mode: "editable", status: "draft" }]);
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

            expect(later.map(record => [record.kind, record.form.id])).toEqual([["form-opened", "form-2"]]);
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

            expect(records.map(record => [record.kind, record.form.id])).toEqual([["form-opened", "form-1"], ["form-opened", "form-2"]]);
        });

        it("records a new form set on the controller, and measures its edits from the state it arrived in", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Riley" }, { id: "form-2" });
            edit(manager, { name: "Riley B" }, { id: "form-2" });
            settle();

            expect(records.map(record => [record.kind, record.form.id])).toEqual([
                ["form-opened", "form-1"],
                ["form-opened", "form-2"],
                ["fields-edited", "form-2"]
            ]);
            expect(records[2]).toMatchObject({ fields: ["name"] });
        });
    });

    describe("status-changed", () => {
        it("records a status change, naming both statuses", () => {
            const { manager, records } = watch({ name: "Dana" });

            edit(manager, { name: "Dana" }, { status: "issued" });

            expect(records[1]).toEqual({ at: now, form: { id: "form-1", name: "Stub Form", version: "1.0" }, from: "draft", kind: "status-changed", to: "issued" });
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

    describe("fields-edited", () => {
        it("records what changed once the form has been left alone", () => {
            const { manager, records } = watch({ city: "Aiken", name: "Dana" });

            edit(manager, { city: "Aiken", name: "Riley" });
            vi.advanceTimersByTime(editQuietPeriod - 1);

            expect(kinds(records)).toEqual(["form-opened"]);

            vi.advanceTimersByTime(1);

            expect(records[1]).toEqual({ at: now + editQuietPeriod, fields: ["name"], form: { id: "form-1", name: "Stub Form", version: "1.0" }, kind: "fields-edited" });
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
                ["form-opened", "form-2"]
            ]);
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

            expect(records[1]).toEqual({ at: now, form: { id: "form-1", name: "Stub Form", version: "1.0" }, kind: "print-started", layout: "side-by-side" });
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
    });
});
