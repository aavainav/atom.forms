import { createService, Singleton } from "@shrub/core";
import { knownStatuses, withChanges, IActor, IAvailableTransition, ITransitionOptions, IWorkflowStamp, FormModel, FormStatus, RuleIssueSeverity } from "@forms/core";

export const IWorkflowService = createService<IWorkflowService>("forms-workflow-service");

/** Defines a service that interprets a form's workflow: which transitions it can make now, and what making one changes. */
export interface IWorkflowService {
    /** Whether the transition can be made now: the form has the status it is made from, and is in the mode it is made in. */
    canTransition(form: FormModel<any>, id: string): boolean;
    /** Gets the transitions the form can make now: those made from its status, in its mode. */
    getTransitions(form: FormModel<any>): Array<IAvailableTransition>;
    /** Returns a form with the status and workflow history of a stored report, and the lock its status carries applied. Throws for a status a form cannot have. */
    restoreWorkflow<TForm extends FormModel<any>>(form: TForm, status?: FormStatus, stamp?: IWorkflowStamp): TForm;
    /**
     * Makes a transition, returning the form it leaves: its effect run, its status set, the entry kept in its history,
     * and the lock its new status carries applied. Throws unless the transition can be made now, and unless the form
     * has no validation error and satisfies whatever guard its transition names -- an open comment for one that needs
     * one, none open for one that needs the opposite.
     */
    transition<TForm extends FormModel<any>>(form: TForm, id: string, by: IActor, options: ITransitionOptions): TForm;
}

@Singleton
export class WorkflowService implements IWorkflowService {
    canTransition(form: FormModel<any>, id: string): boolean {
        return this.getTransitions(form).some(available => available.id === id);
    }

    getTransitions(form: FormModel<any>): Array<IAvailableTransition> {
        return Object.entries(form.workflow?.transitions ?? {})
            .filter(([, transition]) => transition.from.includes(form.status) && transition.mode === form.mode)
            .map(([id, transition]) => ({ id, transition }));
    }

    restoreWorkflow<TForm extends FormModel<any>>(form: TForm, status?: FormStatus, stamp?: IWorkflowStamp): TForm {
        if (status !== undefined && !Object.hasOwn(knownStatuses, status)) {
            throw new Error(`"${status}" is not a status a form can have.`);
        }

        const next = status === undefined ? form : form.setStatus(status) as TForm;

        return this.applyLocks(stamp ? withChanges(next, { history: [...stamp.history] }) : next);
    }

    transition<TForm extends FormModel<any>>(form: TForm, id: string, by: IActor, options: ITransitionOptions): TForm {
        const step = form.workflow?.transitions[id];

        if (!step) {
            throw new Error(`The form has no transition called "${id}".`);
        }

        if (!step.from.includes(form.status)) {
            throw new Error(`"${id}" cannot be made while the form is ${form.status}.`);
        }

        if (step.mode !== form.mode) {
            throw new Error(`"${id}" can only be made while the form is ${step.mode}.`);
        }

        if (options.issues.getIssues().some(issue => issue.severity === RuleIssueSeverity.error)) {
            throw new Error(`"${id}" cannot be made while the form has validation errors.`);
        }

        if (step.guards?.includes("hasOpenComments") && !options.openComments) {
            throw new Error(`"${id}" needs at least one open comment.`);
        }

        if (step.guards?.includes("noOpenComments") && options.openComments) {
            throw new Error(`"${id}" cannot be made while a comment is open.`);
        }

        const entry = {
            at: options.at ?? Date.now(),
            by,
            from: form.status,
            ...(options.note ? { note: options.note } : {}),
            to: step.to,
            transition: id
        };
        const moved = (step.effect ? step.effect(form) : form).setStatus(step.to) as TForm;

        return this.applyLocks(withChanges(moved, { history: [...moved.history, entry] }) as TForm);
    }

    /** Returns a form with the lock its workflow gives its current status applied, or the form itself when it gives none. */
    private applyLocks<TForm extends FormModel<any>>(form: TForm): TForm {
        const lock = form.workflow?.locks?.[form.status];

        return lock ? lock(form) as TForm : form;
    }
}
