import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const IViolationSelectorService = createService<IViolationSelectorService>("forms-violation-selector-service");

/** Defines a service for opening the violation selector. */
export interface IViolationSelectorService {
    /** An event that is raised when the violation selector is asked to open. */
    readonly onOpenSelector: IEvent<void>;

    /** Opens the violation selector. */
    openSelector(): void;
}

@Singleton
export class ViolationSelectorService implements IViolationSelectorService {
    private readonly _openSelector = new EventEmitter<void>("open-selector");

    get onOpenSelector(): IEvent<void> {
        return this._openSelector.event;
    }

    openSelector(): void {
        this._openSelector.emit();
    }
}
