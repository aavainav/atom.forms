export * from "./module";

export { bootstrapper as TR310CrashFormBootstrapper } from "./bootstrapper";
export { TR310FormLoader } from "./components";

/** The data contract a host app maps its own record data to and from. */
export type { ITR310Data, ITR310PersonData, ITR310UnitData } from "./mapping";

/** The ids of the value lists this report owns, so a host can serve any of them from a source of its own. */
export { TR310ValueListId } from "./value-lists";
