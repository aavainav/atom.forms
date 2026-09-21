import React from "react";

import { FIcon } from "../icon";

import { buildClasses } from "../../utils/class-names";

interface IFCommentMarkerProps {
    /** How many comments the marker stands for. With none it is an invitation to add the first, shown when its control is hovered or it is focused. */
    readonly count: number;
    /** Whether any of them has not been resolved, which is what the marker draws attention to. */
    readonly hasOpen?: boolean;
    /** What the marker does, for assistive technology and the tooltip. */
    readonly label: string;

    /** Invoked when the marker is clicked. */
    onClick: () => void;
}

/** A button in the corner of a control: the number of comments on it, or an invitation to add the first. The control it sits in has to be positioned. */
export default function FCommentMarker({ count, hasOpen = false, label, onClick }: IFCommentMarkerProps): React.JSX.Element {
    return (
        <button
            type="button"
            className={buildClasses("f-comment-marker", count ? "f-comment-marker--commented" : "f-comment-marker--empty", hasOpen ? "f-comment-marker--open" : "")}
            aria-label={label}
            title={label}
            onClick={onClick}
        >
            {count > 0 ? count : <FIcon icon="chat-left-text" variant="light" />}
        </button>
    );
}
