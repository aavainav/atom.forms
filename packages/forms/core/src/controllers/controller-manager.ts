import { EventEmitter, IEvent, IEventListener } from "@common/event-emitter";

import { IController } from "./controller";
import { DragAndDropController, IDragAndDropController } from "./drag-and-drop-controller";
import { FormController, IFormController } from "./form-controller";
import { IPrintController, PrintController } from "./print-controller";
import { IValueListController, ValueListController } from "./value-list-controller";

import { FormModel } from "../models/form";
import { RuleCollection } from "../models/validation/rule-collection";
import { IRulesController, RulesController } from "../models/validation/rules-controller";


/** The keys identifying each controller owned by a controller manager. */
export const ControllerKey = {
    dragAndDrop: "drag-and-drop",
    form: "form",
    print: "print",
    rules: "rules",
    valueList: "value-list"
} as const;

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
     * Points the manager at the form it drives, creating the form controller the first time and resetting it whenever a
     * different form is loaded. Loading a form the manager is already driving is a no-op, so this may be called during
     * render, but only one component should call it for a given manager.
     */
    loadForm<TForm extends FormModel<any>>(form: TForm): IFormController<TForm>;
    /** Gets the form controller, which owns the form model. The caller asserts the form type. */
    getFormController<TForm extends FormModel<any> = FormModel<any>>(): IFormController<TForm>;

    /** Gets the drag-and-drop controller for the form. */
    getDragAndDropController(): IDragAndDropController;
    /** Gets the print controller, which puts the form into its print layout. */
    getPrintController(): IPrintController;
    /** Gets the rules controller, refreshed with the form the form controller currently holds. */
    getRulesController(ruleCollection?: RuleCollection): IRulesController;
    /** Gets the value list controller for the form. */
    getValueListController(): IValueListController;

    /** Disposes every controller owned by this manager. */
    dispose(): void;
    /** Disposes the controller registered under the specified key, if one has been created. */
    disposeController(key: string): void;
}

export class ControllerManager implements IControllerManager {
    private readonly _controllerChanged = new EventEmitter<IControllerChangedEventArgs>("controller-manager:controller-changed");
    private readonly controllers: Map<string, [IController, IEventListener]> = new Map<string, [IController, IEventListener]>();

    get onControllerChanged(): IEvent<IControllerChangedEventArgs> {
        return this._controllerChanged.event;
    }

    public loadForm<TForm extends FormModel<any>>(form: TForm): IFormController<TForm> {
        const existing = this.controllers.get(ControllerKey.form)?.[0] as FormController<TForm> | undefined;

        // the same form is re-seeded on every render, so the comparison is on the form's id, which is stable across
        // edits; only a genuinely different form resets the controllers, leaving repeat renders a no-op
        if (existing && existing.form.id !== form.id) {
            this.disposeController(ControllerKey.form);
            this.disposeController(ControllerKey.rules);
        }

        return this.getController<FormController<TForm>>(ControllerKey.form, () => new FormController(form));
    }

    public getFormController<TForm extends FormModel<any> = FormModel<any>>(): IFormController<TForm> {
        const controller = this.controllers.get(ControllerKey.form)?.[0] as FormController<TForm> | undefined;
        if (!controller) {
            throw new Error("A form must be loaded before the form controller can be used.");
        }

        return controller;
    }

    public getDragAndDropController(): IDragAndDropController {
        return this.getController<IDragAndDropController>(ControllerKey.dragAndDrop, () => new DragAndDropController());
    }

    public getPrintController(): IPrintController {
        return this.getController<IPrintController>(ControllerKey.print, () => new PrintController());
    }

    public getRulesController(ruleCollection?: RuleCollection): IRulesController {
        const form = this.getFormController().form;
        const rules = ruleCollection ?? form.getRuleCollection();

        const controller = this.getController<RulesController>(ControllerKey.rules, () => new RulesController(form, rules));

        // the cached controller outlives the form instance it was created with, so point it at the current one
        controller.form = form;
        controller.ruleCollection = rules;

        return controller;
    }

    public getValueListController(): IValueListController {
        return this.getController<ValueListController>(ControllerKey.valueList, () => new ValueListController());
    }

    public dispose(): void {
        for (const [controller, listener] of this.controllers.values()) {
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

    private getController<TController extends IController>(key: string, create: () => TController): TController {
        let item = this.controllers.get(key);

        if (!item) {
            const controller = create();
            const listener = controller.onChanged(() => this._controllerChanged.emit({ key, controller }));

            item = [controller, listener];
            this.controllers.set(key, item);
        }

        return <TController>item[0];
    }
}
