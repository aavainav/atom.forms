export { ReviewLayer, ReviewPanel, ReviewThread, getThreadModal } from "./components";

// importing the controller is what registers it with core
export { ReviewController, getReviewController } from "./controllers";
export type { IReviewController } from "./controllers";

export { useReviewComments } from "./hooks";

export { getTargetKey } from "./models";
export type { IReviewComment, ReviewTarget } from "./models";
