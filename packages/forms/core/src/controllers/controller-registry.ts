import type { ControllerConstructor } from "./controller";

/** Options for registering a controller. */
export interface IRegisterControllerOptions {
    /**
     * Whether a manager creates the controller when a form is loaded, rather than the first time it is asked for.
     * For a controller that observes the others, which would otherwise miss everything that happened before it was
     * first requested. The default is false.
     */
    readonly eager?: boolean;
}

/** Describes a registered controller type. Only descriptors are registered; the controllers themselves are created by each manager. */
export interface IControllerRegistration {
    /** The class a manager constructs. */
    readonly ctor: ControllerConstructor;
    /** Whether a manager creates the controller when a form is loaded rather than when it is first asked for. */
    readonly eager: boolean;
    /** The key the controller is registered under. */
    readonly key: string;
}

/** Holds a descriptor for every controller type that has been registered, for a manager to create controllers from. */
export class ControllerRegistry {
    private static readonly registrations: Map<string, IControllerRegistration> = new Map<string, IControllerRegistration>();

    /** Gets the registration for the key, if there is one. */
    public static get(key: string): IControllerRegistration | undefined {
        return ControllerRegistry.registrations.get(key);
    }

    /** Gets the registrations a manager creates when a form is loaded. */
    public static getEager(): Array<IControllerRegistration> {
        return [...ControllerRegistry.registrations.values()].filter(registration => registration.eager);
    }

    /** Registers the class under the key, throwing if a different controller already holds it. */
    public static register(key: string, ctor: ControllerConstructor, options: IRegisterControllerOptions = {}): void {
        const existing = ControllerRegistry.registrations.get(key);

        // a hot reload evaluates a controller's module a second time, handing over a new class of the same name for the
        // key it already holds; only a controller of a different name is a genuine clash
        if (existing && existing.ctor !== ctor && existing.ctor.name !== ctor.name) {
            throw new Error(`A controller is already registered under the key '${key}' (${existing.ctor.name}), so ${ctor.name} cannot be registered under it as well.`);
        }

        ControllerRegistry.registrations.set(key, { ctor, eager: options.eager ?? false, key });
    }
}

/**
 * Registers a controller class under `key`, for a controller manager to create when the controller is asked for by that
 * key. The class must extend `Controller`, and its constructor is called with the manager and nothing else.
 *
 * Registration happens when the class's module is first loaded, so a controller only exists for managers created after
 * something has imported it.
 */
export function RegisterController(key: string, options?: IRegisterControllerOptions) {
    return function <T extends ControllerConstructor>(target: T): void {
        ControllerRegistry.register(key, target, options);

        // defined on the class itself, which is what `Controller` checks, so a subclass never inherits its parent's key
        Object.defineProperty(target, "key", { value: key });
    };
}
