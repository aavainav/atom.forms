import React from "react";
import { IControllerManager, FButton, FComment, FLabel } from "@forms/core";

import { getReviewController } from "../controllers";
import { IReviewComment } from "../models";

interface IReviewEntryProps {
    /** The comment to display. */
    readonly comment: IReviewComment;
    /** The controllers belonging to the form being reviewed, so the entry can navigate to what its comment is about. */
    readonly controllers: IControllerManager;
    /** Invoked after the entry navigates the form to what its comment is about. */
    readonly onNavigate: () => void;
}

/** Defines an entry in the review panel: a comment, where in the form it was made -- which takes the user there -- and the means to resolve it. */
export const ReviewEntry = ({ comment, controllers, onNavigate }: IReviewEntryProps): React.JSX.Element => {
    const review = getReviewController(controllers);
    const location = review.describeTarget(comment.target);
    const destination = review.getNavigationTarget(comment.target);

    const navigate = (): void => {
        if (destination) {
            controllers.getNavigationController().goTo(destination);
            onNavigate();
        }
    };

    return (
        <>
            {/* the whole form, and a page since removed, have nowhere to go */}
            {destination
                ? <FButton type="button" variant="link" size="small" text={location} onClick={navigate} />
                : <FLabel>{location}</FLabel>}
            <FComment at={comment.at} author={comment.author} isResolved={comment.isResolved} text={comment.text}>
                {review.canResolve && (
                    <FButton
                        variant="outline-secondary"
                        size="small"
                        text={comment.isResolved ? "Reopen" : "Resolve"}
                        onClick={() => review.setResolved(comment.id, !comment.isResolved)}
                    />
                )}
            </FComment>
        </>
    );
}
