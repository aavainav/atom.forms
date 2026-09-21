import { useCallback, useSyncExternalStore } from "react";

import { INavigationController } from "../controllers/navigation-controller";

/** Subscribes to the navigation controller, re-rendering with the id of the page showing whenever it changes. */
export function useActivePageId(controller: INavigationController): string | undefined {
    // as with useNavigationTarget, the subscribe function must be stable and the snapshot the stored state itself
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = controller.onChanged(onStoreChange);
        return () => listener.remove();
    }, [controller]);

    return useSyncExternalStore(subscribe, () => controller.activePageId, () => controller.activePageId);
}
