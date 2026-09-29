import React, { useId, useState } from "react";
import { IControllerManager, FButton, FFieldTextArea, FLabel } from "@forms/core";

import { getReviewController } from "../controllers";
import { useCanComment, useReviewComments } from "../hooks";
import { ReviewTarget } from "../models";
import { ResolvableComment } from "./resolvable-comment";

interface IReviewThreadProps {
    /** The controllers belonging to the form being reviewed. */
    readonly controllers: IControllerManager;
    /** What the comments are about. */
    readonly target: ReviewTarget;
}

/** Defines the body of the thread modal: the comments made on one target, with the means to resolve them and to add another. */
export const ReviewThread = ({ controllers, target }: IReviewThreadProps): React.JSX.Element => {
    const review = getReviewController(controllers);

    const commentId = useId();
    const [text, setText] = useState("");

    // the subscription is what schedules a render when a comment is added or resolved; they are read through the controller
    useReviewComments(review);
    const canComment = useCanComment(controllers);

    const comments = review.getComments(target);

    const add = (): void => {
        review.add(target, text);
        setText("");
    };

    return (
        <>
            {comments.length === 0 && <FLabel margin={{ bottom: 16 }}>No comments yet.</FLabel>}
            {comments.length > 0 && (
                <div className="f-comment-list">
                    {comments.map(comment => (
                        <ResolvableComment key={comment.id} comment={comment} controllers={controllers} />
                    ))}
                </div>
            )}
            {canComment && (
                <>
                    <FFieldTextArea id={commentId} label="Add a comment" placeholder="Add a comment" margin={{ bottom: 8 }} value={text} onChange={setText} />
                    <FButton text="Comment" disabled={!text.trim()} onClick={add} />
                </>
            )}
        </>
    );
}
