import { afterEach, describe, expect, it, vi } from "vitest";

import { EventEmitter } from "../src/index";

afterEach(() => {
    vi.useRealTimers();
});

describe("an event's operators", () => {
    describe("once", () => {
        it("hands over the first emission, and none after it", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.once(listener);

            await emitter.emit("first");
            await emitter.emit("second");

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith("first");
        });

        it("stops listening before it calls back, so an asynchronous callback is not called again by an emission that lands meanwhile", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn(() => new Promise<void>(resolve => setTimeout(resolve, 10)));
            emitter.event.once(listener);

            const first = emitter.emit("first");
            const second = emitter.emit("second");
            await Promise.all([first, second]);

            expect(listener).toHaveBeenCalledTimes(1);
        });

        it("waits for an asynchronous callback", async () => {
            const emitter = new EventEmitter<string>();
            let finished = false;
            emitter.event.once(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                finished = true;
            });

            await emitter.emit("first");

            expect(finished).toBe(true);
        });

        it("can be removed before anything is emitted", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();

            emitter.event.once(listener).remove();
            await emitter.emit("first");

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("aggregate", () => {
        it("fires whenever either event does, and is named for both", async () => {
            const first = new EventEmitter<string>("first");
            const second = new EventEmitter<string>("second");
            const aggregated = first.event.aggregate(second.event);
            const listener = vi.fn();
            aggregated(listener);

            await first.emit("from first");
            await second.emit("from second");

            expect(listener.mock.calls).toEqual([["from first"], ["from second"]]);
            expect(aggregated.name).toBe("first+second");
        });

        it("stops listening to both when it is removed", () => {
            const first = new EventEmitter<string>();
            const second = new EventEmitter<string>();
            const listener = first.event.aggregate(second.event)(() => undefined);

            listener.remove();

            expect(first.count).toBe(0);
            expect(second.count).toBe(0);
        });
    });

    describe("debounce", () => {
        it("fires once, with the last value, after the emissions stop for the delay", async () => {
            vi.useFakeTimers();
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.debounce(50)(listener);

            await emitter.emit("a");
            vi.advanceTimersByTime(20);
            await emitter.emit("b");
            vi.advanceTimersByTime(20);
            await emitter.emit("c");
            expect(listener).not.toHaveBeenCalled();

            vi.advanceTimersByTime(50);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith("c");
        });

        it("combines the values it collected, when it is told how", async () => {
            vi.useFakeTimers();
            const emitter = new EventEmitter<number>();
            const listener = vi.fn();
            emitter.event.debounce(50, (total, next) => total + next)(listener);

            await emitter.emit(1);
            await emitter.emit(2);
            await emitter.emit(3);
            vi.advanceTimersByTime(50);

            expect(listener).toHaveBeenCalledWith(6);
        });

        it("starts afresh after it fires", async () => {
            vi.useFakeTimers();
            const emitter = new EventEmitter<number>();
            const listener = vi.fn();
            emitter.event.debounce(50, (total, next) => total + next)(listener);

            await emitter.emit(1);
            await emitter.emit(2);
            vi.advanceTimersByTime(50);
            await emitter.emit(10);
            vi.advanceTimersByTime(50);

            expect(listener.mock.calls).toEqual([[3], [10]]);
        });

        it("fires for an event that carries nothing", async () => {
            vi.useFakeTimers();
            const emitter = new EventEmitter();
            const listener = vi.fn();
            emitter.event.debounce(50)(listener);

            await emitter.emit();
            await emitter.emit();
            vi.advanceTimersByTime(50);

            expect(listener).toHaveBeenCalledTimes(1);
        });

        it("fires nothing when nothing was emitted", () => {
            vi.useFakeTimers();
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.debounce(50)(listener);

            vi.advanceTimersByTime(500);

            expect(listener).not.toHaveBeenCalled();
        });

        it("listens to the event only while it has a listener of its own", () => {
            const emitter = new EventEmitter<string>();
            const debounced = emitter.event.debounce(50);
            expect(emitter.count).toBe(0);

            const listener = debounced(() => undefined);
            expect(emitter.count).toBe(1);

            listener.remove();
            expect(emitter.count).toBe(0);
        });

        it("is named for the event it debounces", () => {
            expect(new EventEmitter("save").event.debounce(50).name).toBe("save");
        });
    });

    describe("filter", () => {
        it("hands over only what passes", async () => {
            const emitter = new EventEmitter<number>();
            const listener = vi.fn();
            emitter.event.filter(value => value % 2 === 0)(listener);

            await emitter.emit(1);
            await emitter.emit(2);
            await emitter.emit(3);
            await emitter.emit(4);

            expect(listener.mock.calls).toEqual([[2], [4]]);
        });

        it("waits for an asynchronous listener, and is named for the event it filters", async () => {
            const emitter = new EventEmitter<number>("counted");
            let finished = false;
            const filtered = emitter.event.filter(() => true);
            filtered(async () => {
                await new Promise(resolve => setTimeout(resolve, 10));
                finished = true;
            });

            await emitter.emit(1);

            expect(finished).toBe(true);
            expect(filtered.name).toBe("counted");
        });

        it("stops listening to the event when it is removed", () => {
            const emitter = new EventEmitter<number>();

            emitter.event.filter(() => true)(() => undefined).remove();

            expect(emitter.count).toBe(0);
        });
    });

    describe("map", () => {
        it("hands over what the event carried, changed", async () => {
            const emitter = new EventEmitter<number>();
            const listener = vi.fn();
            emitter.event.map(value => `#${value}`)(listener);

            await emitter.emit(7);

            expect(listener).toHaveBeenCalledWith("#7");
        });

        it("is named for the event it maps, and stops listening to it when removed", () => {
            const emitter = new EventEmitter<number>("counted");
            const mapped = emitter.event.map(value => value * 2);
            const listener = mapped(() => undefined);

            expect(mapped.name).toBe("counted");

            listener.remove();
            expect(emitter.count).toBe(0);
        });
    });

    describe("split", () => {
        it("fires once for each item the splitter makes of what was emitted", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.split(value => value.split(","))(listener);

            await emitter.emit("a,b,c");

            expect(listener.mock.calls).toEqual([["a"], ["b"], ["c"]]);
        });

        it("waits for the listener to finish with one item before it hands over the next", async () => {
            const emitter = new EventEmitter<string>();
            const log: Array<string> = [];
            emitter.event.split(value => value.split(","))(async item => {
                log.push(`start ${item}`);
                await new Promise(resolve => setTimeout(resolve, 5));
                log.push(`end ${item}`);
            });

            await emitter.emit("a,b");

            expect(log).toEqual(["start a", "end a", "start b", "end b"]);
        });

        it("fires nothing when the splitter makes nothing", async () => {
            const emitter = new EventEmitter<string>();
            const listener = vi.fn();
            emitter.event.split(() => [])(listener);

            await emitter.emit("a,b");

            expect(listener).not.toHaveBeenCalled();
        });
    });

    describe("forward", () => {
        it("emits what the event carries from another emitter", async () => {
            const source = new EventEmitter<string>();
            const target = new EventEmitter<string>();
            const listener = vi.fn();
            target.event(listener);
            source.event.forward(target);

            await source.emit("saved");

            expect(listener).toHaveBeenCalledWith("saved");
        });

        it("stops forwarding when it is removed", async () => {
            const source = new EventEmitter<string>();
            const target = new EventEmitter<string>();
            const listener = vi.fn();
            target.event(listener);

            source.event.forward(target).remove();
            await source.emit("saved");

            expect(listener).not.toHaveBeenCalled();
        });
    });
});
