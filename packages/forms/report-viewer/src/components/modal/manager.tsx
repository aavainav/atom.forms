import React, { createElement, useEffect } from "react";
import { useService } from "@common/react";
import { FModal } from "@forms/core";

import { IModalService, IModalEvent } from "../../services/modal";

/** Defines a manager component for displaying modals in the window. */
export default function ModalManager(): React.JSX.Element | null {
    const modalService = useService<IModalService>(IModalService);
    
    const [modals, setModals] = React.useState<Array<IModalEvent>>([]);

    useEffect(() => {
        const showListener = modalService.onShowModal((modal) => {
            setModals(current => [...current, modal]);
        });

        const closeListener = modalService.onCloseModal((modal) => {
            setModals(current => current.filter(item => item.id !== modal.id));
        });

        return () => {
            showListener.remove();
            closeListener.remove();
        };

    }, [modalService]);

    if (!modals.length) {
        return null;
    }

    return (
        <>
            {modals.map(modal => {
                const content = typeof modal.options.content === "string"
                    ? createElement("div", null, modal.options.content)
                    : createElement(modal.options.content as React.ComponentType<any>, modal.options.contentProps || {});

                return (
                    <FModal
                        key={modal.id}
                        title={modal.options.title ?? "Modal"}
                        size={modal.options.size}
                        fullscreen={modal.options.fullscreen}
                        show={true}
                        persistent={modal.options.persistent}
                        close={modal.options.close}
                        actions={modal.options.actions}
                        modalIndex={modal.id}
                        onClose={() => modalService.closeModal(modal.id)}
                    >
                        {content}
                    </FModal>
                );
            })}
        </>
    );
}
