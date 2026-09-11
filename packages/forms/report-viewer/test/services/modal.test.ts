import { beforeEach, describe, expect, it } from "vitest";

import type { IModalEvent } from "../../src/services/modal";
import { ModalService } from "../../src/services/modal";

describe("ModalService", () => {
    let service: ModalService;
    let shown: Array<IModalEvent>;
    let closed: Array<IModalEvent>;

    beforeEach(() => {
        service = new ModalService();
        shown = [];
        closed = [];

        service.onShowModal(event => { shown.push(event); });
        service.onCloseModal(event => { closed.push(event); });
    });

    describe("showModal", () => {
        it("raises onShowModal with the options it was given", () => {
            service.showModal({ content: "Hello", title: "Greeting" });

            expect(shown).toHaveLength(1);
            expect(shown[0].options.content).toBe("Hello");
            expect(shown[0].options.title).toBe("Greeting");
        });

        it("gives each modal its own id", () => {
            service.showModal({ content: "One" });
            service.showModal({ content: "Two" });

            expect(shown.map(event => event.id)).toEqual([1, 2]);
        });

        /** Three at once is the ceiling; a fourth is a wiring mistake rather than something to stack up. */
        it("refuses to open a fourth modal while three are open", () => {
            service.showModal({ content: "One" });
            service.showModal({ content: "Two" });
            service.showModal({ content: "Three" });

            expect(() => service.showModal({ content: "Four" }))
                .toThrowError("No more than 3 modals can be opened at a time.");
        });

        it("makes room again once one is closed", () => {
            const first = service.showModal({ content: "One" });
            service.showModal({ content: "Two" });
            service.showModal({ content: "Three" });

            first.close();

            expect(() => service.showModal({ content: "Four" })).not.toThrow();
        });

        it("hands back a handle that closes the modal it opened", () => {
            const modal = service.showModal({ content: "One" });

            modal.close();

            expect(closed).toHaveLength(1);
            expect(closed[0].id).toBe(1);
        });

        /** Ids keep climbing rather than being reused, so a stale handle cannot close a later modal. */
        it("does not reuse an id after a modal is closed", () => {
            service.showModal({ content: "One" }).close();
            service.showModal({ content: "Two" });

            expect(shown.map(event => event.id)).toEqual([1, 2]);
        });
    });

    describe("closeModal", () => {
        it("raises onCloseModal for a modal that is open", () => {
            service.showModal({ content: "One" });

            service.closeModal(1);

            expect(closed.map(event => event.id)).toEqual([1]);
        });

        it("does nothing for an id it does not hold", () => {
            service.closeModal(99);

            expect(closed).toHaveLength(0);
        });

        it("does nothing the second time the same modal is closed", () => {
            const modal = service.showModal({ content: "One" });

            modal.close();
            modal.close();

            expect(closed).toHaveLength(1);
        });
    });

    describe("showConfirmModal", () => {
        it("defaults its title and confirm label", () => {
            service.showConfirmModal({ message: "Delete this page?", onCancel: async () => { }, onConfirm: async () => { } });

            expect(shown[0].options.title).toBe("Please confirm");
            expect(shown[0].options.actions?.map(action => action.title)).toEqual(["Cancel", "Confirm"]);
        });

        it("takes a title and confirm label of its own", () => {
            service.showConfirmModal({
                title: "Delete page",
                message: "Delete this page?",
                confirmText: "Delete",
                onCancel: async () => { },
                onConfirm: async () => { }
            });

            expect(shown[0].options.title).toBe("Delete page");
            expect(shown[0].options.actions?.[1].title).toBe("Delete");
        });

        it("marks the confirm action as the primary one", () => {
            service.showConfirmModal({ message: "Delete this page?", onCancel: async () => { }, onConfirm: async () => { } });

            expect(shown[0].options.actions?.[0].primary).toBeUndefined();
            expect(shown[0].options.actions?.[1].primary).toBe(true);
        });

        /** A confirmation must be answered rather than dismissed by clicking away from it. */
        it("is persistent", () => {
            service.showConfirmModal({ message: "Delete this page?", onCancel: async () => { }, onConfirm: async () => { } });

            expect(shown[0].options.persistent).toBe(true);
        });

        it("invokes the callback belonging to the action taken", async () => {
            let confirmed = 0;
            let cancelled = 0;

            service.showConfirmModal({
                message: "Delete this page?",
                onCancel: async () => { cancelled += 1; },
                onConfirm: async () => { confirmed += 1; }
            });

            await shown[0].options.actions?.[1].invoke!();

            expect(confirmed).toBe(1);
            expect(cancelled).toBe(0);
        });
    });

    describe("showSaveChangesModal", () => {
        it("offers cancel, discard and save, with save as the primary action", () => {
            service.showSaveChangesModal({ onCancel: async () => { }, onDiscard: async () => { }, onSave: async () => { } });

            expect(shown[0].options.actions?.map(action => action.title))
                .toEqual(["Cancel", "Discard changes", "Save changes"]);
            expect(shown[0].options.actions?.[2].primary).toBe(true);
        });

        it("is persistent, so leaving has to be answered", () => {
            service.showSaveChangesModal({ onCancel: async () => { }, onDiscard: async () => { }, onSave: async () => { } });

            expect(shown[0].options.persistent).toBe(true);
        });

        it("invokes the callback belonging to the action taken", async () => {
            const taken: Array<string> = [];

            service.showSaveChangesModal({
                onCancel: async () => { taken.push("cancel"); },
                onDiscard: async () => { taken.push("discard"); },
                onSave: async () => { taken.push("save"); }
            });

            await shown[0].options.actions?.[1].invoke!();

            expect(taken).toEqual(["discard"]);
        });
    });
});
