import { beforeEach, describe, expect, it } from "vitest";

import { Controller, ControllerKey } from "../../src/controllers/controller";
import type { ControllerConstructor } from "../../src/controllers/controller";
import { ActivityEventArgs, ControllerActivity } from "../../src/controllers/controller-activity";
import { ControllerManager } from "../../src/controllers/controller-manager";
import type { IControllerChangedEventArgs, IControllerManager } from "../../src/controllers/controller-manager";
import { ControllerRegistry, RegisterController } from "../../src/controllers/controller-registry";
import type { IFormController } from "../../src/controllers/form-controller";
import { createTestForm } from "../fixtures/citation-form";

/**
 * The registry is static, so every fixture controller here takes a key of its own and the suite never registers a
 * key twice. What a manager does to them is recorded in order, since the manager is what creates them.
 */
const log: Array<string> = [];

declare module "../../src/controllers/controller-activity" {
    interface IControllerActivityMap {
        /** A kind only these tests report. */
        "test-reported": { readonly note: string };
    }
}

@RegisterController("test-echo")
class EchoController extends Controller {
    /** Hands back the manager the controller was created with, which the base class keeps protected. */
    getManager(): IControllerManager {
        return this.manager;
    }

    notify(): void {
        this.emitChanged();
    }

    report(note: string): void {
        this.emitActivity({ kind: "test-reported", note });
    }

    start(): void {
        log.push("start echo");
    }

    dispose(): void {
        log.push("dispose echo");
    }
}

@RegisterController("test-lazy")
class LazyController extends Controller {
    constructor(manager: IControllerManager) {
        super(manager);
        log.push("create lazy");
    }

    dispose(): void {
        log.push("dispose lazy");
    }
}

@RegisterController("test-eager", { eager: true })
class EagerController extends Controller {
    starts = 0;
    startedWith?: string;

    constructor(manager: IControllerManager) {
        super(manager);
        log.push("create eager");
    }

    /** Reads the form controller, which throws if the manager started this before one was loaded. */
    start(): void {
        this.starts += 1;
        this.startedWith = this.manager.getFormController().form.id;
    }
}

/** Makes a fresh class named `Reloadable` on each call, the way a hot reload hands a module's class over again. */
function reloadable(): ControllerConstructor {
    return class Reloadable extends Controller { };
}

beforeEach(() => {
    log.length = 0;
});

describe("RegisterController", () => {
    it("registers the class under its key and gives the class that key", () => {
        const registration = ControllerRegistry.get("test-echo");

        expect(registration?.ctor).toBe(EchoController);
        expect(registration?.eager).toBe(false);
        expect(EchoController.key).toBe("test-echo");
    });

    it("registers a controller as eager when asked to", () => {
        expect(ControllerRegistry.get("test-eager")?.eager).toBe(true);
        expect(ControllerRegistry.getEager().map(registration => registration.ctor)).toContain(EagerController);
    });

    it("registers the controllers this package owns under their keys", () => {
        for (const key of Object.values(ControllerKey)) {
            expect(ControllerRegistry.get(key)?.key).toBe(key);
        }
    });

    /** A controller's field initializers read `this.key`, so this also proves the base class has set it by the time they run. */
    it("creates every controller this package owns through a manager", async () => {
        const manager = new ControllerManager();
        manager.loadForm(await createTestForm());

        for (const key of Object.values(ControllerKey)) {
            expect(manager.getController(key).key).toBe(key);
        }
    });

    it("throws when a different controller already holds the key", () => {
        class Impostor extends Controller { }

        expect(() => RegisterController("test-echo")(Impostor)).toThrowError(/already registered under the key 'test-echo'/);
    });

    it("accepts the class that already holds a key registering again", () => {
        expect(() => RegisterController("test-echo")(EchoController)).not.toThrow();
    });

    /** A hot reload evaluates a controller's module again, so the same class name turning up for the key it holds is not a clash. */
    it("lets a class of the same name replace the one registered, as a hot reload does", () => {
        const first = reloadable();
        const second = reloadable();

        RegisterController("test-reloadable")(first);
        RegisterController("test-reloadable")(second);

        expect(ControllerRegistry.get("test-reloadable")?.ctor).toBe(second);
    });
});

describe("Controller", () => {
    it("carries its key and is created with the manager that owns it", () => {
        const manager = new ControllerManager();
        const controller = manager.getController<EchoController>("test-echo");

        expect(controller.key).toBe("test-echo");
        expect(controller.getManager()).toBe(manager);
    });

    it("raises onChanged when it says it changed", () => {
        const controller = new ControllerManager().getController<EchoController>("test-echo");
        let raised = 0;
        controller.onChanged(() => { raised += 1; });

        controller.notify();

        expect(raised).toBe(1);
    });

    it("raises onActivity when it reports something", () => {
        const controller = new ControllerManager().getController<EchoController>("test-echo");
        const reported: Array<ControllerActivity> = [];
        controller.onActivity(activity => reported.push(activity));

        controller.report("hello");

        expect(reported).toEqual([{ kind: "test-reported", note: "hello" }]);
    });

    it("refuses to be created without a key", () => {
        class Unregistered extends Controller { }

        expect(() => new Unregistered(new ControllerManager())).toThrowError(/Unregistered has no key/);
    });

    /** The key is defined on the decorated class itself, so a subclass that skips the decorator does not silently share its parent's. */
    it("does not inherit its parent's key", () => {
        class Child extends EchoController { }

        expect(() => new Child(new ControllerManager())).toThrowError(/Child has no key/);
    });
});

describe("ControllerManager", () => {
    describe("getController", () => {
        it("creates a controller the first time its key is asked for and hands back the same one after", () => {
            const manager = new ControllerManager();

            expect(manager.getController("test-echo")).toBe(manager.getController("test-echo"));
        });

        it("keeps a controller to the manager that made it", () => {
            expect(new ControllerManager().getController("test-echo")).not.toBe(new ControllerManager().getController("test-echo"));
        });

        it("does not create a controller nobody has asked for", () => {
            const manager = new ControllerManager();

            expect(log).not.toContain("create lazy");

            expect(manager.getController<LazyController>("test-lazy")).toBeInstanceOf(LazyController);
            expect(log).toContain("create lazy");
        });

        it("starts a controller once, when it is created", () => {
            const manager = new ControllerManager();

            manager.getController("test-echo");
            manager.getController("test-echo");

            expect(log.filter(entry => entry === "start echo")).toHaveLength(1);
        });

        it("throws for a key nothing is registered under", () => {
            expect(() => new ControllerManager().getController("test-nothing")).toThrowError(/No controller is registered under the key 'test-nothing'/);
        });
    });

    describe("onActivity", () => {
        it("relays what any of its controllers reports", () => {
            const manager = new ControllerManager();
            const relayed: Array<ActivityEventArgs> = [];
            manager.onActivity(args => relayed.push(args));

            manager.getController<EchoController>("test-echo").report("hello");

            expect(relayed).toEqual([{ activity: { kind: "test-reported", note: "hello" } }]);
        });

        it("stops relaying a controller once it is disposed", () => {
            const manager = new ControllerManager();
            const controller = manager.getController<EchoController>("test-echo");
            const relayed: Array<ActivityEventArgs> = [];
            manager.onActivity(args => relayed.push(args));

            manager.disposeController("test-echo");
            controller.report("hello");

            expect(relayed).toEqual([]);
        });
    });

    describe("loadForm", () => {
        it("creates an eager controller once a form is loaded, with the form controller already in place", async () => {
            const manager = new ControllerManager();
            const form = await createTestForm();

            expect(log).not.toContain("create eager");

            manager.loadForm(form);

            // it read the form controller in start, which throws if the form controller had not been created yet
            expect(manager.getController<EagerController>("test-eager").startedWith).toBe(form.id);
        });

        it("starts an eager controller once however many times the same form is loaded", async () => {
            const manager = new ControllerManager();
            const form = await createTestForm();

            manager.loadForm(form);
            manager.loadForm(form);

            expect(manager.getController<EagerController>("test-eager").starts).toBe(1);
        });

        it("hands back the same form controller for the same form", async () => {
            const manager = new ControllerManager();
            const form = await createTestForm();

            expect(manager.loadForm(form)).toBe(manager.loadForm(form));
        });

        /** The form and rules controllers belong to a form; an eager controller observes across forms, so it stays. */
        it("replaces the form and rules controllers for a different form but keeps the others", async () => {
            const manager = new ControllerManager();
            const first = manager.loadForm(await createTestForm());
            const rules = manager.getRulesController();
            const eager = manager.getController<EagerController>("test-eager");

            const second = manager.loadForm(await createTestForm());

            expect(second).not.toBe(first);
            expect(manager.getRulesController()).not.toBe(rules);
            expect(manager.getController("test-eager")).toBe(eager);
        });
    });

    describe("getFormController", () => {
        it("throws until a form has been loaded", () => {
            expect(() => new ControllerManager().getFormController()).toThrowError(/A form must be loaded/);
        });

        it("still throws when the form controller was created by key before a form was loaded", () => {
            const manager = new ControllerManager();

            expect(() => manager.getController<IFormController>(ControllerKey.form).form).toThrowError(/A form must be loaded/);
            expect(() => manager.getFormController()).toThrowError(/A form must be loaded/);
        });
    });

    describe("onControllerChanged", () => {
        it("carries the key of the controller that changed", () => {
            const manager = new ControllerManager();
            const events: Array<IControllerChangedEventArgs> = [];
            manager.onControllerChanged(event => events.push(event));

            const echo = manager.getController<EchoController>("test-echo");
            echo.notify();
            manager.getPrintController().begin({ layout: "top-down" });

            expect(events.map(event => event.key)).toEqual(["test-echo", "print"]);
            expect(events[0].controller).toBe(echo);
        });

        /** Seeding raises nothing, so this is how an observer learns the form was replaced. */
        it("announces the form controller when a form is loaded, and again for a different form, but not for the same one", async () => {
            const manager = new ControllerManager();
            const events: Array<IControllerChangedEventArgs> = [];
            manager.onControllerChanged(event => events.push(event));
            const form = await createTestForm();

            manager.loadForm(form);
            manager.loadForm(form);

            expect(events.map(event => event.key)).toEqual([ControllerKey.form]);

            manager.loadForm(await createTestForm());

            expect(events.map(event => event.key)).toEqual([ControllerKey.form, ControllerKey.form]);
            expect(events[1].controller).toBe(manager.getFormController());
        });

        it("stops re-broadcasting a controller once it has been disposed", () => {
            const manager = new ControllerManager();
            const events: Array<IControllerChangedEventArgs> = [];
            manager.onControllerChanged(event => events.push(event));
            const echo = manager.getController<EchoController>("test-echo");

            manager.disposeController("test-echo");
            echo.notify();

            expect(events).toHaveLength(0);
        });
    });

    describe("dispose", () => {
        /** A controller that observes another is released before what it observes. */
        it("disposes the controllers last created first", () => {
            const manager = new ControllerManager();
            manager.getController("test-echo");
            manager.getController("test-lazy");
            log.length = 0;

            manager.dispose();

            expect(log).toEqual(["dispose lazy", "dispose echo"]);
        });
    });

    describe("retain, release and close", () => {
        /** A manager, and how many times it has said it closed. */
        function watched() {
            const manager = new ControllerManager();
            const closed = { count: 0 };
            manager.onClosed(() => { closed.count += 1; });

            return { closed, manager };
        }

        it("closes a microtask after the last thing holding it lets go", async () => {
            const { closed, manager } = watched();

            manager.retain();
            manager.release();

            expect(closed.count).toBe(0);

            await Promise.resolve();

            expect(closed.count).toBe(1);
        });

        it("does not close while something else still holds it", async () => {
            const { closed, manager } = watched();

            manager.retain();
            manager.retain();
            manager.release();
            await Promise.resolve();

            expect(closed.count).toBe(0);

            manager.release();
            await Promise.resolve();

            expect(closed.count).toBe(1);
        });

        /** React's development remount lets go and holds again at once, which is not the viewer going. */
        it("does not close when something holds it again before the microtask", async () => {
            const { closed, manager } = watched();

            manager.retain();
            manager.release();
            manager.retain();
            await Promise.resolve();

            expect(closed.count).toBe(0);
        });

        it("closes at once when asked, and only once however many reasons there are", async () => {
            const { closed, manager } = watched();

            manager.retain();
            manager.close();

            expect(closed.count).toBe(1);

            manager.close();
            manager.release();
            await Promise.resolve();

            expect(closed.count).toBe(1);
        });

        it("closes again when it is held again after it closed", () => {
            const { closed, manager } = watched();

            manager.retain();
            manager.close();
            manager.retain();
            manager.close();

            expect(closed.count).toBe(2);
        });
    });

    describe("attach", () => {
        it("runs setup once for a key, however often it is attached", () => {
            const manager = new ControllerManager();
            let setups = 0;
            const setup = (): (() => void) => { setups += 1; return () => undefined; };

            manager.attach("test-key", setup);
            manager.attach("test-key", setup);

            expect(setups).toBe(1);
        });

        /** Lets go of the manager the way a viewer unmounting does. */
        async function letGo(manager: ControllerManager): Promise<void> {
            manager.retain();
            manager.release();
            await Promise.resolve();
        }

        it("runs each teardown when the manager is let go, after it says it closed, last attached first", async () => {
            const manager = new ControllerManager();
            const order: Array<string> = [];
            manager.onClosed(() => order.push("closed"));
            manager.attach("first", () => () => order.push("first"));
            manager.attach("second", () => () => order.push("second"));

            expect(order).toEqual([]);

            await letGo(manager);

            expect(order).toEqual(["closed", "second", "first"]);
        });

        it("keeps what is attached when the manager is closed, since a page put away may come back", async () => {
            const manager = new ControllerManager();
            let teardowns = 0;
            manager.attach("test-key", () => () => { teardowns += 1; });

            manager.retain();
            manager.close();

            expect(teardowns).toBe(0);

            manager.release();
            await Promise.resolve();

            expect(teardowns).toBe(1);
        });

        it("runs a teardown once, however many times the manager is let go", async () => {
            const manager = new ControllerManager();
            let teardowns = 0;
            manager.attach("test-key", () => () => { teardowns += 1; });

            await letGo(manager);
            await letGo(manager);

            expect(teardowns).toBe(1);
        });

        it("attaches a key again once the manager has been let go", async () => {
            const manager = new ControllerManager();
            let setups = 0;
            const setup = (): (() => void) => { setups += 1; return () => undefined; };

            manager.attach("test-key", setup);
            await letGo(manager);
            manager.attach("test-key", setup);

            expect(setups).toBe(2);
        });
    });

    describe("arrival", () => {
        it("holds how the form arrived until it is told otherwise", () => {
            const manager = new ControllerManager();
            const arrival = { kind: "started", formId: "form-1", reason: "open" } as const;

            expect(manager.arrival).toBeUndefined();

            manager.setArrival(arrival);

            expect(manager.arrival).toBe(arrival);

            manager.setArrival(undefined);

            expect(manager.arrival).toBeUndefined();
        });
    });

    describe("reopen", () => {
        /** A manager, and how many times it has said it was shown again. */
        function watched() {
            const manager = new ControllerManager();
            const opened = { count: 0 };
            manager.onOpened(() => { opened.count += 1; });

            return { manager, opened };
        }

        it("says a manager that was closed is shown again", () => {
            const { manager, opened } = watched();

            manager.retain();
            manager.close();
            manager.reopen();

            expect(opened.count).toBe(1);
        });

        it("says nothing for a manager that is not closed", () => {
            const { manager, opened } = watched();

            manager.retain();
            manager.reopen();

            expect(opened.count).toBe(0);
        });

        it("says it once, however many times it is asked", () => {
            const { manager, opened } = watched();

            manager.retain();
            manager.close();
            manager.reopen();
            manager.reopen();

            expect(opened.count).toBe(1);
        });

        it("lets the manager close again afterwards", () => {
            const manager = new ControllerManager();
            let closed = 0;
            manager.onClosed(() => { closed += 1; });

            manager.retain();
            manager.close();
            manager.reopen();
            manager.close();

            expect(closed).toBe(2);
        });
    });
});
