import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FNotificationType = "danger" | "info" | "success" | "warning";

interface IFNotificationProps {
    /** The type of notification to display in the ui. */
    readonly type: FNotificationType;
    /** How many times the notification was raised while showing; shown once above one. Changing it restarts the countdown. Defaults to 1. */
    readonly count?: number;
    /** An indicator whether the notification component is dismissable or not; default to false. */
    readonly dismissible?: boolean;
    /** How long, in milliseconds, before the notification closes itself, counted down along its bottom edge. Omit or 0 to keep it open until closed. */
    readonly duration?: number;
    /** A callback invoked when the notification's close button is clicked, or its countdown ends. */
    onClose?: () => void;
}

/** Defines the notification component. */
export default function FNotification({ type, count = 1, dismissible = false, duration, children, onClose }: React.PropsWithChildren<IFNotificationProps>): React.JSX.Element {
    // the countdown is held while the tab is hidden, so a notification can't expire before anyone sees it
    const [isTabHidden, setIsTabHidden] = React.useState(document.hidden);

    React.useEffect(() => {
        const onVisibilityChange = (): void => setIsTabHidden(document.hidden);

        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => document.removeEventListener("visibilitychange", onVisibilityChange);
    }, []);

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
                    isTabHidden ? "f-notification--paused" : "",
                    "rounded-0"
            )} role={type === "danger" ? "alert" : "status"}
        >
            <i className={`bi ${getNotificationIconClass(type)}`}></i>
            {children}
            {count > 1 && <span className="f-notification__count">&times;{count}</span>}
            <button type="button" className="btn-close" aria-label="Close" onClick={() => onClose?.()}></button>
            {!!duration && (
                // keyed on count, so a repeat remounts the bar and restarts the countdown
                <div
                    key={count}
                    className="f-notification__countdown"
                    aria-hidden="true"
                    style={{ animationDuration: `${duration}ms` }}
                    onAnimationEnd={() => onClose?.()}
                />
            )}
        </div>
    );
}
