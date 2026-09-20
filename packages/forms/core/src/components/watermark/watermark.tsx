import React from "react";
import { FormStatus } from "../../models/form";

interface IFWatermarkProps {
    /** The rotation of the watermark, in degrees measured clockwise from horizontal. Defaults to the angle of its container's top left to bottom right diagonal. */
    readonly angle?: number;
    /** How much of the container's diagonal the watermark spans, from 0 to 1. Defaults to 0.9, which leaves a small margin at each corner. */
    readonly fill?: number;
}

/** The fraction of the container's diagonal the watermark spans when no fill is given. */
const defaultFill = 0.9;

/** The watermark stamped across a form in each status. A status with no entry carries none: an issued citation or an approved crash report is the document itself rather than a copy of one. */
const statusWatermarks: Partial<Record<FormStatus, string>> = {
    canceled: "CANCELED",
    draft: "DRAFT",
    inProgress: "IN PROGRESS",
    rejected: "REJECTED",
    voided: "VOID"
};

/** Gets the watermark to stamp across a form in the given status, or undefined when that status carries none. */
export function getStatusWatermark(status: FormStatus): string | undefined {
    return statusWatermarks[status];
}

/** Defines the watermark component. The watermark is stamped across its nearest positioned ancestor - the page, when rendered by `FPage` - running from top left to bottom right, and ignores pointer input so the content beneath it stays usable. */
export default function FWatermark({ angle, fill = defaultFill, children }: React.PropsWithChildren<IFWatermarkProps>): React.JSX.Element {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLSpanElement>(null);
    
    const [rotation, setRotation] = React.useState(angle ?? 0);
    const [scale, setScale] = React.useState(0);

    React.useLayoutEffect(() => {
        const root = rootRef.current;
        const content = contentRef.current;

        if (!root || !content) {
            return;
        }

        const measure = (): void => {
            const width = root.clientWidth;
            const height = root.clientHeight;
            // offsetWidth is the untransformed layout width, so the text is always measured at its base font size rather than at the scale already applied to it
            const contentWidth = content.offsetWidth;

            setRotation(angle ?? (Math.atan2(height, width) * 180) / Math.PI);
            setScale(contentWidth > 0 ? (Math.hypot(width, height) * fill) / contentWidth : 0);
        };

        measure();

        if (typeof ResizeObserver === "undefined") {
            return;
        }

        // the page grows and shrinks as its sections render, and the watermark text is re-measured once the web font loads, so both are observed rather than measured just once
        const observer = new ResizeObserver(measure);

        observer.observe(root);
        observer.observe(content);

        return () => observer.disconnect();
    }, [angle, fill]);

    return (
        <div ref={rootRef} className="f-watermark" aria-hidden="true">
            <span ref={contentRef} className="f-watermark-content" style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})` }}>
                {children}
            </span>
        </div>
    );
}
