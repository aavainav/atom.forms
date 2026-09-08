import React from "react";

export default function FSection({ children }: React.PropsWithChildren<{}>): React.JSX.Element {
    return <div className="f-section">{children}</div>;
}
