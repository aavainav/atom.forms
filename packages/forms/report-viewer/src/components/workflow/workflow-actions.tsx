import React from "react";
import { useService } from "@common/react";
import { useForm, IActor, IAvailableTransition, IControllerManager, FButton, FFormHeader, FGrid, FIcon, FTooltip, FWorkflowActions, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import { getReviewController, useReviewComments } from "@forms/review";
import { IWorkflowService } from "@forms/workflow";

import { IModalService, INotificationService, IReportViewerDataManager, IReportViewerService } from "../../services";
import { IValidationService } from "../../services/validation";

/** Spells a status out for the user: "inReview" reads "in review". */
export function toWords(status: string): string {
    return status.replace(/([A-Z])/g, " $1").toLowerCase();
}

interface IWorkflowActionsProps {
    /** The controllers belonging to the form this workflow actions is for. */
    readonly controllers: IControllerManager;
    /** Where the form's data goes when it is saved; the save option is offered only with one. */
    readonly dataManager?: IReportViewerDataManager<any>;
    /** The user who is acting upon this form, whether it is an officer, or reviewer. */
    readonly user?: IActor;
}

/**
 * The action bar above the form itself: a header naming the form and its current status, a Save button for a form
 * that can be saved, and a button for each transition a form with a workflow can make now. Nothing is rendered for
 * a form that can do neither.
 */
export const WorkflowActions = ({ controllers, dataManager, user }: IWorkflowActionsProps): React.JSX.Element | null => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const validationService = useService<IValidationService>(IValidationService);
    const workflowService = useService<IWorkflowService>(IWorkflowService);

    const formController = controllers.getFormController();
    const review = getReviewController(controllers);

    // the header and the buttons follow the form as it moves, and the comments a guard counts as they are added and resolved
    const form = useForm(formController);
    useReviewComments(review);

    const notifyFailure = (message: string): void => notificationService.showNotification({ type: "danger", message });

    const canSave = reportViewerService.canSaveForm(form, dataManager);

    const handleSave = async (): Promise<void> => {
        try {
            await reportViewerService.save(controllers, dataManager);
            notificationService.showNotification({ type: "success", message: "Report saved." });
        }
        catch (error) {
            notifyFailure(error instanceof Error ? error.message : "The report could not be saved.");
        }
    };

    const apply = async ({ id, transition }: IAvailableTransition, by: IActor, issues: RuleIssueCollection): Promise<void> => {
        try {
            await reportViewerService.transition(controllers, id, by, issues, dataManager);
        }
        catch (error) {
            notifyFailure(error instanceof Error ? error.message : `${transition.title} could not be made.`);
            return;
        }

        notificationService.showNotification({ type: "success", message: `${transition.title} complete.` });
    };

    const handleSelect = (available: IAvailableTransition, by: IActor): void => {
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

    if (!form.workflow && !canSave) {
        return null;
    }

    return (
        <FGrid>
            <FFormHeader title={form.name} subtitle={toWords(form.status)}>
                {canSave && (
                    <div className={form.workflow ? "me-2" : undefined}>
                        <FTooltip title="Save" placement="top">
                            <FButton id="save-button" variant="light" type="button" onClick={handleSave}>
                                <FIcon icon="floppy" />
                            </FButton>
                        </FTooltip>
                    </div>
                )}
                {form.workflow && <FWorkflowActions transitions={workflowService.getTransitions(form)} openComments={review.openCount} user={user} onSelect={handleSelect} />}
            </FFormHeader>
        </FGrid>
    );
}
