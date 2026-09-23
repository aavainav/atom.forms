// @vitest-environment jsdom
import { act } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { ControllerManager } from "../../src/controllers/controller-manager";
import { useForm, useFormController } from "../../src/hooks/use-form";
import { createTestForm } from "../fixtures/citation-form";
import { cleanupHooks, renderHook } from "../fixtures/render-hook";

afterEach(cleanupHooks);

/** A form loaded into a manager of its own, and the controller that holds it. */
async function setup() {
    const form = await createTestForm();
    const controllers = new ControllerManager();
    const controller = controllers.loadForm(form);

    return { controller, controllers, form };
}

describe("useForm", () => {
    it("answers the form the controller holds", async () => {
        const { controller, form } = await setup();

        expect(renderHook(() => useForm(controller)).result.current).toBe(form);
    });

    it("renders again with the new form whenever an edit is applied", async () => {
        const { controller } = await setup();
        const hook = renderHook(() => useForm(controller));
        const rendersBefore = hook.renders();

        act(() => controller.update({ update: form => form.setStatus("issued") }));

        expect(hook.result.current.status).toBe("issued");
        expect(hook.result.current).toBe(controller.form);
        expect(hook.renders()).toBe(rendersBefore + 1);
    });

    it("follows a whole form set on the controller", async () => {
        const { controller } = await setup();
        const hook = renderHook(() => useForm(controller));
        const replacement = (await createTestForm()).setStatus("voided");

        act(() => controller.setForm(replacement));

        expect(hook.result.current).toBe(replacement);
    });

    it("does not render again for an update that changed nothing", async () => {
        const { controller } = await setup();
        const hook = renderHook(() => useForm(controller));
        const rendersBefore = hook.renders();

        act(() => controller.update({ update: form => form }));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("answers the same form when it is rendered again while nothing has changed", async () => {
        const { controller, form } = await setup();
        const hook = renderHook(() => useForm(controller));

        hook.rerender();
        hook.rerender();

        expect(hook.result.current).toBe(form);
    });

    it("stops listening to the controller when it is unmounted", async () => {
        const { controller } = await setup();
        const hook = renderHook(() => useForm(controller));
        hook.unmount();
        const rendersBefore = hook.renders();

        act(() => controller.update({ update: form => form.setStatus("issued") }));

        expect(hook.renders()).toBe(rendersBefore);
    });

    it("listens to the controller it is handed now, and not the one it was handed before", async () => {
        const first = await setup();
        const second = await setup();
        let controller = first.controller;
        const hook = renderHook(() => useForm(controller));

        controller = second.controller;
        hook.rerender();
        const rendersBefore = hook.renders();

        act(() => first.controller.update({ update: form => form.setStatus("issued") }));
        expect(hook.renders()).toBe(rendersBefore);

        act(() => second.controller.update({ update: form => form.setStatus("voided") }));
        expect(hook.result.current.status).toBe("voided");
    });
});

describe("useFormController", () => {
    it("loads the form into the manager on the very first render, so its controller can be used straight away", async () => {
        const form = await createTestForm();
        const controllers = new ControllerManager();
        let onFirstRender: unknown;

        renderHook(() => {
            const controller = useFormController(controllers, form);
            onFirstRender ??= controller.form;

            return controller;
        });

        expect(onFirstRender).toBe(form);
    });

    it("answers the manager's own form controller", async () => {
        const form = await createTestForm();
        const controllers = new ControllerManager();

        const { result } = renderHook(() => useFormController(controllers, form));

        expect(result.current).toBe(controllers.getFormController());
    });

    it("answers the same controller when it is rendered again with the same form", async () => {
        const form = await createTestForm();
        const controllers = new ControllerManager();
        const hook = renderHook(() => useFormController(controllers, form));
        const first = hook.result.current;

        hook.rerender();

        expect(hook.result.current).toBe(first);
    });

    it("does not load the form again on a repeat render, so an edit made since survives", async () => {
        const form = await createTestForm();
        const controllers = new ControllerManager();
        const hook = renderHook(() => useFormController(controllers, form));

        act(() => hook.result.current.update({ update: current => current.setStatus("issued") }));
        hook.rerender();

        expect(hook.result.current.form.status).toBe("issued");
    });

    it("answers a controller for a genuinely different form when it is given one", async () => {
        const first = await createTestForm();
        const second = await createTestForm();
        const controllers = new ControllerManager();
        let form = first;
        const hook = renderHook(() => useFormController(controllers, form));
        const firstController = hook.result.current;

        form = second;
        hook.rerender();

        expect(hook.result.current).not.toBe(firstController);
        expect(hook.result.current.form).toBe(second);
    });
});
