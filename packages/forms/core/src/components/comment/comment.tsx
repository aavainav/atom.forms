import React from "react";

import { buildClasses } from "../../utils/class-names";
import { getMarginStyle, FMarginSize, IFMargin } from "../../utils/spacing";

interface IFCommentProps {
    /** When the comment was made, in milliseconds since the epoch. */
    readonly at: number;
    /** Who made it. */
    readonly author: string;
    /** Whether it has been dealt with. */
    readonly isResolved?: boolean;
    /** Sets the margin of the comment; default to 16 below, so a list of them is spaced. A bare size applies to all four sides. */
    readonly margin?: FMarginSize | IFMargin;
    /** What it says. */
    readonly text: string;
}

/** A comment on a report: who made it and when, what it says, and -- as its children -- whatever can be done with it. */
export default function FComment({ at, author, isResolved = false, margin, text, children }: React.PropsWithChildren<IFCommentProps>): React.JSX.Element {
    const madeAt = new Date(at);

    return (
        <div style={getMarginStyle({ bottom: 16 }, margin)} className={buildClasses("f-comment", isResolved ? "f-comment--resolved" : "")}>
            <div className="f-comment-header">
                <span className="f-comment-author">{author}</span>
                <time className="f-comment-time" dateTime={madeAt.toISOString()}>{madeAt.toLocaleString()}</time>
                {isResolved && <span className="f-comment-status">Resolved</span>}
            </div>
            <div className="f-comment-text">{text}</div>
            {children && <div className="f-comment-actions">{children}</div>}
        </div>
    );
}
