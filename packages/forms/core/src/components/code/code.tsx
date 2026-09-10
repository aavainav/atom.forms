import React from "react";
import { getMarginStyle, getPaddingStyle, FMarginSize, FPaddingSize, IFMargin, IFPadding } from "../../utils/spacing";

interface IFCodeProps {
    /** Sets the margin of the code block. A bare size applies to all four sides. */
    readonly margin?: FMarginSize | IFMargin;
    /** Sets the padding of the code block. A bare size applies to all four sides. */
    readonly padding?: FPaddingSize | IFPadding;
}

/** Defines a block of preformatted code, rendered as a bordered panel so it reads as code rather than as body text. */
export default function FCode({ margin, padding, children }: React.PropsWithChildren<IFCodeProps>): React.JSX.Element {
    const style: React.CSSProperties = {
        ...getMarginStyle(undefined, margin),
        ...getPaddingStyle(undefined, padding)
    };

    return (
        <pre style={style} className="f-code">
            <code>{children}</code>
        </pre>
    );
}
