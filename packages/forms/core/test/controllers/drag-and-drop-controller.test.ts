import { describe, expect, it, vi } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IReplaceRecord } from "../../src/controllers/drag-and-drop-controller";

const replacing: IReplaceRecord = { current: "James Whitfield", next: "Dana Price", type: "person" };

describe("DragAndDropController", () => {
    describe("confirmReplace", () => {
        it("lets a drop replace a record when the host sets no policy", async () => {
            await expect(new ControllerManager().getDragAndDropController().confirmReplace(replacing)).resolves.toBe(true);
        });

        it("asks the host's policy, and answers as it does", async () => {
            const controller = new ControllerManager().getDragAndDropController();
            const confirm = vi.fn(async () => false);
            controller.setConfirmReplace(confirm);

            await expect(controller.confirmReplace(replacing)).resolves.toBe(false);
            expect(confirm).toHaveBeenCalledWith(replacing);
        });

        it("forgets the policy once it is cleared, or the controller is disposed", async () => {
            const controller = new ControllerManager().getDragAndDropController();
            const confirm = vi.fn(async () => false);

            controller.setConfirmReplace(confirm);
            controller.setConfirmReplace(undefined);
            await expect(controller.confirmReplace(replacing)).resolves.toBe(true);

            controller.setConfirmReplace(confirm);
            controller.dispose();
            await expect(controller.confirmReplace(replacing)).resolves.toBe(true);
            expect(confirm).not.toHaveBeenCalled();
        });
    });
});
