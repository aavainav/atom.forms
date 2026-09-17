import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";
import { IModalAction, IModalCloseAction, IModalOptions, IModalResult, FModalSize } from "@forms/core";

// re-export the modal types for other modules to import. IModalOptions is among them because it describes the
// modal itself rather than this service: @forms/printing types the showModal it is handed against it, and it sits
// below this package, so the shape has to be reachable without depending on the report viewer.
export type { IModalAction, IModalCloseAction, IModalOptions, IModalResult, FModalSize };

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
    /** Defaults to "Are you sure you want to leave?". */
    readonly title?: string;
    /** Defaults to the standard "you have unsaved changes" copy. */
    readonly message?: string;

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
            title: options.title ?? "Are you sure you want to leave?",
            content: options.message ?? "You have unsaved changes. You can either save your changes, discard your changes, or cancel to continue editing.",
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