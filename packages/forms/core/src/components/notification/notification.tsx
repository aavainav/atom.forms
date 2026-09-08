import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FNotificationType = "danger" | "info" | "success" | "warning";

interface IFNotificationProps {
    /** The type of notification to display in the ui. */
    readonly type: FNotificationType;
    /** An indicator whether the notification component is dismissable or not; default to false. */
    readonly dismissible?: boolean;
    /** A callback invoked when the notification's close button is clicked. */
    onClose?: () => void;
}

/** Defines the notification component. */
export default function FNotification({ type, dismissible = false, children, onClose }: React.PropsWithChildren<IFNotificationProps>): React.JSX.Element {
    const getNotificationIconClass = (type: FNotificationType): string => {
        const icons: Record<string, string> = {
            danger: "exclamation-circle text-danger",
            warning: "exclamation-triangle text-warning",
            success: "check-circle text-success",
            info: "info-circle text-info",
        };

        return `me-2 bi-${icons[type] || ""}`;
    };

    return (
        <div className={
                buildClasses(
                    "f-notification", 
                    "alert", 
                    `alert-${type}`, 
                    `${dismissible ? "alert-dismissible" : ""}`, 
                    "rounded-0"
            )} role={type === "danger" ? "alert" : "status"}
        >
            <i className={`bi ${getNotificationIconClass(type)}`}></i>
            {children}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => onClose?.()}></button>
        </div>
    );
}