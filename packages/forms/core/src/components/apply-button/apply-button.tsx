import React, { useState } from "react";

import FBadge from "../badge/badge";
import FButton from "../button/button";
import FListGroup from "../list-group/list-group";
import FListGroupItem from "../list-group-item/list-group-item";
import { IControllerManager } from "../../controllers/controller-manager";
import { useActivePageId } from "../../hooks/use-active-page-id";
import { useDropTargets } from "../../hooks/use-drop-targets";
import { IDraggableItem } from "../../models/import/draggable-item";

interface IFApplyButtonProps {
    /** The controllers of the form the item is applied to: its dropzones, and the page showing. */
    readonly controllers: IControllerManager;
    /** The item applied, as its draggable carries it. */
    readonly item: IDraggableItem;
    /** Whether the item cannot currently be applied, as when its draggable is disabled. Default false. */
    readonly disabled?: boolean;
}

/**
 * Applies a draggable item without dragging it, for the keyboard and for a touch screen: one zone on the page
 * showing that takes it is filled straight away, and several are offered in a list beneath the button.
 */
export default function FApplyButton({ controllers, item, disabled = false }: IFApplyButtonProps): React.JSX.Element {
    const [isOpen, setIsOpen] = useState(false);
    const activePageId = useActivePageId(controllers.getNavigationController());
    const targets = useDropTargets(controllers.getDragAndDropController())
        .filter(target => target.type === item.type && target.pageId === activePageId);
    const open = targets.filter(target => !target.isClosed);

    const apply = async (fill: (item: IDraggableItem) => Promise<void>): Promise<void> => {
        setIsOpen(false);
        await fill(item);
    };

    if (targets.length === 0) {
        return <FButton type="button" variant="light" size="small" text={`Nothing here takes a ${item.type}`} disabled />;
    }

    if (targets.length === 1) {
        const [target] = targets;

        return <FButton type="button" variant="light" size="small" text={target.isClosed ? `${target.title} is locked` : `Fill ${target.title}`} disabled={disabled || target.isClosed} onClick={() => apply(target.fill)} />;
    }

    // Escape closes the list, as a menu does
    return (
        <div onKeyDown={event => { if (event.key === "Escape") setIsOpen(false); }}>
            <FButton type="button" variant="light" size="small" text="Apply to…" disabled={disabled || open.length === 0} onClick={() => setIsOpen(current => !current)} />
            {isOpen && (
                <FListGroup>
                    {targets.map(target => (
                        <FListGroupItem key={target.id} disabled={target.isClosed} onClick={() => apply(target.fill)}>
                            {target.title} {target.isClosed && <FBadge variant="secondary">Locked</FBadge>}
                        </FListGroupItem>
                    ))}
                </FListGroup>
            )}
        </div>
    );
}
