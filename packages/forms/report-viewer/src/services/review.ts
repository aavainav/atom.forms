import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const IReviewService = createService<IReviewService>("report-viewer-review-service");

/** Defines a service for opening and closing the review panel. */
export interface IReviewService {
    /** An event that is raised when the review panel is asked to open or close. */
    readonly onTogglePanel: IEvent<void>;

    /** Opens the review panel if it is closed, and closes it if it is open. */
    togglePanel(): void;
}

@Singleton
export class ReviewService implements IReviewService {
    private readonly _togglePanel = new EventEmitter<void>("toggle-panel");

    get onTogglePanel(): IEvent<void> {
        return this._togglePanel.event;
    }

    togglePanel(): void {
        this._togglePanel.emit();
    }
}
