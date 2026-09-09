import { buildClasses } from "./class-names";

/** A step on the Bootstrap spacer scale; `0` removes the padding entirely. */
export type FPaddingSize = "0" | "1" | "2" | "3" | "4" | "5";
/** A step on the Bootstrap spacer scale for a margin, which may additionally be `auto` to center or push. */
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
type SpacingValues = Partial<Record<SpacingSide, string>>;

/**
 * The Bootstrap class suffix for each side, listed in the order Bootstrap itself emits the utilities
 * (all sides, then each axis, then each edge) so that a narrower side always wins over a broader one.
 */
const classSuffixes: Record<SpacingSide, string> = {
    all: "",
    x: "x",
    y: "y",
    top: "t",
    end: "e",
    bottom: "b",
    start: "s"
};

/** The sides a broader side covers, and therefore displaces when a caller sets it. */
const displacedSides: Partial<Record<SpacingSide, Array<SpacingSide>>> = {
    all: ["bottom", "end", "start", "top", "x", "y"],
    x: ["end", "start"],
    y: ["bottom", "top"]
};

/**
 * Resolves a component's own spacing defaults against the spacing a caller asked for and builds the Bootstrap
 * classes for the result. Every Bootstrap spacing utility is a single class selector, so a class appended to a
 * default cannot override it -- the winner is decided by stylesheet order, not by the class attribute. A side
 * the caller supplies therefore removes any default it covers rather than being emitted alongside it.
 */
function buildSpacing(prefix: string, defaults: SpacingValues | undefined, spacing: string | SpacingValues | undefined): string {
    if (!defaults && !spacing) {
        return "";
    }

    // a bare size is shorthand for all four sides
    const sides = typeof spacing === "string" ? { all: spacing } : spacing;
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

    return buildClasses(...Object.keys(classSuffixes).map(key => {
        const side = key as SpacingSide;
        const size = resolved[side];

        return size !== undefined ? `${prefix}${classSuffixes[side]}-${size}` : "";
    }));
}

/**
 * Builds the Bootstrap margin classes for an element, resolving a component's own defaults against the margin
 * a caller asked for. A side the caller supplies removes any default it covers, so `"0"` clears a default
 * `top` margin rather than losing to it on stylesheet order.
 */
export function getMarginClasses(defaults: IFMargin | undefined, margin: FMarginSize | IFMargin | undefined): string {
    return buildSpacing("m", defaults, margin);
}

/** Builds the Bootstrap padding classes for an element. */
export function getPaddingClasses(defaults: IFPadding | undefined, padding: FPaddingSize | IFPadding | undefined): string {
    return buildSpacing("p", defaults, padding);
}
