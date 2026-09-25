import { FormStatus, IActor, IWorkflowEntry, IWorkflowStamp } from "@forms/core";
import { AuditRecord, IReviewComment } from "@forms/report-viewer";

import { fry, hermes } from "./example-actors";

/**
 * What a host holds about a report it has kept: the record's own identity, where it stands, the history its workflow
 * has made, and the audit history and comments the people who worked on it left. The report viewer is handed all of it
 * when it opens the report, and each form here has one to tell, so that loading it shows a report with a past.
 */
export interface IHeldReport {
    readonly audit: ReadonlyArray<AuditRecord>;
    readonly comments: ReadonlyArray<IReviewComment>;
    /** The report's own id, which every record of its history names. */
    readonly id: string;
    /** How many times it was saved. */
    readonly revision: number;
    readonly status: FormStatus;
    /** What its workflow has done to it, or nothing for a report that has not been moved yet. */
    readonly workflow?: IWorkflowStamp;
}

const minute = 60_000;
const day = 24 * 60 * minute;

/** What a record of the history says, beside what every record carries. */
type Detail = AuditRecord extends infer Each ? Each extends AuditRecord ? Omit<Each, "at" | "by" | "form" | "id"> : never : never;

/** Who a report is, as the records of its history name it. */
interface IReportIdentity {
    readonly id: string;
    readonly name: string;
    readonly version: string;
}

/** A report's history as it is being told. */
interface IStory {
    /** Every record told so far, oldest first. */
    readonly records: ReadonlyArray<AuditRecord>;
    /** How many times the report has been saved. */
    readonly revision: number;

    /** Tells a record made by someone, `minutes` after the last, and hands it back. */
    add(by: IActor, detail: Detail, minutes?: number): AuditRecord;
    /** Saves the report, which moves it on a revision; the record of the save carries the one it reached. */
    save(by: IActor, minutes?: number): AuditRecord;
}

/**
 * Tells one report's history, oldest first: each record some minutes after the last, in the revision the report had
 * reached, under an id that is the same every time the story is told so that a record is never taken for a new one.
 */
function tell(prefix: string, report: IReportIdentity, start: number): IStory {
    const records: Array<AuditRecord> = [];
    let at = start;
    let revision = 0;

    const add = (by: IActor, detail: Detail, minutes = 5): AuditRecord => {
        at += minutes * minute;

        const record: AuditRecord = { ...detail, at, by, form: { id: report.id, name: report.name, revision, version: report.version }, id: `${prefix}-${records.length + 1}` };
        records.push(record);

        return record;
    };

    return {
        add,
        save: (by, minutes = 2) => {
            revision += 1;
            return add(by, { kind: "saved" }, minutes);
        },
        get records() {
            return records;
        },
        get revision() {
            return revision;
        }
    };
}

/** A workflow entry for a move a record of the history says was made. */
function move(record: AuditRecord, from: FormStatus, to: FormStatus, transition: string, note?: string): IWorkflowEntry {
    return { at: record.at, by: record.by!, from, to, transition, ...(note ? { note } : {}) };
}

/**
 * The crash report as the reviewer sent it back: the officer wrote it and submitted it, the reviewer opened it, said
 * what was missing and rejected it, and the comment is still open for the officer to deal with.
 */
export function getCrashReport(now: number): IHeldReport {
    const report = { id: "held-tr310-2026-0004", name: "SC TR-310 - Traffic Collision Report", version: "1.0" };
    const story = tell("held-tr310", report, now - 2 * day);

    story.add(fry, { kind: "form-started", mode: "editable", reason: "open", status: "draft" });
    story.add(fry, { kind: "fields-edited", fields: ["headerCrashReportNumber", "collisionDate", "collisionTime", "collisionCounty"] }, 25);
    story.save(fry);
    story.add(fry, { kind: "validated", fields: [], issueCount: 0 }, 6);
    const submitted = story.add(fry, { kind: "workflow-transition", from: "draft", to: "inReview", transition: "submit" }, 1);
    story.save(fry);
    story.add(fry, { kind: "form-closed", isDirty: false, mode: "editable", status: "inReview" }, 1);
    story.add(hermes, { kind: "form-loaded", auditRecords: story.records.length, comments: 0, mode: "reviewable", status: "inReview", transitions: 1 }, 190);
    const commented = story.add(hermes, { kind: "comment-added", commentId: "held-tr310-comment-1", target: "Report" }, 14);
    story.add(hermes, { kind: "validated", fields: [], issueCount: 0 }, 3);
    const rejected = story.add(hermes, { kind: "workflow-transition", from: "inReview", note: "The narrative does not say who was driving unit 1.", to: "rejected", transition: "reject" }, 1);
    story.save(hermes);
    story.add(hermes, { kind: "form-closed", isDirty: false, mode: "reviewable", status: "rejected" }, 1);

    return {
        audit: story.records,
        comments: [{ at: commented.at, author: hermes, id: "held-tr310-comment-1", isResolved: false, target: { level: "form" }, text: "The narrative does not say who was driving unit 1." }],
        id: report.id,
        revision: story.revision,
        status: "rejected",
        workflow: {
            history: [move(submitted, "draft", "inReview", "submit"), move(rejected, "inReview", "rejected", "reject", "The narrative does not say who was driving unit 1.")],
            id: "crash",
            version: "1"
        }
    };
}

/**
 * The citation as the officer left it: written, validated and issued, which closed what the citation charges. Nobody
 * has commented on it, since a citation never goes to review.
 */
export function getCitationReport(now: number): IHeldReport {
    const report = { id: "held-s438-0000-4471", name: "S438 Citation Form", version: "1.0" };
    const story = tell("held-s438", report, now - day);

    story.add(fry, { kind: "form-started", mode: "editable", reason: "open", status: "draft" });
    story.add(fry, { kind: "fields-edited", fields: ["violatorFirstName", "violatorLastName", "violatorDateOfBirth"] }, 18);
    story.save(fry);
    story.add(fry, { kind: "validated", fields: [], issueCount: 0 }, 4);
    const issued = story.add(fry, { kind: "workflow-transition", from: "draft", to: "issued", transition: "issue" }, 1);
    story.save(fry);
    story.add(fry, { kind: "form-closed", isDirty: false, mode: "editable", status: "issued" }, 1);

    return {
        audit: story.records,
        comments: [],
        id: report.id,
        revision: story.revision,
        status: "issued",
        workflow: { history: [move(issued, "draft", "issued", "issue")], id: "sc-citation", version: "1" }
    };
}

/** The Georgia citation as the officer left it: started and saved, and not yet issued, so there is nothing more in its workflow and no comment to make. */
export function getDraftCitationReport(now: number): IHeldReport {
    const report = { id: "held-ga-utc-0000-9412", name: "GA Uniform Traffic Citation", version: "1.0" };
    const story = tell("held-ga-utc", report, now - 3 * 60 * minute);

    story.add(fry, { kind: "form-started", mode: "editable", reason: "open", status: "draft" });
    story.add(fry, { kind: "fields-edited", fields: ["headerCitationNumber", "violatorLicenseClass", "violatorLicenseState"] }, 12);
    story.save(fry);
    story.add(fry, { kind: "form-closed", isDirty: false, mode: "editable", status: "draft" }, 1);

    return { audit: story.records, comments: [], id: report.id, revision: story.revision, status: "draft" };
}

/** The warning as the officer left it: started and saved, and not yet issued, so there is nothing more in its workflow and no comment to make. */
export function getWarningReport(now: number): IHeldReport {
    const report = { id: "held-sc-432-0000-2207", name: "SC Form 432 - Public Contact / Warning", version: "1.0" };
    const story = tell("held-sc-432", report, now - 5 * 60 * minute);

    story.add(fry, { kind: "form-started", mode: "editable", reason: "open", status: "draft" });
    story.add(fry, { kind: "fields-edited", fields: ["personFirstName", "personLastName", "personDateOfBirth"] }, 9);
    story.save(fry);
    story.add(fry, { kind: "form-closed", isDirty: false, mode: "editable", status: "draft" }, 1);

    return { audit: story.records, comments: [], id: report.id, revision: story.revision, status: "draft" };
}
