import React from "react";
import { buildClasses } from "../../utils/class-names";

interface IFListGroupItemProps {
    readonly id?: string;
    readonly active?: boolean;
    readonly disabled?: boolean;
    readonly href?: string;
    readonly preventDefault?: boolean;
    readonly className?: string;
    onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

export default function FListGroupItem({
    id,
    active = false,
    disabled = false,
    href,
    preventDefault = false,
    className,
    children,
    onClick
}: React.PropsWithChildren<IFListGroupItemProps>): React.JSX.Element {
    const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
        if (preventDefault) {
            event.preventDefault();
        }

        onClick?.(event);
    };

    const classes = buildClasses(className, "list-group-item", active ? "active" : "", disabled ? "disabled" : "", href || onClick ? "list-group-item-action" : "");

    if (href) {
        return (
            <a id={id} href={href} className={classes} onClick={handleClick}>
                {children}
            </a>
        );
    }

    return (
        <div id={id} className={classes} onClick={handleClick}>
            {children}
        </div>
    );
}
