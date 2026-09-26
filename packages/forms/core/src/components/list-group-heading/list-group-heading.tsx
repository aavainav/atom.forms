import React from "react";

interface IFListGroupHeadingProps {
    readonly id?: string;
}

/** A row that titles the items beneath it in a list group. It cannot be acted on. */
export default function FListGroupHeading({ id, children }: React.PropsWithChildren<IFListGroupHeadingProps>): React.JSX.Element {
    return (
        <div id={id} className="list-group-item bg-body-tertiary small fw-semibold text-uppercase text-muted">
            {children}
        </div>
    );
}
