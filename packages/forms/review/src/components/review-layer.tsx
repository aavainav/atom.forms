import React from "react";
import { createPortal } from "react-dom";
import { getFieldControl, useActivePageId, usePrintState, IControllerManager, IModalOptions, FCommentMarker } from "@forms/core";

import { getReviewController } from "../controllers";
import { useReviewComments } from "../hooks";
import { getThreadModal } from "./thread-modal";

interface IReviewLayerProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** Opens a modal at the root of whatever is hosting the report -- never inside the report, which is scrolled and clipped. */
    readonly showModal: (options: IModalOptions) => void;
}

interface IFieldMarkerProps extends IReviewLayerProps {
    readonly fieldId: string;
}

/** Puts a marker in the corner of one field's control: how many comments it has, or -- for a reviewer -- an invitation to add one. */
const FieldMarker = ({ controllers, fieldId, showModal }: IFieldMarkerProps): React.JSX.Element | null => {
    const review = getReviewController(controllers);
    const control = getFieldControl(fieldId);
    const target = review.locateField(fieldId);
    const comments = review.getFieldComments(fieldId);

    // nothing to show, and nothing to add: an officer reading a report with no comment on this field has no use for a marker
    if (!control || !target || (comments.length === 0 && !review.canComment)) {
        return null;
    }

    const hasOpen = comments.some(comment => !comment.isResolved);
    const label = comments.length === 0
        ? "Add a comment"
        : `${comments.length === 1 ? "1 comment" : `${comments.length} comments`}${hasOpen ? "" : ", all resolved"}`;

    // portaled into the control, so the marker is placed by the control's own box and follows it as the page scrolls
    return createPortal(
        <FCommentMarker count={comments.length} hasOpen={hasOpen} label={label} onClick={() => showModal(getThreadModal(controllers, target))} />,
        control
    );
};

/**
 * Defines the layer of comment markers over a form: one in the corner of each field's control on the page showing.
 * It draws nothing itself -- each marker is portaled into its control -- and nothing while the form is printing.
 */
export const ReviewLayer = ({ controllers, showModal }: IReviewLayerProps): React.JSX.Element | null => {
    const review = getReviewController(controllers);
    const activePageId = useActivePageId(controllers.getNavigationController());
    const printState = usePrintState(controllers.getPrintController());

    // a marker is drawn from the comments, so it redraws as they change
    useReviewComments(review);

    // a page not showing has no controls in the document, so only the active page's fields can be marked
    if (printState || !activePageId) {
        return null;
    }

    return (
        <>
            {review.getFieldIds(activePageId).map(fieldId => (
                <FieldMarker key={fieldId} controllers={controllers} fieldId={fieldId} showModal={showModal} />
            ))}
        </>
    );
};
