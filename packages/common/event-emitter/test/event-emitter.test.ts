import { describe, expect, it, vi } from "vitest";

import { EventEmitter } from "../src/index";

describe("EventEmitter", () => {
    describe("subscribing", () => {
        it("is named, so that what it raises can be told apart, and called an emitter otherwise", () => {
            expect(new EventEmitter("save").event.name).toBe("save");
            expect(new EventEmitter().event.name).toBe("emitter");
        });

        it("hands what is emitted to a listener", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event(listener);

            await emitter.emit("saved");

            expect(listener).toHaveBeenCalledWith("saved");
        });

        it("can also be subscribed to through its on property", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.on(listener);

            await emitter.emit("saved");

            expect(listener).toHaveBeenCalledWith("saved");
        });

        it("hands what is emitted to every listener, in the order they subscribed", async () => {
            const emitter = new EventEmitter<string>();
            const order: Array<string> = [];
            emitter.event(() => order.push("first"));
            emitter.event(() => order.push("second"));
            emitter.event(() => order.push("third"));

            await emitter.emit("saved");

            expect(order).toEqual(["first", "second", "third"]);
        });

        it("counts its listeners", () => {
            const emitter = new EventEmitter();
            expect(emitter.count).toBe(0);

            const first = emitter.event(() => undefined);
            emitter.event(() => undefined);
            expect(emitter.count).toBe(2);

            first.remove();
            expect(emitter.count).toBe(1);
        });

        it("has nothing to do when it is emitted with no listeners", async () => {
            await expect(new EventEmitter<string>().emit("saved")).resolves.toBeUndefined();
        });
    });

    describe("removing a listener", () => {
        it("stops handing it what is emitted", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            const subscription = emitter.event(listener);

            subscription.remove();
            await emitter.emit("saved");

            expect(listener).not.toHaveBeenCalled();
        });

        it("leaves the others listening", async () => {
            const emitter = new EventEmitter<string>();
            const removed = vi.fn();
            const kept = vi.fn();
            emitter.event(removed).remove();
            emitter.event(kept);

            await emitter.emit("saved");

            expect(kept).toHaveBeenCalledWith("saved");
        });

        it("can be done twice without harm, and takes away only the one listener", () => {
            const emitter = new EventEmitter();
            const first = emitter.event(() => undefined);
            emitter.event(() => undefined);

            first.remove();
            first.remove();

            expect(emitter.count).toBe(1);
        });

        it("takes away one of a callback given twice, not both", () => {
            const emitter = new EventEmitter();
            const callback = (): void => undefined;
            const first = emitter.event(callback);
            emitter.event(callback);

            first.remove();

            expect(emitter.count).toBe(1);
        });
    });

    describe("first and last listeners", () => {
        it("says when the first listener is added, and not for the ones after it", () => {
            const onFirstListenerAdd = vi.fn();
            const emitter = new EventEmitter("save", { onFirstListenerAdd });

            emitter.event(() => undefined);
            emitter.event(() => undefined);

            expect(onFirstListenerAdd).toHaveBeenCalledTimes(1);
        });

        it("has the first listener registered by the time it says so", () => {
            let count = 0;
            const emitter: EventEmitter = new EventEmitter("save", { onFirstListenerAdd: () => { count = emitter.count; } });

            emitter.event(() => undefined);

            expect(count).toBe(1);
        });

        it("says again when the first listener is added after the last was removed", () => {
            const onFirstListenerAdd = vi.fn();
            const emitter = new EventEmitter("save", { onFirstListenerAdd });

            emitter.event(() => undefined).remove();
            emitter.event(() => undefined);

            expect(onFirstListenerAdd).toHaveBeenCalledTimes(2);
        });

        it("says when the last listener is removed, and not for the ones before it", () => {
            const onLastListenerRemove = vi.fn();
            const emitter = new EventEmitter("save", { onLastListenerRemove });
            const first = emitter.event(() => undefined);
            const second = emitter.event(() => undefined);

            first.remove();
            expect(onLastListenerRemove).not.toHaveBeenCalled();

            second.remove();
            expect(onLastListenerRemove).toHaveBeenCalledTimes(1);
        });

        it("does not say the last listener was removed for a removal that took nothing away", () => {
            const onLastListenerRemove = vi.fn();
            const emitter = new EventEmitter("save", { onLastListenerRemove });
            const only = emitter.event(() => undefined);

            only.remove();
            only.remove();

            expect(onLastListenerRemove).toHaveBeenCalledTimes(1);
        });
    });

    describe("emitting", () => {
        it("waits for the listeners that are asynchronous", async () => {
            const emitter = new EventEmitter();
            let finished = false;
            emitter.event(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                finished = true;
            });

            await emitter.emit();

            expect(finished).toBe(true);
        });

        it("runs every listener before it settles, and rejects with the errors of those that failed", async () => {
            const emitter = new EventEmitter();
            const ran = vi.fn();
            const first = new Error("first");
            const second = new Error("second");
            emitter.event(async () => { throw first; });
            emitter.event(async () => { ran(); });
            emitter.event(async () => { throw second; });

            await expect(emitter.emit()).rejects.toEqual([first, second]);
            expect(ran).toHaveBeenCalledTimes(1);
        });

        it("rejects with the error of a listener that throws before it has a chance to be asynchronous", async () => {
            const emitter = new EventEmitter();
            emitter.event(() => { throw new Error("boom"); });

            await expect(emitter.emit()).rejects.toThrow("boom");
        });

        it("hands the current emission to a listener that was removed during it, but not the next", async () => {
            const emitter = new EventEmitter<string>();
            const later = vi.fn();
            let laterListener: { remove(): void } | undefined;
            emitter.event(() => laterListener!.remove());
            laterListener = emitter.event(later);

            await emitter.emit("first");
            await emitter.emit("second");

            expect(later).toHaveBeenCalledTimes(1);
            expect(later).toHaveBeenCalledWith("first");
        });

        it("does not hand the current emission to a listener added during it", async () => {
            const emitter = new EventEmitter<string>();
            const added = vi.fn();
            emitter.event(() => { emitter.event(added); });

            await emitter.emit("first");

            expect(added).not.toHaveBeenCalled();
        });
    });

    describe("what a subclass hears about", () => {
        class WatchedEmitter extends EventEmitter {
            registered = 0;
            unregistered = 0;

            protected override callbackRegistered(): void { this.registered += 1; }
            protected override callbackUnregistered(): void { this.unregistered += 1; }
        }

        it("hears about each listener registered, and each removed", () => {
            const emitter = new WatchedEmitter();
            const first = emitter.event(() => undefined);
            emitter.event(() => undefined);

            first.remove();

            expect(emitter.registered).toBe(2);
            expect(emitter.unregistered).toBe(1);
        });

        it("does not hear of a removal that took nothing away", () => {
            const emitter = new WatchedEmitter();
            const only = emitter.event(() => undefined);

            only.remove();
            only.remove();

            expect(emitter.unregistered).toBe(1);
        });
    });
});
