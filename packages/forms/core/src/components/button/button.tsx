import React from "react";
import { buildClasses } from "../../utils/class-names";

export type FButtonSize = "large" | "normal" | "small";
export type FButtonStyle = "default" | "muted";
export type FButtonType = "button" | "default" | "link" | "reset" | "submit";
export type FButtonVariant =
    "primary" |
    "secondary" |
    "success" |
    "info" |
    "warning" |
    "danger" |
    "light" |
    "dark" |
    "link" |
    "none" |
    "outline-primary" |
    "outline-secondary" |
    "outline-success" |
    "outline-info" |
    "outline-warning" |
    "outline-danger" |
    "outline-light" |
    "outline-dark";

interface IFButtonProps {
    readonly id?: string;
    readonly buttonStyle?: FButtonStyle;
    readonly className?: string;
    readonly disabled?: boolean;
    readonly icon?: string;
    readonly link?: string;
    readonly shadow?: boolean;
    readonly size?: FButtonSize;
    readonly text?: string;
    readonly type?: FButtonType;
    readonly variant?: FButtonVariant;
    
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

function getButtonVisualClasses(buttonStyle: FButtonStyle, variant: FButtonVariant, size: FButtonSize, shadow: boolean): string {
    const classes = [
        "btn",
        size === "small" ? "btn-sm" : "",
        size === "large" ? "btn-lg" : "",
        shadow ? "" : "shadow-none"
    ];

    if (buttonStyle === "default") {
        if (variant !== "none") {
            classes.push(`btn-${variant}`);
        }
    }
    else {
        const hasOutline = variant.startsWith("outline");
        classes.push(hasOutline ? "btn-muted-outline" : "btn-muted");

        if (variant !== "link" && variant !== "none") {
            classes.push(`btn-muted-${variant}`);
        }
    }

    return buildClasses(...classes);
}

export default function FButton({
    id,
    buttonStyle = "default",
    type = "default",
    variant = "primary",
    size = "normal",
    icon,
    link,
    text,
    shadow = true,
    disabled = false,
    className,
    children,
    onClick
}: React.PropsWithChildren<IFButtonProps>): React.JSX.Element {
    const content = children ?? (
        <>
            {icon && <i className={buildClasses(icon, text ? "pe-1" : "")} />}
            {text}
        </>
    );

    const resolvedType = type === "default" ? (link ? "link" : "button") : type;
    const visualClasses = getButtonVisualClasses(buttonStyle, variant, size, shadow);

    if (resolvedType === "link") {
        const href = link || "#";

        return (
            <a
                id={id}
                href={href}
                role={href[0] === "#" ? "button" : "link"}
                aria-disabled={disabled ? "true" : undefined}
                tabIndex={disabled ? -1 : undefined}
                className={buildClasses(visualClasses, disabled ? "disabled" : "", className)}
                onClick={onClick}
            >
                {content}
            </a>
        );
    }

    return (
        <button id={id} type={resolvedType as "button" | "reset" | "submit"} className={buildClasses(visualClasses, className)} disabled={disabled} onClick={onClick}>
            {content}
        </button>
    );
}
