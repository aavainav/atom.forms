import React, { useState } from "react";
import { IControllerManager, FButton, FComment, FFieldTextArea, FLabel } from "@forms/core";

import { getReviewController } from "../controllers";
import { useReviewComments } from "../hooks";
import { ReviewTarget } from "../models";

interface IReviewThreadProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** What the comments are about. */
    readonly target: ReviewTarget;
}

/** Defines the body of the thread modal: the comments made on one target, with the means to resolve them and to add another. */
export const ReviewThread = ({ controllers, target }: IReviewThreadProps): React.JSX.Element => {
    const review = getReviewController(controllers);
    const [text, setText] = useState("");

    // the subscription is what schedules a render when a comment is added or resolved; they are read through the controller
    useReviewComments(review);

    const comments = review.getComments(target);

    const add = (): void => {
        review.add(target, text);
        setText("");
    };

    return (
        <>
            {comments.length === 0 && <FLabel margin={{ bottom: 16 }}>No comments yet.</FLabel>}
            {comments.map(comment => (
                <FComment key={comment.id} at={comment.at} author={comment.author} isResolved={comment.isResolved} text={comment.text}>
                    {review.canResolve && (
                        <FButton
                            variant="outline-secondary"
                            size="small"
                            text={comment.isResolved ? "Reopen" : "Resolve"}
                            onClick={() => review.setResolved(comment.id, !comment.isResolved)}
                        />
                    )}
                </FComment>
            ))}
            {review.canComment && (
                <>
                    <FFieldTextArea label="Add a comment" placeholder="Add a comment" margin={{ bottom: 8 }} value={text} onChange={setText} />
                    <FButton text="Comment" disabled={!text.trim()} onClick={add} />
                </>
            )}
        </>
    );
}
