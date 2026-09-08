import * as React from "react";
import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";
import { IModalAction, IModalCloseAction, IModalResult, FModalSize } from "@forms/core";

// re-export the modal types for other modules to import
export type { IModalAction, IModalCloseAction, IModalResult, FModalSize };

export const IModalService = createService<IModalService>("report-viewer-modal-service");

export interface IModalEvent {
    readonly id: number;
    readonly options: IModalOptions;
}

/** Defines a service showing modal dialogs for the application. */
export interface IModalService {
    /** An event that is raised when a modal is closed. */
    readonly onCloseModal: IEvent<IModalEvent>;
    /** An event that is raised when a modal is shown. */
    readonly onShowModal: IEvent<IModalEvent>;

    /** Closes the modal with the specified id. */
    closeModal(id: number): void;
    /** Shows a modal with the specified options. */
    showModal(options: IModalOptions): IModal;
    /** Shows a modal prompting the user to confirm an action. */
    showConfirmModal(options: IConfirmOptions): IModal;
    /** Shows a modal prompting the user to save, discard, or cancel when leaving with unsaved changes. */
    showSaveChangesModal(options: ISaveChangesOptions): IModal;
}

/** Defines options for showing a save changes confirmation modal. */
export interface ISaveChangesOptions {
    /** Invoked when the user cancels and chooses to continue editing. */
    readonly onCancel: () => Promise<void>;
    /** Invoked when the user chooses to discard their changes. */
    readonly onDiscard: () => Promise<void>;
    /** Invoked when the user chooses to save their changes. */
    readonly onSave: () => Promise<void>;
}

/** Defines options for showing a confirmation modal. */
export interface IConfirmOptions {
    /** An optional title for the modal. Defaults to "Please confirm". */
    readonly title?: string;
    /** The message to display in the modal. */
    readonly message: string;
    /** An optional label for the confirm button. Defaults to "Confirm". */
    readonly confirmText?: string;

    /** Invoked when the user cancels the confirmation. */
    readonly onCancel: () => Promise<void>;
    /** Invoked when the user confirms the action. */
    readonly onConfirm: () => Promise<void>;
}

export interface IModal {
    close(): void;
}

/** Defines options for opening a modal. */
export interface IModalOptions {
    /** An optional title for the modal. */
    readonly title?: string;
    /** A React component type or a string message. */
    readonly content: React.ComponentType<any> | string;
    /** The options to pass to the content component as props if the content is a React component. */
    readonly contentProps?: Record<string, unknown>;
    /** A set of actions for the modal that will get rendered as buttons in the footer. */
    readonly actions?: IModalAction[];
    /** An optional close action that will enable a close button in the title bar if defined. */
    readonly close?: IModalCloseAction;
    /** True if the modal should be shown full screen. */
    readonly fullscreen?: boolean;
    /** An optional custom size for the modal when not full screen. */
    readonly size?: FModalSize;
    /** True if the modal should remain open if clicking outside of the box; otherwise false to indicate the modal should close automatically. */
    readonly persistent?: boolean;
}

@Singleton
export class ModalService implements IModalService {
    private readonly _closeModal = new EventEmitter<IModalEvent>();
    private readonly _showModal = new EventEmitter<IModalEvent>();
    private readonly activeModals = new Map<number, IModalEvent>();
    private modalSequence = 0;

    get onCloseModal(): IEvent<IModalEvent> {
        return this._closeModal.event;
    }

    get onShowModal(): IEvent<IModalEvent> {
        return this._showModal.event;
    }

    closeModal(id: number): void {
        const modal = this.activeModals.get(id);

        if (modal) {
            this.activeModals.delete(id);
            this._closeModal.emit(modal);
        }
    }

    showModal(options: IModalOptions): IModal {
        if (this.activeModals.size > 2) {
            throw new Error("No more than 3 modals can be opened at a time.");
        }

        const id = ++this.modalSequence;
        const modal = { id, options };
        this.activeModals.set(id, modal);
        this._showModal.emit(modal);

        return {
            close: () => this.closeModal(id)
        };
    }

    showConfirmModal(options: IConfirmOptions): IModal {
        return this.showModal({
            title: options.title ?? "Please confirm",
            content: options.message,
            contentProps: {},
            actions: [
                {
                    title: "Cancel",
                    invoke: () => options.onCancel().then(() => ({ result: true }))
                },
                {
                    title: options.confirmText ?? "Confirm",
                    primary: true,
                    invoke: () => options.onConfirm().then(() => ({ result: true }))
                },
            ],
            persistent: true
        });
    }

    showSaveChangesModal(options: ISaveChangesOptions): IModal {
        return this.showModal({
            title: "Are you sure you want to leave?",
            content: "You have unsaved changes. You can either save your changes, discard your changes, or cancel to continue editing.",
            contentProps: {},
            actions: [
                {
                    title: "Cancel",
                    invoke: () => options.onCancel().then(() => ({ result: true }))
                },
                {
                    title: "Discard changes",
                    invoke: () => options.onDiscard().then(() => ({ result: true }))
                },
                {
                    title: "Save changes",
                    primary: true,
                    invoke: () => options.onSave().then(() => ({ result: true }))
                },
            ],
            persistent: true
        });
    }
}