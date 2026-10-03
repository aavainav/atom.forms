import { useCallback, useSyncExternalStore } from "react";

import { IDragAndDropController, IDropTarget } from "../controllers/drag-and-drop-controller";

/** Subscribes to the drag-and-drop controller, re-rendering whenever a dropzone is registered, changes, or goes. */
export function useDropTargets(controller: IDragAndDropController): ReadonlyArray<IDropTarget> {
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = controller.onChanged(onStoreChange);
        return () => listener.remove();
    }, [controller]);

    // the controller hands out a new array only when the targets change, so the snapshot compares equal otherwise
    return useSyncExternalStore(subscribe, () => controller.targets, () => controller.targets);
}
