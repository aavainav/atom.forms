export * from "./module";

export { bootstrapper as OKParkingFormBootstrapper } from "./bootstrapper";
export { OKParkingFormLoader } from "./components";

/** The data contract a host app maps its own record data to and from. */
export type { IOKParkingData } from "./mapping";

/** The ids of the value lists this form owns, so a host can serve any of them from a source of its own. */
export { OKParkingValueListId } from "./value-lists";
