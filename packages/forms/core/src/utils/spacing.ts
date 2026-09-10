import type { CSSProperties } from "react";

/** An exact padding value in pixels; `0` removes the padding entirely. */
export type FPaddingSize = number;
/** An exact margin value in pixels, which may additionally be `auto` to center or push. */
export type FMarginSize = FPaddingSize | "auto";

/** Per-side margin. A side left unset keeps the component's own default for that side. */
export interface IFMargin {
    /** Margin on all four sides. */
    readonly all?: FMarginSize;
    /** Margin on the bottom side. */
    readonly bottom?: FMarginSize;
    /** Margin on the end side. */
    readonly end?: FMarginSize;
    /** Margin on the start side. */
    readonly start?: FMarginSize;
    /** Margin on the top side. */
    readonly top?: FMarginSize;
    /** Margin on the start and end sides. */
    readonly x?: FMarginSize;
    /** Margin on the top and bottom sides. */
    readonly y?: FMarginSize;
}

/** Per-side padding. A side left unset keeps the component's own default for that side. */
export interface IFPadding {
    /** Padding on all four sides. */
    readonly all?: FPaddingSize;
    /** Padding on the bottom side. */
    readonly bottom?: FPaddingSize;
    /** Padding on the end side. */
    readonly end?: FPaddingSize;
    /** Padding on the start side. */
    readonly start?: FPaddingSize;
    /** Padding on the top side. */
    readonly top?: FPaddingSize;
    /** Padding on the start and end sides. */
    readonly x?: FPaddingSize;
    /** Padding on the top and bottom sides. */
    readonly y?: FPaddingSize;
}

type SpacingSide = keyof IFMargin;
type SpacingValues = Partial<Record<SpacingSide, FMarginSize>>;

/** The CSS property suffixes each side maps to, ensuring narrower sides can override broader ones. */
const cssKeysBySide: Record<SpacingSide, Array<"Top" | "Bottom" | "InlineStart" | "InlineEnd">> = {
    all: ["Top", "Bottom", "InlineStart", "InlineEnd"],
    x: ["InlineStart", "InlineEnd"],
    y: ["Top", "Bottom"],
    top: ["Top"],
    end: ["InlineEnd"],
    bottom: ["Bottom"],
    start: ["InlineStart"]
};

const sideOrder: SpacingSide[] = ["all", "x", "y", "top", "end", "bottom", "start"];

/** The sides a broader side covers, and therefore displaces when a caller sets it. */
const displacedSides: Partial<Record<SpacingSide, Array<SpacingSide>>> = {
    all: ["bottom", "end", "start", "top", "x", "y"],
    x: ["end", "start"],
    y: ["bottom", "top"]
};

/**
 * Resolves a component's own spacing defaults against the spacing a caller asked for and builds inline styles
 * for the result. A side the caller supplies removes any default it covers, so an explicit value clears a default
 * it would normally overlay.
 */
function buildSpacingStyle(prefix: "margin" | "padding", defaults: SpacingValues | undefined, spacing: FMarginSize | SpacingValues | undefined): CSSProperties {
    if (!defaults && !spacing) {
        return {};
    }

    // a bare size is shorthand for all four sides
    const sides = typeof spacing === "number" || spacing === "auto" ? { all: spacing } : spacing;
    const resolved: SpacingValues = { ...defaults };

    if (sides) {
        Object.keys(sides).forEach(key => {
            const side = key as SpacingSide;

            if (sides[side] === undefined) {
                return;
            }

            displacedSides[side]?.forEach(displaced => delete resolved[displaced]);
            resolved[side] = sides[side];
        });
    }

    const style: CSSProperties = {};

    sideOrder.forEach(side => {
        const value = resolved[side];
        if (value === undefined) return;

        cssKeysBySide[side].forEach(suffix => {
            (style as Record<string, unknown>)[`${prefix}${suffix}`] = value;
        });
    });

    return style;
}

/** Builds margin styles for an element, resolving defaults against caller-supplied values. */
export function getMarginStyle(defaults: IFMargin | undefined, margin: FMarginSize | IFMargin | undefined): CSSProperties {
    return buildSpacingStyle("margin", defaults, margin);
}

/** Builds padding styles for an element. */
export function getPaddingStyle(defaults: IFPadding | undefined, padding: FPaddingSize | IFPadding | undefined): CSSProperties {
    return buildSpacingStyle("padding", defaults, padding);
}
