import React, { useEffect, useState } from "react";
import { useService } from "@common/react";
import { useDisposables, FNotification } from "@forms/core";

import { IReportViewerNotificationItem, addNotification } from "./notification-items";
import { INotificationService } from "../../services/notification";

/** Defines a manager component for displaying notifications in the window. */
export default function NotificationManager(): React.JSX.Element | null {
    const disposables = useDisposables();

    const [notifications, setNotifications] = useState<Array<IReportViewerNotificationItem>>([]);
    const notificationService = useService<INotificationService>(INotificationService);

    useEffect(() => {
        disposables.add(notificationService.onShowNotification(notification => {
            setNotifications(prev => addNotification(prev, notification));
        }));
    }, [notificationService]);

    const removeNotification = (key: string): void => {
        setNotifications(prev => prev.filter(notification => notification.key !== key));
    };

    return (
        <div className="notification-container report-viewer-notification-container">
            {notifications.map(notification => (
                <FNotification
                    count={notification.count}
                    dismissible={true}
                    duration={notification.duration}
                    key={notification.key}
                    type={notification.type}
                    onClose={() => removeNotification(notification.key)}
                >
                    {notification.message}
                </FNotification>
            ))}
        </div>
    );
}
