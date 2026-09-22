# `@common/event-emitter`

The typed pub/sub primitive every form package builds its services and controllers' events on: `EventEmitter<TArgs>`
(the write side) and the `IEvent<TArgs>` handle it hands out (the read side a service exposes instead of the
emitter itself). One file. Not a shrub module — plain TypeScript with no runtime dependencies of its own.

Module dependencies: none. Package dependencies: none.

## Exports

| Export | What it is |
| --- | --- |
| `EventEmitter<TArgs = void>` | `new EventEmitter(name?, options?)`. `.event` is the `IEvent` to hand out, `.emit(args)` awaits every listener, `.count` is how many are subscribed. `callbackRegistered`/`callbackUnregistered` are protected no-ops a subclass can override to hear about every subscribe/unsubscribe. |
| `IEvent<TArgs>` | The read-only handle: callable to subscribe (`event(cb)`), plus `.name`, `.on` (identical to calling it directly), `.once`, and the operators below. |
| `IEventListener` | `{ remove(): void }` — what subscribing, `.once`, and `.forward` all return. |
| `IEventSubscription<TArgs>` | The callable shape `IEvent` and `.on` share: `(callback) => IEventListener`. |
| `IEventEmitterOptions` | `onFirstListenerAdd` / `onLastListenerRemove`, passed to `new EventEmitter(...)` — hooks for lazily wiring up (and tearing down) a source only while someone is actually listening. `.debounce` is built on this. |
| `EventCallback<TArgs>` | `(args: TArgs) => void \| Promise<void> \| any` — the callback shape. |
| `AggregateEventEmitter<TArgs>` | An `EventEmitter` that wraps one or more other events and re-emits once per `collectEvents(action)`, carrying whatever `action` caused them to fire, merged into a single result. |

## How it works

- An `IEvent` is a plain function (the subscribe callback) with `eventProto` set as its prototype via
  `Object.setPrototypeOf`, which is why it is both callable *and* has `.on`/`.once`/the operators — `event(cb)` and
  `event.on(cb)` are the same call.
- **`.once` removes the listener before invoking the callback**, not after, specifically so an asynchronous callback
  that is still running when a second emission lands cannot be invoked a second time for it.
- **Derived events keep the source's name.** `.map`, `.filter`, `.split`, `.debounce` all name the returned event
  after the one they were called on; `.aggregate` joins both names with `+` (`"first+second"`). A bare
  `new EventEmitter()` with no name is `"emitter"`.
- **`.debounce(delay, reduce?)` only subscribes to its source while it has a listener of its own**, via
  `onFirstListenerAdd`/`onLastListenerRemove` on the emitter it builds internally — so a debounced event nobody is
  listening to does no work. Without `reduce`, each new emission simply replaces the pending value; with it, the
  pending value is threaded through `reduce(pending, next)` until the timer fires, then the accumulator resets.
- **`emit` snapshots its listeners before calling any of them** (`[...this.callbacks]`), so a listener added or
  removed during an emission does not affect that emission — an added one is not called until the next `emit`, a
  removed one that was already in the snapshot still is.
- **A synchronous throw inside a listener aborts the whole `emit` and skips every listener after it** — the
  `forEach` loop has nothing to catch it, so it propagates out of the (`async`) `emit` as a rejection of just that
  one error. A listener that is itself `async` and throws instead produces a *rejected promise*, which `emit`
  collects rather than propagates immediately, so every other listener still runs; `emit` then rejects with the
  **array** of every such error once they have all settled. Whether a failing listener stops its neighbours or not
  therefore depends on whether it is declared `async`, even though both "throw" from the caller's point of view.

## Gotchas

- **`AggregateEventEmitter.wrap`'s `initializeResult` is only called for whichever wrapped source fires *first* in
  a given `collectEvents`**, because `captured` (the flag that decides whether to seed the result) is one counter
  shared by every source wrapped on the same aggregate, not one per source. Wrapping two sources with different
  initializers and expecting each to seed its own contribution will only ever run the initializer of whichever one
  happens to fire first that round.
- **`remove()` on an `AggregateEventEmitter` un-wraps every source it holds** (`IEventListener` on the class itself
  is this), it does not remove a single wrapped source — there is no way to unwrap just one.

## Tests

`yarn test` runs under `node` (nothing here touches the DOM), on `pool: "vmThreads"` per the base config described
in [../../forms/CLAUDE.md](../../forms/CLAUDE.md). Three files: `event-emitter.test.ts` covers subscribing, removal,
first/last-listener hooks, and emission ordering/error behaviour; `event-operators.test.ts` covers `once`,
`aggregate`, `debounce`, `filter`, `map`, `split`, `forward`; `aggregate-event-emitter.test.ts` covers
`AggregateEventEmitter`.
