import { useCallback, useSyncExternalStore } from "react";

import { INavigationController, INavigationTarget } from "../controllers/navigation-controller";

/** Subscribes to the navigation controller, re-rendering whenever a navigation is requested or cleared. */
export function useNavigationTarget(controller: INavigationController): INavigationTarget | undefined {
    // the subscribe function must be stable or react resubscribes on every render; the controller is cached by its
    // manager, so keying on it is enough. note the event hands back a listener rather than an unsubscribe function.
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = controller.onChanged(onStoreChange);
        return () => listener.remove();
    }, [controller]);

    // as with useForm, the snapshot must be the stored state itself and nothing derived from it, since a fresh
    // object on each call would never compare equal and would re-render endlessly
    return useSyncExternalStore(subscribe, () => controller.target, () => controller.target);
}
