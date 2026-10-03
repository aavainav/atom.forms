import { describe, expect, it, vi } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IDropTarget, IReplaceRecord } from "../../src/controllers/drag-and-drop-controller";

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

    describe("the dropzones on the form", () => {
        const target = (id: string, title = "Violator Section"): IDropTarget => ({ id, isClosed: false, pageId: "page-1", title, type: "person", fill: vi.fn(async () => undefined) });

        it("lists a dropzone once it registers, in the order they came", () => {
            const controller = new ControllerManager().getDragAndDropController();
            const violator = target("violator");
            const owner = target("owner", "Owner Section");

            controller.registerTarget(violator);
            controller.registerTarget(owner);

            expect(controller.targets).toEqual([violator, owner]);
        });

        it("replaces a dropzone registered again under its id, as one whose section has locked is", () => {
            const controller = new ControllerManager().getDragAndDropController();
            const locked = { ...target("violator"), isClosed: true };

            controller.registerTarget(target("violator"));
            controller.registerTarget(locked);

            expect(controller.targets).toEqual([locked]);
        });

        it("drops it once it unregisters, leaving a newer one under the same id alone", () => {
            const controller = new ControllerManager().getDragAndDropController();
            const unregister = controller.registerTarget(target("violator"));
            const newer = target("violator");
            const unregisterNewer = controller.registerTarget(newer);

            unregister();
            expect(controller.targets).toEqual([newer]);

            unregisterNewer();
            expect(controller.targets).toEqual([]);
        });

        it("says each change, with a list of its own each time so a snapshot compares unequal", () => {
            const controller = new ControllerManager().getDragAndDropController();
            const changed = vi.fn();
            controller.onChanged(changed);
            const before = controller.targets;

            const unregister = controller.registerTarget(target("violator"));
            const during = controller.targets;
            unregister();

            expect(changed).toHaveBeenCalledTimes(2);
            expect(during).not.toBe(before);
            expect(controller.targets).not.toBe(during);
        });

        it("forgets them all when it is disposed", () => {
            const controller = new ControllerManager().getDragAndDropController();
            controller.registerTarget(target("violator"));

            controller.dispose();

            expect(controller.targets).toEqual([]);
        });
    });
});
