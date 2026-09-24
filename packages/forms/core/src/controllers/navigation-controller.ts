import { Controller, ControllerKey, IController } from "./controller";
import { RegisterController } from "./controller-registry";

/** Names the field a navigation is heading to; the page it's on is implied by the field, since a page instance -- not a field within it -- is the only thing ever ambiguous. */
export interface INavigationTarget {
    /** The id of the page instance to show, e.g. one violation page among several on a citation. */
    readonly pageId: string;
    /** The DOM id of the field to focus once its page is showing -- a field's uuid is already the DOM id of the input rendered for it. */
    readonly fieldId: string;
}

/** Says what the page showing is, the way a review target does: the name of its definition, and which of that definition's pages it is, counting from zero. */
export interface IActivePage {
    readonly page: string;
    readonly pageOrdinal: number;
}

/**
 * Defines the controller that carries a one-shot instruction to show a specific page and focus a specific field on
 * it, and remembers which page is showing. It carries no notion of why -- a validation entry decides that -- and only
 * relays the instruction to the page collection rendering the form.
 */
export interface INavigationController extends IController {
    /** The id of the page instance showing, as the page collection reports it, or undefined when none is. */
    readonly activePageId: string | undefined;
    /** The pending navigation target, or undefined when there is none to act on. */
    readonly target: INavigationTarget | undefined;

    /** Requests that the given page be shown and the given field focused on it. */
    goTo(target: INavigationTarget): void;
    /** Clears the pending target once it has been acted on. */
    clear(): void;
    /** Records which page is showing, raising a change only when it differs. `active` says what the page is, so that a different page coming into view can be reported. */
    setActivePage(pageId: string | undefined, active?: IActivePage): void;
}

@RegisterController(ControllerKey.navigation)
export class NavigationController extends Controller implements INavigationController {
    private _activePageId?: string;
    private _shownPageId?: string;
    private _target?: INavigationTarget;

    get activePageId(): string | undefined {
        return this._activePageId;
    }

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

    public setActivePage(pageId: string | undefined, active?: IActivePage): void {
        if (pageId !== this._activePageId) {
            this._activePageId = pageId;
            this.emitChanged();
        }

        // a print takes the tabs away and gives them back, so it is the last page shown that a page has to differ from
        if (pageId !== undefined && pageId !== this._shownPageId) {
            const isFirst = this._shownPageId === undefined;
            this._shownPageId = pageId;

            // the first page is the one the form opened on, which `form-opened` already says
            if (!isFirst && active) {
                this.emitActivity({ kind: "page-focused", page: active.page, pageOrdinal: active.pageOrdinal });
            }
        }
    }

    public dispose(): void {
        this._activePageId = undefined;
        this._shownPageId = undefined;
        this._target = undefined;
    }
}
