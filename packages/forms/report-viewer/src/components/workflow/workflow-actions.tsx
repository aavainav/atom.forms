import React from "react";
import { useService } from "@common/react";
import { getAuditController } from "@forms/audit";
import { useForm, IActor, IAvailableTransition, IControllerManager, FFormHeader, FormModel, FWorkflowActions, RuleIssueCollection, RuleIssueSeverity } from "@forms/core";
import { getReviewController, useReviewComments } from "@forms/review";

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
 * The action bar every form with a workflow gets, above the form itself: a header naming the form and its current
 * status, and a button for each transition the form can make now. Nothing is rendered for a form with no workflow.
 */
export const WorkflowActions = ({ controllers, dataManager, user }: IWorkflowActionsProps): React.JSX.Element | null => {
    const modalService = useService<IModalService>(IModalService);
    const notificationService = useService<INotificationService>(INotificationService);
    const reportViewerService = useService<IReportViewerService>(IReportViewerService);
    const validationService = useService<IValidationService>(IValidationService);

    const formController = controllers.getFormController();
    const review = getReviewController(controllers);

    // the header and the buttons follow the form as it moves, and the comments a guard counts as they are added and resolved
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

    if (!form.workflow) {
        return null;
    }

    return (
        <FFormHeader title={form.name} subtitle={toWords(form.status)}>
            <FWorkflowActions transitions={form.getTransitions()} openComments={review.openCount} user={user} onSelect={handleSelect} />
        </FFormHeader>
    );
}
