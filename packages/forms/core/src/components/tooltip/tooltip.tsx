import React, { useEffect, useRef } from "react";
import Tooltip from "bootstrap/js/dist/tooltip";

export type TooltipPlacement = "top" | "right" | "bottom" | "left";

interface IFTooltipProps {
    readonly placement?: TooltipPlacement;
    readonly title?: string;
}

export default function FTooltip({ placement = "top", title, children }: React.PropsWithChildren<IFTooltipProps>): React.JSX.Element {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!rootRef.current) {
            return;
        }

        const tooltip = new Tooltip(rootRef.current, { animation: false, container: "body", customClass: "pe-none" });
        return () => tooltip.dispose();
    }, []);

    return (
        <div ref={rootRef} data-bs-toggle="tooltip" data-bs-placement={placement} title={title}>
            {children}
        </div>
    );
}
