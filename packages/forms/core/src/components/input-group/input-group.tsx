import React from "react";

export default function FInputGroup({ children }: React.PropsWithChildren<{}>): React.JSX.Element {
    return <div className="input-group">{children}</div>;
}
