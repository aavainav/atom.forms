import React from "react";

import { FListGroup, FListGroupHeading, FOffCanvas, FormModel, IControllerManager, IRuleIssue, RuleIssueSeverity } from "@forms/core";

import { ValidationErrorEntry } from "./validation-entry";

interface IValidationProps {
    /** The controllers belonging to the form this validation panel is for, so an entry can navigate to its field. */
    readonly controllers: IControllerManager;
    readonly issues: ReadonlyArray<IRuleIssue>;
    /** Whether the off canvas is currently shown. */
    readonly isOpen: boolean;
    /** Invoked when the off canvas is closed. */
    readonly onClose: () => void;
}

/** The issues in one place on the form, under one heading. */
interface IIssueGroup {
    readonly heading: string;
    readonly issues: ReadonlyArray<IRuleIssue>;
}

/**
 * Sorts the issues under a heading for the page and section they are in, in the order they were raised. A page that
 * repeats is numbered, unless the section is shared: that holds the same on every copy, so its issue is on all of them.
 */
function toGroups(issues: ReadonlyArray<IRuleIssue>, form: FormModel<any>): ReadonlyArray<IIssueGroup> {
    const groups = new Map<string, Array<IRuleIssue>>();

    for (const issue of issues) {
        const page = issue.section.getPageDefinition();
        const pages = form.getPagesFor(page);
        const ordinal = pages.findIndex(entry => entry.id === form.getPageIdForIssue(issue));
        const pageTitle = pages.length > 1 && ordinal >= 0 && !issue.section.isShared ? `${page.title} ${ordinal + 1}` : page.title;
        const heading = `${pageTitle} · ${issue.section.title}`;

        groups.set(heading, [...(groups.get(heading) ?? []), issue]);
    }

    return [...groups].map(([heading, members]) => ({ heading, issues: members }));
}

/** Counts the issues of each severity, as the line under the header says it: "12 errors · 1 warning". */
function describeCounts(issues: ReadonlyArray<IRuleIssue>): string {
    const errors = issues.filter(issue => issue.severity === RuleIssueSeverity.error).length;
    const warnings = issues.length - errors;
    const count = (total: number, noun: string): string => `${total} ${noun}${total === 1 ? "" : "s"}`;

    return [errors > 0 ? count(errors, "error") : "", warnings > 0 ? count(warnings, "warning") : ""].filter(Boolean).join(" · ");
}

/** Defines the validation panel: an off canvas listing the form's issues, grouped by the page and section they are in. */
export default function Validation({ controllers, issues, isOpen, onClose }: IValidationProps): React.JSX.Element {
    const form = controllers.getFormController().form;

    return (
        <FOffCanvas id="validation-errors" isOpen={isOpen}>
            <FOffCanvas.Header borderVisibility="visible" onClose={onClose}><h5>Validation</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                {issues.length === 0
                    ? <div className="text-muted fst-italic">No validation issues found.</div>
                    : (
                        <>
                            <p id="validation-summary" className="small text-muted">{describeCounts(issues)}</p>
                            {toGroups(issues, form).map(({ heading, issues: members }) => (
                                <div className="mb-2" key={heading}>
                                    <FListGroup>
                                        <FListGroupHeading>{heading} ({members.length})</FListGroupHeading>
                                        {members.map((issue, index) => (
                                            <ValidationErrorEntry key={index} controllers={controllers} issue={issue} />
                                        ))}
                                    </FListGroup>
                                </div>
                            ))}
                        </>
                    )}
            </FOffCanvas.Body>
        </FOffCanvas>
    );
}
