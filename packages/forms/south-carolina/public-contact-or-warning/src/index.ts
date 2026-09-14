export * from "./module";

export { bootstrapper as PublicContactOrWarningFormBootstrapper } from "./bootstrapper";

/** The data contract a host app maps its own record data to and from. */
export type { IPublicContactOrWarningData } from "./mapping";

/** The ids of the value lists this record owns, so a host can serve any of them from a source of its own. */
export { PublicContactOrWarningValueListId } from "./value-lists";