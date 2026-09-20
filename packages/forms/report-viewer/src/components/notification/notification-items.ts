import { IReportViewerNotification } from "../../services/notification";

/** The most notifications shown at once; a newer one pushes the oldest out. */
export const maxNotifications = 3;

/** How long each type stays up, in milliseconds. */
export const defaultDurations: Record<IReportViewerNotification["type"], number> = {
    danger: 10000,
    info: 5000,
    success: 5000,
    warning: 8000
};

/** A notification as the manager holds it. */
export interface IReportViewerNotificationItem {
    /** How many times it was raised while showing. */
    readonly count: number;
    /** How long, in milliseconds, before it closes itself; 0 keeps it up until closed. */
    readonly duration: number;
    /** The same type saying the same thing is the same notification. */
    readonly key: string;
    readonly message: string;
    readonly type: IReportViewerNotification["type"];
}

/** Adds a notification, counting it again instead when one saying the same thing is showing, and keeps only the newest few. */
export function addNotification(items: ReadonlyArray<IReportViewerNotificationItem>, notification: IReportViewerNotification): Array<IReportViewerNotificationItem> {
    const key = `${notification.type}:${notification.message}`;
    const duration = notification.duration ?? defaultDurations[notification.type];

    if (items.some(item => item.key === key)) {
        return items.map(item => item.key === key ? { ...item, count: item.count + 1, duration } : item);
    }

    return [...items, { count: 1, duration, key, message: notification.message, type: notification.type }].slice(-maxNotifications);
}
