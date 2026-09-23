import { citationWorkflow, crashWorkflow, withChanges, CitationForm, CrashForm, DefinitionFactory } from "@forms/core";
import type { ICrash, IWorkflow } from "@forms/core";

/**
 * The two abstract families a jurisdiction's form is built from, each made concrete over no pages at all, since what
 * is under test is the workflow the family brings and not anything a page holds. The setters a transition's effect
 * calls only note that they were called, so that a test can see the effect ran.
 *
 * As with every fixture, each form is its own class and its definition is built once, here, at module scope.
 */
export class PresetCitationForm extends CitationForm<any> {
    public readonly workflow: IWorkflow = citationWorkflow;
    public readonly stamped: ReadonlyArray<string> = [];

    public setDateOfViolation(): this { return this; }
    public setIssuedDate(): this { return withChanges(this, { stamped: [...this.stamped, "date"] }); }
    public setIssuedTime(): this { return withChanges(this, { stamped: [...this.stamped, "time"] }); }
    public setTicketNumber(): this { return this; }
    public setTimeOfViolation(): this { return this; }
}

export class PresetCrashForm extends CrashForm<any> {
    public readonly workflow: IWorkflow = crashWorkflow;

    public getCrashData(): ICrash { return {} as ICrash; }
    public setCrashNumber(): this { return this; }
    public setDateOfCrash(): this { return this; }
    public setTimeOfCrash(): this { return this; }
}

export const presetCitationDefinition = DefinitionFactory.form("test-preset-citation", PresetCitationForm, {});
export const presetCrashDefinition = DefinitionFactory.form("test-preset-crash", PresetCrashForm, {});
