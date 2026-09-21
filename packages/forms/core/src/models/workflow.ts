import type { IActor } from "./actor";
import type { FormMode, FormModel, FormStatus } from "./form";
import type { RuleIssueCollection } from "./validation/rule-issue-collection";

/** A check, beyond the form being valid, that a transition needs before it can be made. */
export type WorkflowGuard = "hasOpenComments";

/** Turns a form into the form it becomes: with a value stamped on it, say, or with parts of it closed to editing. */
export type WorkflowStep = (form: FormModel<any>) => FormModel<any>;

/** Moves a report from one status to another. */
export interface IWorkflowTransition {
    /** Run on the form as it is made, before its status changes. */
    readonly effect?: WorkflowStep;
    /** The statuses a form can be in to make it. */
    readonly from: ReadonlyArray<FormStatus>;
    /** What it needs besides a form with no validation errors, which every transition needs. */
    readonly guards?: ReadonlyArray<WorkflowGuard>;
    /** The mode the form must be in, which is the capacity the user acts in: an author edits, a reviewer reviews. */
    readonly mode: FormMode;
    /** What it is called, for the user. */
    readonly title: string;
    /** The status it leaves the form in. */
    readonly to: FormStatus;
}

/** A transition a form can make now, with the id it is made by. */
export interface IAvailableTransition {
    readonly id: string;
    readonly transition: IWorkflowTransition;
}

/** What a transition is given to decide whether it can be made, and to record it. */
export interface ITransitionOptions {
    /** When it was made, in milliseconds since the epoch. Now, when omitted. */
    readonly at?: number;
    /** The result of validating the form, which has to be given: no transition can be made while it holds an error. */
    readonly issues: RuleIssueCollection;
    /** A note to keep with it. */
    readonly note?: string;
    /** How many review comments are still open, for a transition that needs one. None, when omitted. */
    readonly openComments?: number;
}

/** What was done to move a report along its workflow. */
export interface IWorkflowEntry {
    /** When it was done, in milliseconds since the epoch. */
    readonly at: number;
    /** Who did it. */
    readonly by: IActor;
    /** The status the report was in. */
    readonly from: FormStatus;
    /** A note kept with it. */
    readonly note?: string;
    /** The status the report was left in. */
    readonly to: FormStatus;
    /** The id of the transition that was made. */
    readonly transition: string;
}

/** A report's history in its workflow, as its record keeps it. */
export interface IWorkflowStamp {
    /** What has been done to move the report along, oldest first. */
    readonly history: ReadonlyArray<IWorkflowEntry>;
    /** The workflow the history belongs to, so that a change to it later cannot misread an old record. */
    readonly id: string;
    /** The version of the workflow the history belongs to. */
    readonly version: string;
}

/** The rules a form's reports move by: the transitions between statuses, and what a status closes. */
export interface IWorkflow {
    /** Identifies the workflow, and is stamped on a report's history. */
    readonly id: string;
    /** What each status closes to editing, run on a form as it takes the status, and again when a report in that status is loaded. */
    readonly locks?: Readonly<Partial<Record<FormStatus, WorkflowStep>>>;
    /** The transitions, by the id each is made by. */
    readonly transitions: Readonly<Record<string, IWorkflowTransition>>;
    /** Changes with each change to the rules, so that a history can be told apart from one made under another version. */
    readonly version: string;

    /** Makes a workflow from this one with the given changes, a transition or a lock replacing the one it has under the same key. */
    with(changes: Partial<IWorkflowDefinition>): IWorkflow;
}

/** What a workflow is made from. */
export type IWorkflowDefinition = Omit<IWorkflow, "with">;

/** Defines a workflow, refusing a transition that could never be made. */
export function defineWorkflow(definition: IWorkflowDefinition): IWorkflow {
    for (const [id, transition] of Object.entries(definition.transitions)) {
        if (transition.from.length === 0) {
            throw new Error(`The transition "${id}" of the workflow "${definition.id}" must be made from at least one status.`);
        }
    }

    const workflow: IWorkflow = {
        ...definition,
        with: changes => defineWorkflow({
            ...definition,
            ...changes,
            locks: { ...definition.locks, ...changes.locks },
            transitions: { ...definition.transitions, ...changes.transitions }
        })
    };

    return Object.freeze(workflow);
}
