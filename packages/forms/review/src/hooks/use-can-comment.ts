import { useCallback, useSyncExternalStore } from "react";
import { IControllerManager } from "@forms/core";

import { getReviewController } from "../controllers";

/** Subscribes to the form, re-rendering when whether a comment can be added changes, as a reviewer's approving or rejecting the report does by moving it out of review. */
export function useCanComment(controllers: IControllerManager): boolean {
    const review = getReviewController(controllers);
    const formController = controllers.getFormController();

    // the subscribe function must be stable or react resubscribes on every render; the form controller is cached by its
    // manager, so keying on it is enough. every edit raises a change, but only a different answer renders again
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = formController.onChanged(onStoreChange);
        return () => listener.remove();
    }, [formController]);

    return useSyncExternalStore(subscribe, () => review.canComment, () => review.canComment);
}
