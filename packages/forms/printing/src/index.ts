export * from "./module";
export * from "./services";

// there is no bootstrapper here any more: @forms/report-viewer depends on this module and renders the print
// option itself, so a host gets printing by rendering a report rather than by naming it at startup.
export { PrintDialog, PrintOption } from "./components";
export type { IPrintOptionProps } from "./components";

export { IPrintingOptions } from "./options";

/** The copies a form publishes, which a form package registers through `IPrintingConfiguration`. */
export type { IPrintProfile, PrintLayout, PrintOrientation, PrintPaper } from "./models";
