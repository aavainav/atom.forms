import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const IPresetSelectorService = createService<IPresetSelectorService>("forms-preset-selector-service");

/** Defines a service for opening the presets panel. */
export interface IPresetSelectorService {
    /** An event that is raised when the presets panel is asked to open. */
    readonly onOpenSelector: IEvent<void>;

    /** Opens the presets panel. */
    openSelector(): void;
}

@Singleton
export class PresetSelectorService implements IPresetSelectorService {
    private readonly _openSelector = new EventEmitter<void>("open-preset-selector");

    get onOpenSelector(): IEvent<void> {
        return this._openSelector.event;
    }

    openSelector(): void {
        this._openSelector.emit();
    }
}
