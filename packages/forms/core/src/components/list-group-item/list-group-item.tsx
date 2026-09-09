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

        // the disabled class greys the row but nothing about an anchor or a div refuses a click on its own, so a
        // disabled item would otherwise still act on being clicked while looking as though it could not be
        if (disabled) {
            return;
        }

        onClick?.(event);
    };

    const classes = buildClasses(className, "list-group-item", active ? "active" : "", disabled ? "disabled" : "", href || onClick ? "list-group-item-action" : "");

    if (href) {
        return (
            <a id={id} href={href} className={classes} aria-disabled={disabled || undefined} onClick={handleClick}>
                {children}
            </a>
        );
    }

    return (
        <div id={id} className={classes} aria-disabled={disabled || undefined} onClick={handleClick}>
            {children}
        </div>
    );
}
