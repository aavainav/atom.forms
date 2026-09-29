import React from "react";
import { IControllerManager, FButton, FComment } from "@forms/core";

import { getReviewController } from "../controllers";
import { IReviewComment } from "../models";

interface IResolvableCommentProps {
    /** The comment to display. */
    readonly comment: IReviewComment;
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
}

/** A comment shown with the means to resolve or reopen it, used wherever comments are listed. */
export const ResolvableComment = ({ comment, controllers }: IResolvableCommentProps): React.JSX.Element => {
    const review = getReviewController(controllers);

    return (
        <FComment at={comment.at} author={comment.author.name} isResolved={comment.isResolved} text={comment.text}>
            {review.canResolve && (
                <FButton
                    variant="outline-secondary"
                    size="small"
                    text={comment.isResolved ? "Reopen" : "Resolve"}
                    onClick={() => review.setResolved(comment.id, !comment.isResolved)}
                />
            )}
        </FComment>
    );
}
