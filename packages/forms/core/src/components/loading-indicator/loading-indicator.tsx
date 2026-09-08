import React from "react";
import { buildClasses } from "../../utils/class-names";

export type IndicatorType = "solid";

interface IFLoadingIndicatorProps {
    readonly type?: IndicatorType;
}

export default function FLoadingIndicator({ type = "solid" }: IFLoadingIndicatorProps): React.JSX.Element {
    return <div className={buildClasses(type === "solid" ? "loading-indicator-background-animation" : "")} />;
}
