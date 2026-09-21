import { IControllerManager, IModalOptions } from "@forms/core";

import { getReviewController } from "../controllers";
import { ReviewTarget } from "../models";
import { ReviewThread } from "./review-thread";

/** Gets the options for a modal showing a target's comments, for the host to open wherever it opens modals. */
export function getThreadModal(controllers: IControllerManager, target: ReviewTarget): IModalOptions {
    return {
        title: getReviewController(controllers).describeTarget(target),
        content: ReviewThread,
        contentProps: { controllers, target },
        close: { invoke: async () => ({ result: true }) },
        actions: [{ title: "Close", invoke: async () => ({ result: true }) }]
    };
}
