import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const IViolationPickerService = createService<IViolationPickerService>("forms-violation-picker-service");

/**
 * Defines a service for opening the violation picker.
 *
 * The option in the report viewer's bar and the panel holding the picker are rendered in different places -- they
 * have to be, since an off canvas rendered inside the `position-fixed` options bar would be ranked only within it
 * -- so the button raises an event here and the panel, which owns whether it is showing, listens for it.
 */
export interface IViolationPickerService {
    /** An event that is raised when the violation picker is asked to open. */
    readonly onOpenPicker: IEvent<void>;

    /** Opens the violation picker. */
    openPicker(): void;
}

@Singleton
export class ViolationPickerService implements IViolationPickerService {
    private readonly _openPicker = new EventEmitter<void>("open-picker");

    get onOpenPicker(): IEvent<void> {
        return this._openPicker.event;
    }

    openPicker(): void {
        this._openPicker.emit();
    }
}
