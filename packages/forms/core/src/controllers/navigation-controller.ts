import { Controller, ControllerKey, IController } from "./controller";
import { RegisterController } from "./controller-registry";

/** Names the field a navigation is heading to; the page it's on is implied by the field, since a page instance -- not a field within it -- is the only thing ever ambiguous. */
export interface INavigationTarget {
    /** The id of the page instance to show, e.g. one violation page among several on a citation. */
    readonly pageId: string;
    /** The DOM id of the field to focus once its page is showing -- a field's uuid is already the DOM id of the input rendered for it. */
    readonly fieldId: string;
}

/**
 * Defines the controller that carries a one-shot instruction to show a specific page and focus a specific field on
 * it. It carries no notion of why -- a validation entry decides that -- and only relays the instruction to the page
 * collection rendering the form.
 */
export interface INavigationController extends IController {
    /** The pending navigation target, or undefined when there is none to act on. */
    readonly target: INavigationTarget | undefined;

    /** Requests that the given page be shown and the given field focused on it. */
    goTo(target: INavigationTarget): void;
    /** Clears the pending target once it has been acted on. */
    clear(): void;
}

@RegisterController(ControllerKey.navigation)
export class NavigationController extends Controller implements INavigationController {
    private _target?: INavigationTarget;

    get target(): INavigationTarget | undefined {
        return this._target;
    }

    public goTo(target: INavigationTarget): void {
        this._target = target;
        this.emitChanged();
    }

    public clear(): void {
        if (this._target) {
            this._target = undefined;
            this.emitChanged();
        }
    }

    public dispose(): void {
        this._target = undefined;
    }
}
