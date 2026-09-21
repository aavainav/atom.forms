import { describe, expect, it, vi } from "vitest";

import { AggregateEventEmitter, EventEmitter } from "../src/index";

describe("AggregateEventEmitter", () => {
    /** Wraps an event so that what it carries is joined into one string. */
    function joining() {
        const source = new EventEmitter<string>();
        const aggregate = new AggregateEventEmitter<string>("joined");
        aggregate.wrap(source.event, () => "", (args, result) => result + args);

        return { aggregate, source };
    }

    it("fires once, with everything the wrapped event carried while it was collecting", async () => {
        const { aggregate, source } = joining();
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(async () => {
            await source.emit("a");
            await source.emit("b");
            await source.emit("c");
        });

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith("abc");
    });

    it("fires nothing when the wrapped event did not fire while it was collecting", async () => {
        const { aggregate } = joining();
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(() => undefined);

        expect(listener).not.toHaveBeenCalled();
    });

    it("waits for an asynchronous action before it fires", async () => {
        const { aggregate, source } = joining();
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(async () => {
            await new Promise(resolve => setTimeout(resolve, 10));
            await source.emit("late");
        });

        expect(listener).toHaveBeenCalledWith("late");
    });

    it("starts each collection afresh", async () => {
        const { aggregate, source } = joining();
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(() => source.emit("first"));
        await aggregate.collectEvents(() => source.emit("second"));

        expect(listener.mock.calls).toEqual([["first"], ["second"]]);
    });

    it("ignores what the wrapped event carries once a collection is over", async () => {
        const { aggregate, source } = joining();
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(() => source.emit("during"));
        await source.emit("after");

        expect(listener).toHaveBeenCalledTimes(1);
    });

    it("gathers what several wrapped events carry into the one result", async () => {
        const first = new EventEmitter<string>();
        const second = new EventEmitter<number>();
        const aggregate = new AggregateEventEmitter<string>("joined");
        aggregate.wrap(first.event, () => "", (args, result) => result + args);
        aggregate.wrap(second.event, undefined, (args, result) => result + args);
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(async () => {
            await first.emit("a");
            await second.emit(1);
            await first.emit("b");
        });

        expect(listener).toHaveBeenCalledWith("a1b");
    });

    it("starts the result afresh from its initializer for each collection", async () => {
        const source = new EventEmitter<number>();
        const aggregate = new AggregateEventEmitter<number>("total");
        aggregate.wrap(source.event, () => 100, (args, result) => result + args);
        const listener = vi.fn();
        aggregate.event(listener);

        await aggregate.collectEvents(() => source.emit(1));
        await aggregate.collectEvents(() => source.emit(2));

        expect(listener.mock.calls).toEqual([[101], [102]]);
    });

    it("stops listening to what it wrapped when it is removed", () => {
        const { aggregate, source } = joining();
        expect(source.count).toBe(1);

        aggregate.remove();

        expect(source.count).toBe(0);
    });

    it("is an event emitter of its own, which a listener can be removed from", async () => {
        const { aggregate, source } = joining();
        const listener = vi.fn();
        aggregate.event(listener).remove();

        await aggregate.collectEvents(() => source.emit("a"));

        expect(listener).not.toHaveBeenCalled();
        expect(aggregate.event.name).toBe("joined");
    });
});
