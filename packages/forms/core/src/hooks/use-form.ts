import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";

import { IControllerManager } from "../controllers/controller-manager";
import { IFormController } from "../controllers/form-controller";
import { FormModel } from "../models/form";

/** Subscribes to the form controller, re-rendering with the current form whenever an edit is applied. */
export function useForm<TForm extends FormModel<any>>(controller: IFormController<TForm>): TForm {
    // the subscribe function must be stable or react resubscribes on every render; the controller is cached by its
    // manager, so keying on it is enough. note the event hands back a listener rather than an unsubscribe function.
    const subscribe = useCallback((onStoreChange: () => void) => {
        const listener = controller.onChanged(onStoreChange);
        return () => listener.remove();
    }, [controller]);

    // the snapshot must be the form itself and nothing derived from it: a fresh object on each call would never compare
    // equal and would re-render endlessly. the stored form's identity changes exactly when an edit lands, which is
    // precisely what should schedule a render.
    return useSyncExternalStore(subscribe, () => controller.form, () => controller.form);
}

/**
 * Resolves the form controller for the given manager, loading the form into it the first time that form is seen --
 * not again on every render, since the manager may have been given another form since, a new one started in its
 * place, and loading this one again would bring it back. Handing it a different form, or a different manager, loads
 * that. Holds the manager while mounted: it closes when the page is put away, or a microtask after this goes unless
 * something holds it again by then. Only one component should call this for a given manager; everything below it
 * reads the controller from the manager.
 */
export function useFormController<TForm extends FormModel<any>>(controllers: IControllerManager, form: TForm): IFormController<TForm> {
    useEffect(() => {
        const putAway = (): void => controllers.close();
        // a page the browser restores from its cache is not mounted again, so nothing else says it is back
        const shownAgain = (event: PageTransitionEvent): void => {
            if (event.persisted) {
                controllers.reopen();
            }
        };

        controllers.retain();
        window.addEventListener("pagehide", putAway);
        window.addEventListener("pageshow", shownAgain);

        return () => {
            window.removeEventListener("pagehide", putAway);
            window.removeEventListener("pageshow", shownAgain);
            controllers.release();
        };
    }, [controllers]);

    const seeded = useRef<{ readonly controllers: IControllerManager; readonly form: TForm } | undefined>(undefined);

    // resolved during render so the controller is available on the first pass, and only when this is handed a form or
    // a manager it has not seeded: a repeat render must not undo a form swapped in since
    if (seeded.current?.controllers !== controllers || seeded.current.form !== form) {
        seeded.current = { controllers, form };
        return controllers.loadForm(form);
    }

    return controllers.getFormController<TForm>();
}
