import React from "react";
import { IControllerManager, IModalOptions, FButton, FLabel, FOffCanvas } from "@forms/core";

import { getReviewController } from "../controllers";
import { useCanComment, useReviewComments } from "../hooks";
import { ReviewEntry } from "./review-entry";
import { getThreadModal } from "./thread-modal";

interface IReviewPanelProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** Whether the off canvas is currently shown. */
    readonly isOpen: boolean;
    /** Opens a modal at the root of whatever is hosting the report, for commenting on the report as a whole. */
    readonly showModal: (options: IModalOptions) => void;
    /** Invoked when the off canvas is closed. */
    readonly onClose: () => void;
}

/** Defines the review panel, an off canvas listing every comment on the report, open ones first, from which the reviewer can comment on the report as a whole. */
export const ReviewPanel = ({ controllers, isOpen, showModal, onClose }: IReviewPanelProps): React.JSX.Element => {
    const review = getReviewController(controllers);
    const comments = useReviewComments(review);
    const canComment = useCanComment(controllers);

    // a stable sort, so each group stays in the order its comments were made
    const ordered = [...comments].sort((a, b) => Number(a.isResolved) - Number(b.isResolved));

    return (
        // on the end edge, since the validation panel holds the start edge; the violations panel holds the end edge too, so a host offering both must not open both
        <FOffCanvas id="review-comments" isOpen={isOpen} placement="end">
            <FOffCanvas.Header borderVisibility="visible" onClose={onClose}><h5>Review</h5></FOffCanvas.Header>
            <FOffCanvas.Body>
                {canComment && (
                    <FButton
                        variant="outline-primary"
                        text="Comment on the report"
                        onClick={() => showModal(getThreadModal(controllers, { level: "form" }))}
                    />
                )}
                {ordered.length === 0
                    ? <FLabel margin={{ top: 16 }}>No comments yet.</FLabel>
                    : (
                        <div className="f-comment-list">
                            {ordered.map(comment => (
                                <ReviewEntry key={comment.id} comment={comment} controllers={controllers} onNavigate={onClose} />
                            ))}
                        </div>
                    )}
            </FOffCanvas.Body>
        </FOffCanvas>
    );
}
