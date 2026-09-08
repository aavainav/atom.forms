import React from "react";
import { buildClasses } from "../../utils/class-names";

interface IFListGroupProps {
    readonly id?: string;
    readonly borderless?: boolean;
    readonly flush?: boolean;
}

export default function FListGroup({ id, borderless = false, flush = false, children }: React.PropsWithChildren<IFListGroupProps>): React.JSX.Element {
    return (
        <div id={id} className={buildClasses("list-group", borderless ? "list-group-borderless" : "", flush ? "list-group-flush" : "")}>
            {children}
        </div>
    );
}
