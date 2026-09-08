import { createOptions } from "@shrub/core";

import { PrintOrientation, PrintPaper } from "./models/print-profile";

export const IPrintingOptions = createOptions<IPrintingOptions>("printing-module-options", {
});

/** Defines the options for printing, which set the defaults a copy that names none of its own is printed with. */
export interface IPrintingOptions {
    /** The margin left around the sheet, in inches. Defaults to 0.4. */
    readonly margin?: number;
    /** The way round the sheet is printed. A copy that names neither this nor its own is printed landscape when it lays its pages side by side, and portrait otherwise. */
    readonly orientation?: PrintOrientation;
    /** The size of sheet printed on. Defaults to letter. */
    readonly paper?: PrintPaper;
}
