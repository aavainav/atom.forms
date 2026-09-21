import { act, createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { useReviewComments } from "../../src/hooks/use-review-comments";
import { firstName, review } from "../fixtures/review-form";
import { mount, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

describe("useReviewComments", () => {
    /** Draws what the hook hands back, so a test can watch it change. */
    function mountProbe(controller: ReturnType<typeof review>["controller"]): HTMLElement {
        const Probe = () => createElement("output", undefined, useReviewComments(controller).map(comment => comment.text).join("|"));

        return mount(createElement(Probe));
    }

    it("hands back the controller's comments", () => {
        const { controller } = review();
        controller.add(firstName, "Wrong date.");

        expect(mountProbe(controller).textContent).toBe("Wrong date.");
    });

    it("re-renders when a comment is added, resolved or loaded", () => {
        const { controller } = review();
        const container = mountProbe(controller);

        act(() => { controller.add(firstName, "Wrong date."); });
        expect(container.textContent).toBe("Wrong date.");

        act(() => { controller.add(firstName, "Missing plate."); });
        expect(container.textContent).toBe("Wrong date.|Missing plate.");

        act(() => controller.load([]));
        expect(container.textContent).toBe("");
    });
});
