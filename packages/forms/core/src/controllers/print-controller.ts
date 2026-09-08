import { EventEmitter, IEvent } from "@common/event-emitter";

import { IController } from "./controller";

/** The arrangement the pages being printed are laid out in: beside one another on a sheet, or one beneath the next. */
export type PrintLayout = "side-by-side" | "top-down";

/** Describes what the page collection renders while a print is in progress. */
export interface IPrintState {
    /** How the pages being printed are arranged. */
    readonly layout: PrintLayout;
    /** The names of the page definitions to render, in print order; every page is rendered when undefined. */
    readonly pageNames?: ReadonlyArray<string>;
    /** The factor the printed pages are scaled by so they fit the sheet; they print at their natural size when undefined. */
    readonly scale?: number;
}

/**
 * Defines the controller that puts a form into its print layout. It carries no notion of what is being printed or
 * why - the printing package decides which pages a copy contains and how it is arranged, and this only relays that
 * decision to the page collection rendering the form.
 */
export interface IPrintController extends IController {
    /** The state of the print in progress, or undefined when the form is not being printed. */
    readonly state: IPrintState | undefined;

    /** Puts the form into its print layout. */
    begin(state: IPrintState): void;
    /** Returns the form to its normal layout. */
    end(): void;
}

export class PrintController implements IPrintController {
    private readonly _changed = new EventEmitter<void>("print:changed");
    private _state?: IPrintState;

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    get state(): IPrintState | undefined {
        return this._state;
    }

    public begin(state: IPrintState): void {
        // the state is handed to useSyncExternalStore as its snapshot, so it is stored by reference and replaced
        // only here; a state object rebuilt on each read would never compare equal and would re-render endlessly
        this._state = state;
        this._changed.emit();
    }

    public end(): void {
        if (this._state) {
            this._state = undefined;
            this._changed.emit();
        }
    }

    public dispose(): void {
        this._state = undefined;
    }
}
