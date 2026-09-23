import { EventEmitter, IEvent, IEventListener } from "@common/event-emitter";

import { ControllerKey, IController } from "./controller";
import { ControllerRegistry } from "./controller-registry";
import { IDragAndDropController } from "./drag-and-drop-controller";
import { FormController, IFormController } from "./form-controller";
import { INavigationController } from "./navigation-controller";
import { IPrintController } from "./print-controller";

import { FormModel } from "../models/form";
import type { UpdateReason } from "../models/update-reason";
import { RuleCollection } from "../models/validation/rule-collection";
import { IRulesController, RulesController } from "../models/validation/rules-controller";

// a controller registers itself when its module is loaded, and the imports above are only types, which are erased;
// these are what put the controllers this package owns in the registry before a manager goes looking for them
import "./drag-and-drop-controller";
import "./form-controller";
import "./navigation-controller";
import "./print-controller";
import "../models/validation/rules-controller";

/** Describes which controller raised a change through its manager. */
export interface IControllerChangedEventArgs {
    /** The key the controller is registered under. */
    readonly key: string;
    /** The controller that changed. */
    readonly controller: IController;
}

/** Defines the manager that creates and caches the controllers belonging to a single form. */
export interface IControllerManager {
    /** An event that is raised when any controller owned by this manager changes. */
    readonly onControllerChanged: IEvent<IControllerChangedEventArgs>;
    /**
     * An event raised after any update to the form, naming why it was made when the caller said. Unlike
     * `onControllerChanged`, this survives the form controller itself being replaced when a different form is loaded.
     */
    readonly onFormUpdated: IEvent<{ readonly form: FormModel<any>; readonly reason?: UpdateReason }>;

    /** Gets the form controller, which owns the form model. The caller asserts the form type. */
    getFormController<TForm extends FormModel<any> = FormModel<any>>(): IFormController<TForm>;

    /**
     * Gets the controller registered under the specified key, creating it the first time it is asked for. The caller
     * asserts the controller's type, so a package that contributes a controller usually wraps this in an accessor of its own.
     * Throws when nothing is registered under the key.
     */
    getController<TController extends IController>(key: string): TController;
    /** Gets the drag-and-drop controller for the form. */
    getDragAndDropController(): IDragAndDropController;
    /** Gets the navigation controller, which carries a one-shot instruction to show a specific page and focus a specific field on it. */
    getNavigationController(): INavigationController;
    /** Gets the print controller, which puts the form into its print layout. */
    getPrintController(): IPrintController;
    /** Gets the rules controller, which reads the form the form controller currently holds. */
    getRulesController(ruleCollection?: RuleCollection): IRulesController;

    /**
     * Points the manager at the form it drives, creating the form controller the first time and resetting it whenever a
     * different form is loaded. Loading a form the manager is already driving is a no-op, so this may be called during
     * render, but only one component should call it for a given manager. Also creates every eager controller, and
     * raises `onControllerChanged` for the form controller when the form is new to the manager.
     */
    loadForm<TForm extends FormModel<any>>(form: TForm): IFormController<TForm>;

    /** Disposes every controller owned by this manager. */
    dispose(): void;
    /** Disposes the controller registered under the specified key, if one has been created. */
    disposeController(key: string): void;
}

export class ControllerManager implements IControllerManager {
    private readonly _controllerChanged = new EventEmitter<IControllerChangedEventArgs>("controller-manager:controller-changed");
    private readonly _formUpdated = new EventEmitter<{ form: FormModel<any>; reason?: UpdateReason }>("controller-manager:form-updated");
    private readonly controllers: Map<string, [IController, IEventListener]> = new Map<string, [IController, IEventListener]>();

    get onControllerChanged(): IEvent<IControllerChangedEventArgs> {
        return this._controllerChanged.event;
    }

    get onFormUpdated(): IEvent<{ readonly form: FormModel<any>; readonly reason?: UpdateReason }> {
        return this._formUpdated.event;
    }

    public loadForm<TForm extends FormModel<any>>(form: TForm): IFormController<TForm> {
        const existing = this.controllers.get(ControllerKey.form)?.[0] as FormController<TForm> | undefined;

        // the same form is re-seeded on every render, so the comparison is on the form's id, which is stable across
        // edits; only a genuinely different form resets the controllers, leaving repeat renders a no-op
        const isNewForm = !existing?.isLoaded || existing.form.id !== form.id;

        if (existing?.isLoaded && isNewForm) {
            this.disposeController(ControllerKey.form);
            this.disposeController(ControllerKey.rules);
        }

        const controller = this.getController<FormController<TForm>>(ControllerKey.form);

        if (isNewForm) {
            controller.setNotifier(payload => this._formUpdated.emit(payload));
        }

        controller.load(form);

        // created only now, with the form controller in place, so a controller that observes the others can read it
        // as soon as it starts; the ones already created are simply found again
        for (const registration of ControllerRegistry.getEager()) {
            this.getController(registration.key);
        }

        // seeding raises nothing, so this is how an observer learns the form was replaced
        if (isNewForm) {
            this._controllerChanged.emit({ key: ControllerKey.form, controller });
        }

        return controller;
    }

    public getFormController<TForm extends FormModel<any> = FormModel<any>>(): IFormController<TForm> {
        const controller = this.controllers.get(ControllerKey.form)?.[0] as FormController<TForm> | undefined;
        if (!controller?.isLoaded) {
            throw new Error("A form must be loaded before the form controller can be used.");
        }

        return controller;
    }

    public getController<TController extends IController>(key: string): TController {
        let item = this.controllers.get(key);

        if (!item) {
            const registration = ControllerRegistry.get(key);
            if (!registration) {
                throw new Error(`No controller is registered under the key '${key}'.`);
            }

            const controller = new registration.ctor(this);
            const listener = controller.onChanged(() => this._controllerChanged.emit({ key, controller }));

            item = [controller, listener];
            this.controllers.set(key, item);

            // started only once it can be found through the manager, so it may ask for the controllers it observes
            controller.start();
        }

        return <TController>item[0];
    }

    public getDragAndDropController(): IDragAndDropController {
        return this.getController<IDragAndDropController>(ControllerKey.dragAndDrop);
    }

    public getNavigationController(): INavigationController {
        return this.getController<INavigationController>(ControllerKey.navigation);
    }

    public getPrintController(): IPrintController {
        return this.getController<IPrintController>(ControllerKey.print);
    }

    public getRulesController(ruleCollection?: RuleCollection): IRulesController {
        // asked first so that a form which has not been loaded fails here, with its own message
        this.getFormController();

        const controller = this.getController<RulesController>(ControllerKey.rules);

        if (ruleCollection) {
            controller.ruleCollection = ruleCollection;
        }

        return controller;
    }

    public dispose(): void {
        // last created first, so a controller that observes another is released before what it observes
        for (const [controller, listener] of [...this.controllers.values()].reverse()) {
            listener.remove();
            controller.dispose();
        }

        this.controllers.clear();
    }

    public disposeController(key: string): void {
        const item = this.controllers.get(key);

        if (item) {
            item[1].remove();
            item[0].dispose();
            this.controllers.delete(key);
        }
    }
}
