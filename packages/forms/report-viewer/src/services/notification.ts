import { IEvent, EventEmitter } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const INotificationService = createService<INotificationService>("report-viewer-notification-service");

/** Defines a service for showing notifications to the user for the application. */
export interface INotificationService {
    /** An event that is raised when a notification is shown. */
    readonly onShowNotification: IEvent<IReportViewerNotification>;
    /** Shows the specified notification. */
    showNotification(notification: IReportViewerNotification): void;
}

/** Defines a notification to display in the report viewer. */
export interface IReportViewerNotification {
    /** How long, in milliseconds, the notification stays up before closing itself; 0 keeps it up until closed. Defaults by type. */
    readonly duration?: number;
    /** The message to display in the notification. */
    readonly message: string;
    /** An optional title for the notification. */
    readonly title?: string;
    /** The type of notification that determines how it will be styled. */
    readonly type: "danger" | "info" | "success" | "warning";
}

@Singleton
export class NotificationService implements INotificationService {
    private readonly _showNotification = new EventEmitter<IReportViewerNotification>("show-notification");

    get onShowNotification(): IEvent<IReportViewerNotification> {
        return this._showNotification.event;
    }

    showNotification(notification: IReportViewerNotification): void {
        // simply raise the event and let the internal UI components handle it
        this._showNotification.emit(notification);
    }
}
