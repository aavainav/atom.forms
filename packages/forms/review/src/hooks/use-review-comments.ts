import { useCallback, useSyncExternalStore } from "react";

import { IReviewController } from "../controllers";
import { IReviewComment } from "../models";

/** Subscribes to the review controller, re-rendering with the comments whenever one is added or changed. */
export function useReviewComments(controller: IReviewController): ReadonlyArray<IReviewComment> {
    // the subscribe function must be stable or react resubscribes on every render; the controller is cached by its
    // manager, so keying on it is enough. note the event hands back a listener rather than an unsubscribe function.
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = controller.onChanged(onStoreChange);
        return () => listener.remove();
    }, [controller]);

    // the controller holds the same array until a comment changes, which is what makes it a snapshot
    return useSyncExternalStore(subscribe, () => controller.comments, () => controller.comments);
}
