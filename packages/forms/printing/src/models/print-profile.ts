import { PrintLayout } from "@forms/core";

export type { PrintLayout };

/** The way round a sheet is printed. */
export type PrintOrientation = "landscape" | "portrait";

/** The size of sheet a copy is printed on. */
export type PrintPaper = "a4" | "legal" | "letter";

/** Defines one printable copy of a form, e.g. the copy handed to the violator or the copy filed with the court. */
export interface IPrintProfile {
    /** Identifies the copy within the form it belongs to. */
    readonly id: string;
    /** The name shown when choosing what to print, e.g. "Violator copy". */
    readonly name: string;
    /** What the copy is for and who receives it, shown beneath its name. */
    readonly description?: string;
    /** The layout the copy prints in unless the user picks another. Defaults to "top-down". */
    readonly layout?: PrintLayout;
    /** The way round the sheet is printed. Defaults to landscape for a side-by-side copy and portrait otherwise. */
    readonly orientation?: PrintOrientation;
    /**
     * The names of the page definitions in this copy, in print order — the same names the form's factory keys
     * `getPageTypes()` by, e.g. "complaint-page". A name belonging to a page type that repeats contributes every
     * instance of it.
     */
    readonly pages: ReadonlyArray<string>;
    /** The size of sheet the copy is printed on. Defaults to letter. */
    readonly paper?: PrintPaper;
    /** Pins the factor the pages are scaled by; the copy is measured and scaled to fit its sheet when omitted. */
    readonly scale?: number;
}
