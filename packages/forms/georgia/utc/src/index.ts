export * from "./module";

export { bootstrapper as GAUTCFormBootstrapper } from "./bootstrapper";
export { GAUTCFormLoader } from "./components";

/** The data contract a host app maps its own record data to and from. */
export type { IGAUTCData, IGAUTCViolationData } from "./mapping";

/** The ids of the value lists this form owns, so a host can serve any of them from a source of its own. */
export { GAUTCValueListId } from "./value-lists";
