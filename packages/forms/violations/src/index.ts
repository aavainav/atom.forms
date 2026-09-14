export { IViolationsConfiguration, ViolationsModule } from "./module";
// the option and the panel are exported for whoever renders a form to mount: this package registers neither, so
// that it stays below the renderer rather than reaching up into it
export { ViolationsOption, ViolationsPanel } from "./components";
export type { IViolationsOptionProps, IViolationsPanelProps } from "./components";
export { IViolationRegistrationService, IViolationSelectorService, IViolationService, ViolationSelectorService, ViolationService } from "./services";
export { toViolations, ViolationList } from "./models";
export { standardViolationLists, ViolationListId } from "./violations";

export type { IViolation, IViolationBinding, IViolationListDefinition, ViolationRow } from "./models";

// Nothing here reaches ./generated, and nothing should: each list is loaded through the dynamic import in its
// definition, which is what keeps a jurisdiction's code list out of the entry chunk until a selector asks for it.
