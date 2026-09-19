import { EventEmitter, IEvent } from "@common/event-emitter";

import type { IControllerManager } from "./controller-manager";

/** The keys identifying the controllers this package registers; a controller from another package brings a key of its own. */
export const ControllerKey = {
    dragAndDrop: "drag-and-drop",
    form: "form",
    navigation: "navigation",
    print: "print",
    rules: "rules"
} as const;

/** Defines a controller owned by a controller manager. */
export interface IController {
    /** The key the controller is registered under. */
    readonly key: string;
    /** An event that is raised when the controller's state changes. */
    readonly onChanged: IEvent<void>;

    /** Releases any resources held by the controller. */
    dispose(): void;
}

/** A controller class as a manager constructs it: with the manager itself and nothing else. */
export type ControllerConstructor = new (manager: IControllerManager) => Controller;

/**
 * The base of every controller a manager owns. A controller gets its key from `@RegisterController`, which is the
 * only way it gets one, and the manager constructs it with itself as the sole argument -- a controller that needs
 * another asks the manager for it rather than being handed it, so every controller has the same shape.
 *
 * A constructor should do no work that reads another controller, because the manager cannot yet be asked for it.
 * That belongs in `start`.
 */
export abstract class Controller implements IController {
    /** The key the class was registered under. Defined on the class itself by `RegisterController`, so a subclass never inherits its parent's. */
    declare static readonly key: string;

    private readonly _changed: EventEmitter<void>;

    readonly key: string;

    constructor(protected readonly manager: IControllerManager) {
        const ctor = new.target;

        if (!Object.prototype.hasOwnProperty.call(ctor, "key")) {
            throw new Error(`${ctor.name} has no key; register it with @RegisterController before a manager creates it.`);
        }

        this.key = ctor.key;
        this._changed = new EventEmitter<void>(`${this.key}:changed`);
    }

    get onChanged(): IEvent<void> {
        return this._changed.event;
    }

    public dispose(): void {
    }

    /**
     * Called once by the manager straight after it creates the controller, when every other controller can be
     * reached through it. Override to begin observing them. An eager controller starts while a form is being loaded,
     * which happens during render, so this should observe rather than raise changes of its own.
     */
    public start(): void {
    }

    /** Raises `onChanged`. */
    protected emitChanged(): void {
        this._changed.emit();
    }
}
