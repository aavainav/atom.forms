import React, { useEffect, useState } from "react";
import { useService } from "@common/react";
import { useDisposables, FNotification } from "@forms/core";

import { INotificationService, IReportViewerNotification } from "../../services/notification";

export interface IReportViewerNotificationItem {
    readonly id: number;
    readonly message: string;
    readonly type: "danger" | "info" | "success" | "warning";
}

let nextId = 1;
function toNotificationItem(notification: IReportViewerNotification): IReportViewerNotificationItem {
    return {
        id: nextId++,
        message: notification.message,
        type: notification.type
    };
}

/** Defines a manager component for displaying notifications in the window. */
export default function NotificationManager(): React.JSX.Element | null {
    const disposables = useDisposables();

    const [notifications, setNotifications] = useState<Array<IReportViewerNotificationItem>>([]);
    const notificationService = useService<INotificationService>(INotificationService);

    useEffect(() => {
        disposables.add(notificationService.onShowNotification(notification => {
            setNotifications(prev => [...prev, toNotificationItem(notification)]);
        }));
    }, [notificationService]);

    const removeNotification = (id: number): void => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    };

    return (
        <div className="notification-container report-viewer-notification-container">
            {notifications.map(notification => (
                <FNotification
                    dismissible={true}
                    key={notification.id}
                    type={notification.type}
                    onClose={() => removeNotification(notification.id)}
                >
                    {notification.message}
                </FNotification>
            ))}
        </div>
    );
}
