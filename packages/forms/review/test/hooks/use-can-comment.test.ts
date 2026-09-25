import { act, createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { FormModel } from "@forms/core";

import { useCanComment } from "../../src/hooks/use-can-comment";
import { osei, review } from "../fixtures/review-form";
import { mount, unmountAll } from "../fixtures/mount";

afterEach(unmountAll);

describe("useCanComment", () => {
    /** Draws what the hook hands back, and how many times it was drawn, so a test can watch it change. */
    function mountProbe(controllers: ReturnType<typeof review>["controllers"]) {
        let renders = 0;
        const Probe = () => {
            renders += 1;
            return createElement("output", undefined, String(useCanComment(controllers)));
        };

        return { container: mount(createElement(Probe)), renders: () => renders };
    }

    /** Puts the form in the given status, as a transition does. */
    function moveTo(controllers: ReturnType<typeof review>["controllers"], status: string): void {
        const controller = controllers.getFormController();

        act(() => controller.setForm({ ...controller.form, status } as FormModel<any>));
    }

    it("hands back whether a comment can be added", () => {
        expect(mountProbe(review().controllers).container.textContent).toBe("true");

        unmountAll();

        expect(mountProbe(review({ status: "draft" }).controllers).container.textContent).toBe("false");
    });

    it("re-renders when the report leaves review, and when it comes back", () => {
        const { controllers } = review();
        const { container } = mountProbe(controllers);

        moveTo(controllers, "rejected");
        expect(container.textContent).toBe("false");

        moveTo(controllers, "inReview");
        expect(container.textContent).toBe("true");
    });

    it("re-renders when the user is set, once the form changes", () => {
        const { controllers } = review({ user: null });
        const { container } = mountProbe(controllers);

        expect(container.textContent).toBe("false");

        controllers.setUser(osei);
        moveTo(controllers, "inReview");

        expect(container.textContent).toBe("true");
    });

    it("does not render again for a change that leaves the answer as it was", () => {
        const { controllers } = review();
        const { renders } = mountProbe(controllers);
        const before = renders();

        moveTo(controllers, "inReview");

        expect(renders()).toBe(before);
    });
});
