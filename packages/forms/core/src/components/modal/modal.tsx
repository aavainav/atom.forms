import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { buildClasses } from "../../utils/class-names";

export type FModalSize = "sm" | "lg" | "xl";

/** Defines public functions for the modal component. */
export interface IFModal {
    /** The hide function for the modal. */
    hideModal(): void;
    /** The show function for the modal. */
    showModal(): void;
}

/** Defines an action that will be appended to the modal footer. */
export interface IModalAction {
    readonly title: string;
    readonly primary?: boolean;
    readonly invoke: () => Promise<IModalResult>;
}

/** Defines a special action that will add a close 'x' button to the title bar for the modal. */
export interface IModalCloseAction {
    readonly invoke: () => Promise<IModalResult>;
}

/** Represents the result of a modal action. */
export interface IModalResult {
    /** True if an action was successful and the modal should close; otherwise false to indicate the action failed and the modal will remain open. */
    readonly result: boolean;
}

interface IFModalProps {
    readonly title?: string;
    readonly size?: FModalSize;
    readonly fullscreen?: boolean;
    readonly show?: boolean;
    readonly backdrop?: boolean;
    readonly persistent?: boolean;
    readonly modalIndex?: number;
    readonly close?: IModalCloseAction;
    readonly actions?: IModalAction[];
    onClose?: () => void;
}

const FModal = forwardRef<IFModal, React.PropsWithChildren<IFModalProps>>(function FModal({
    title,
    size,
    fullscreen = false,
    show = true,
    backdrop = true,
    persistent = false,
    modalIndex = 0,
    close,
    actions,
    children,
    onClose
}, ref) {
    const rootRef = useRef<HTMLDivElement>(null);
    const backdropElementRef = useRef<HTMLElement | undefined>(undefined);
    const [isShown, setIsShown] = useState(false);
    const [pendingAction, setPendingAction] = useState(false);
    const [currentAction, setCurrentAction] = useState<IModalAction | IModalCloseAction>();

    const invokeAction = useCallback(async (action: IModalAction | IModalCloseAction): Promise<void> => {
        setCurrentAction(action);
        setPendingAction(true);

        // TODO: handle error when invoking action
        const result = await action.invoke();

        if (result.result) {
            onClose?.();
        }

        setCurrentAction(undefined);
        setPendingAction(false);
    }, [onClose]);

    const dismiss = useCallback((): void => {
        if (close) {
            void invokeAction(close);
        } else {
            onClose?.();
        }
    }, [close, invokeAction, onClose]);

    const hideModal = useCallback((): void => {
        if (isShown && rootRef.current) {
            setIsShown(false);

            document.body.classList.remove("modal-open");

            rootRef.current.removeAttribute("aria-modal");
            rootRef.current.removeAttribute("role");
            rootRef.current.setAttribute("aria-hidden", "true");
            rootRef.current.classList.remove("show");

            if (backdropElementRef.current) {
                backdropElementRef.current.remove();
                backdropElementRef.current = undefined;
            }
        }
    }, [isShown]);

    const showModal = useCallback((): void => {
        if (!isShown && rootRef.current) {
            setIsShown(true);
            document.body.classList.add("modal-open");

            rootRef.current.removeAttribute("aria-hidden");
            rootRef.current.setAttribute("aria-modal", "true");
            rootRef.current.setAttribute("role", "dialog");
            rootRef.current.classList.add("show");

            if (backdrop) {
                const backdropElement = document.createElement("div");
                backdropElement.classList.add("modal-backdrop", "fade", "show");

                if (modalIndex > 0) {
                    // 1060 is the z-index used by Bootstrap 5 for modals: https://getbootstrap.com/docs/5.0/layout/z-index/
                    backdropElement.style.zIndex = (1060 + modalIndex).toString();
                }

                if (!persistent) {
                    backdropElement.addEventListener("click", dismiss);
                }

                document.body.append(backdropElement);
                backdropElementRef.current = backdropElement;
            }
        }
    }, [isShown, backdrop, modalIndex, persistent, dismiss]);

    useImperativeHandle(ref, () => ({ hideModal, showModal }), [hideModal, showModal]);

    useEffect(() => {
        if (show) {
            showModal();
        } else {
            hideModal();
        }
    }, [show, showModal, hideModal]);

    useEffect(() => {
        return () => {
            document.body.classList.remove("modal-open");

            if (backdropElementRef.current) {
                backdropElementRef.current.remove();
                backdropElementRef.current = undefined;
            }
        };
    }, []);

    return (
        <div ref={rootRef} className="modal fade" tabIndex={-1} style={{ display: isShown ? "block" : "none", zIndex: 1060 + modalIndex + 1 }}>
            <div className={buildClasses(
                "modal-dialog", "modal-dialog-centered", "modal-dialog-scrollable",
                fullscreen ? "modal-fullscreen" : "",
                size === "sm" ? "modal-sm" : "",
                size === "lg" ? "modal-lg" : "",
                size === "xl" ? "modal-xl" : ""
            )}>
                <span tabIndex={0} />
                <div className="modal-content rounded-0 border-dark">
                    <header className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        {close && (
                            <button type="button" className="btn-close" aria-label="Close" onClick={() => void invokeAction(close)} />
                        )}
                    </header>
                    <div className="modal-body">{children}</div>
                    {actions && actions.length > 0 && (
                        <footer className="modal-footer">
                            {actions.map((action) => (
                                <button
                                    key={action.title}
                                    type="button"
                                    className={buildClasses("btn", action.primary ? "btn-primary" : "btn-outline-secondary")}
                                    disabled={pendingAction}
                                    onClick={() => void invokeAction(action)}
                                >
                                    {currentAction === action && (
                                        <>
                                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                            <span className="visually-hidden">Waiting...</span>
                                        </>
                                    )}
                                    {action.title}
                                </button>
                            ))}
                        </footer>
                    )}
                </div>
                <span tabIndex={0} />
            </div>
        </div>
    );
});

export default FModal;
