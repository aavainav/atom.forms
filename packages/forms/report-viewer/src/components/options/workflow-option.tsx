import React from "react";
import { useService } from "@common/react";
import { getAuditController } from "@forms/audit";
import { useForm, IActor, IAvailableTransition, IWorkflowTransition, WorkflowGuard, FButton, FFormStackPanel, FormModel, FTooltip, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import { getReviewController, useReviewComments } from "@forms/review";

import { IModalService, INotificationService, IReportViewerOptionProps, IReportViewerService } from "../../services";
import { IValidationService } from "../../services/validation";

/** What each guard needs of the report, and what to tell the user while it is not so. */
const guards: Record<WorkflowGuard, { readonly isMet: (openComments: number) => boolean; readonly message: string }> = {
    hasOpenComments: { isMet: openComments => openComments > 0, message: "Add a comment first, so the author knows what to fix." }
};

/** Says why the transition cannot be made yet, or nothing when it can. */
function getBlocker(transition: IWorkflowTransition, openComments: number, user?: IActor): string | undefined {
    if (!user) {
        return "Say who is using the report before making this change.";
    }

    return transition.guards?.map(guard => guards[guard]).find(guard => !guard.isMet(openComments))?.message;
}

/** Spells a status out for the user: "inReview" reads "in review". */
function toWords(status: string): string {
    return status.replace(/([A-Z])/g, " $1").toLowerCase();
}

/**
 * Defines the option for making the transitions the report's workflow offers: a button for each that can be made
 * now, which follows the report as it moves. Making one validates the report first, asks the user to confirm, saves
 * the report as the transition leaves it, and only then applies it to the form on screen, so a save that fails leaves
 * neither the form nor its audit history claiming a change that was never kept.
 */
export const WorkflowOption = ({ controllers, dataManager, user }: IReportViewerOptionProps): React.JSX.Element => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const validationService = useService<IValidationService>(IValidationService);

    const formController = controllers.getFormController();
    const review = getReviewController(controllers);

    // the buttons follow the form as it moves, and the comments a guard counts as they are added and resolved
    const form = useForm(formController);
    useReviewComments(review);

    const notifyFailure = (message: string): void => notificationService.showNotification({ type: "danger", message });

    const apply = async ({ id, transition }: IAvailableTransition, by: IActor, issues: RuleIssueCollection): Promise<void> => {
        // the form controller owns the current model and replaces it on every edit, so it is read at confirm time
        let next: FormModel<any>;

        try {
            next = formController.form.transition(id, by, { issues, openComments: review.openCount });
        }
        catch (error) {
            notifyFailure(error instanceof Error ? error.message : `${transition.title} could not be made.`);
            return;
        }

        const isSaved = reportViewerService.canSaveForm(next, dataManager);

        try {
            if (isSaved) {
                await reportViewerService.saveForm(next, dataManager, controllers);
            }
        }
        catch (error) {
            getAuditController(controllers).recordSaveFailed();
            notifyFailure(error instanceof Error ? error.message : "The report could not be saved.");
            return;
        }

        // the audit records the transition as the form is replaced, and then the save that kept it
        formController.update(() => next.clean());

        if (isSaved) {
            getAuditController(controllers).recordSaved();
        }

        notificationService.showNotification({ type: "success", message: `${transition.title} complete.` });
    };

    const handleClick = (available: IAvailableTransition, by: IActor): void => {
        const issues = validationService.validate(controllers);
        const errors = issues.getIssues().filter(issue => issue.severity === RuleIssueSeverity.error);

        if (errors.length > 0) {
            notifyFailure(`${errors.length} validation issue(s) must be fixed before "${available.transition.title}".`);
            return;
        }

        modalService.showConfirmModal({
            title: available.transition.title,
            message: `The report will move from ${toWords(formController.form.status)} to ${toWords(available.transition.to)}. Continue?`,
            confirmText: available.transition.title,
            onCancel: async () => {},
            onConfirm: () => apply(available, by, issues)
        });
    };

    return (
        <FFormStackPanel direction="horizontal">
            {form.getTransitions().map((available, index) => {
                const blocker = getBlocker(available.transition, review.openCount, user);
                const button = (
                    <FButton
                        id={`workflow-${available.id}-button`}
                        variant="primary"
                        type="button"
                        text={available.transition.title}
                        disabled={!!blocker}
                        onClick={() => user && handleClick(available, user)}
                    />
                );

                return (
                    <div key={available.id} className={index === 0 ? undefined : "ms-2"}>
                        {/* a disabled button raises no mouse events, so its tooltip sits on a wrapper; bootstrap reads
                            a tooltip's title once, when it is built, so a new reason needs a new tooltip */}
                        {blocker ? <FTooltip key={blocker} title={blocker} placement="top"><span className="d-inline-block">{button}</span></FTooltip> : button}
                    </div>
                );
            })}
        </FFormStackPanel>
    );
}
