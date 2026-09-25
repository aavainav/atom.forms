// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot } from "react-dom/client";
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

    describe("holding the manager", () => {
        /** A form for the manager, and a count of how many times the manager has said it closed. */
        async function watched() {
            const form = await createTestForm();
            const controllers = new ControllerManager();
            const closed = { count: 0 };
            controllers.onClosed(() => { closed.count += 1; });

            return { closed, controllers, form };
        }

        it("keeps the manager open while it is mounted, and closes it a microtask after it unmounts", async () => {
            const { closed, controllers, form } = await watched();
            const hook = renderHook(() => useFormController(controllers, form));
            await Promise.resolve();

            expect(closed.count).toBe(0);

            hook.unmount();

            expect(closed.count).toBe(0);

            await Promise.resolve();

            expect(closed.count).toBe(1);
        });

        it("closes the manager at once when the page is put away, and once only when it then unmounts", async () => {
            const { closed, controllers, form } = await watched();
            const hook = renderHook(() => useFormController(controllers, form));

            window.dispatchEvent(new Event("pagehide"));

            expect(closed.count).toBe(1);

            hook.unmount();
            await Promise.resolve();

            expect(closed.count).toBe(1);
        });

        it("stops listening for the page being put away once it unmounts", async () => {
            const { closed, controllers, form } = await watched();
            const hook = renderHook(() => useFormController(controllers, form));

            hook.unmount();
            await Promise.resolve();
            controllers.retain();
            window.dispatchEvent(new Event("pagehide"));

            expect(closed.count).toBe(1);
        });

        /** A page the browser restores from its cache is shown again without being mounted again. */
        function pageShown(persisted: boolean): void {
            window.dispatchEvent(Object.assign(new Event("pageshow"), { persisted }));
        }

        it("reopens the manager when the browser restores the page from its cache", async () => {
            const { controllers, form } = await watched();
            let opened = 0;
            controllers.onOpened(() => { opened += 1; });
            renderHook(() => useFormController(controllers, form));

            window.dispatchEvent(new Event("pagehide"));
            pageShown(true);

            expect(opened).toBe(1);
        });

        it("does not reopen the manager for a page that was not restored from the cache", async () => {
            const { controllers, form } = await watched();
            let opened = 0;
            controllers.onOpened(() => { opened += 1; });
            renderHook(() => useFormController(controllers, form));

            window.dispatchEvent(new Event("pagehide"));
            pageShown(false);

            expect(opened).toBe(0);
        });

        it("stops listening for the page being shown once it unmounts", async () => {
            const { controllers, form } = await watched();
            let opened = 0;
            controllers.onOpened(() => { opened += 1; });
            const hook = renderHook(() => useFormController(controllers, form));

            hook.unmount();
            await Promise.resolve();
            pageShown(true);

            expect(opened).toBe(0);
        });

        it("lets go of the manager it held, and holds the one it is handed now", async () => {
            const first = await watched();
            const second = await watched();
            let current = first;
            const hook = renderHook(() => useFormController(current.controllers, current.form));

            current = second;
            hook.rerender();
            await Promise.resolve();

            expect(first.closed.count).toBe(1);
            expect(second.closed.count).toBe(0);
        });

        /** In development React sets an effect up, cleans it up and sets it up again at once, which is not the viewer going. */
        it("does not close the manager for the remount React's StrictMode does in development", async () => {
            const { closed, controllers, form } = await watched();
            const root = createRoot(document.createElement("div"));

            function Probe(): null {
                useFormController(controllers, form);
                return null;
            }

            act(() => root.render(createElement(StrictMode, undefined, createElement(Probe))));
            await Promise.resolve();

            expect(closed.count).toBe(0);

            act(() => root.unmount());
            await Promise.resolve();

            expect(closed.count).toBe(1);
        });
    });
});
