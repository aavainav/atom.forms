import { act, createElement } from "react";
import type { Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IReactConfiguration, IReactRootService, ReactModule } from "../src/index";
import type { IReactConfiguration as ReactConfiguration, IReactRootService as ReactRootService } from "../src/index";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

/** Initializes the module against a config that keeps the factory it registers, and gives back the configuration it makes. */
function initialize(module: ReactModule) {
    let factory: (() => ReactConfiguration) | undefined;
    const config = vi.fn((_token: unknown) => ({ register: (make: () => ReactConfiguration) => { factory = make; } }));

    module.initialize({ config } as unknown as IModuleInitializer);

    return { config, configuration: factory!() };
}

/** Registers the module's services against a registration that keeps the root service it is given. */
function registerServices(module: ReactModule) {
    const registerInstance = vi.fn();

    module.configureServices({ registerInstance } as unknown as IServiceRegistration);

    return { registerInstance, rootService: registerInstance.mock.calls[0][1] as ReactRootService };
}

function addRootElement(): HTMLElement {
    const element = document.createElement("div");
    element.id = "root";
    document.body.append(element);

    return element;
}

/** Runs the module's configure step, with what its dependencies configure done through `next`. */
async function configure(module: ReactModule, next: () => Promise<void> = async () => undefined): Promise<void> {
    await act(async () => { await module.configure({ next } as unknown as IModuleConfigurator); });
}

afterEach(() => {
    document.body.innerHTML = "";
});

describe("ReactModule", () => {
    it("is named for what it does", () => {
        expect(new ReactModule().name).toBe("react");
    });

    describe("initializing", () => {
        it("registers its configuration under the configuration's own token", () => {
            const { config } = initialize(new ReactModule());

            expect(config).toHaveBeenCalledWith(IReactConfiguration);
        });

        it("makes a configuration that takes the app to render", () => {
            expect(initialize(new ReactModule()).configuration.render).toBeTypeOf("function");
        });

        it("refuses a second app, since there is only one root to render into", () => {
            const { configuration } = initialize(new ReactModule());

            configuration.render(createElement("p", undefined, "First"));

            expect(() => configuration.render(createElement("p", undefined, "Second"))).toThrow("A root app has already been rendered.");
        });
    });

    describe("registering its services", () => {
        it("registers the root service, under its own token", () => {
            const { registerInstance } = registerServices(new ReactModule());

            expect(registerInstance).toHaveBeenCalledTimes(1);
            expect(registerInstance.mock.calls[0][0]).toBe(IReactRootService);
        });

        it("has no root to give until the module has been configured", () => {
            expect(registerServices(new ReactModule()).rootService.root).toBeUndefined();
        });
    });

    describe("configuring", () => {
        it("refuses when the page has nowhere to render the app", async () => {
            await expect(new ReactModule().configure({ next: async () => undefined } as unknown as IModuleConfigurator))
                .rejects.toThrow("An element with the id of 'root' must be defined in order for the react app to render.");
        });

        it("renders the app it was given into the root element", async () => {
            const root = addRootElement();
            const module = new ReactModule();
            const { configuration } = initialize(module);
            configuration.render(createElement("p", { id: "app" }, "Hello"));

            await configure(module);

            expect(root.querySelector("#app")!.textContent).toBe("Hello");
        });

        it("renders nothing when it was given no app", async () => {
            const root = addRootElement();

            await configure(new ReactModule());

            expect(root.innerHTML).toBe("");
        });

        it("lets what it depends on configure the root before anything is rendered", async () => {
            const root = addRootElement();
            const module = new ReactModule();
            const { configuration } = initialize(module);
            configuration.render(createElement("p", { id: "app" }, "Hello"));
            let configured: Root | undefined;
            let renderedWhenConfigured: boolean | undefined;

            await configure(module, async () => {
                configuration.configure(given => { configured = given; });
                renderedWhenConfigured = root.querySelector("#app") !== null;
            });

            expect(configured).toBeDefined();
            expect(renderedWhenConfigured).toBe(false);
            expect(root.querySelector("#app")).not.toBeNull();
        });

        it("gives the root it made to the root service", async () => {
            addRootElement();
            const module = new ReactModule();
            const { rootService } = registerServices(module);
            const { configuration } = initialize(module);
            let configured: Root | undefined;

            await configure(module, async () => { configuration.configure(given => { configured = given; }); });

            expect(rootService.root).toBe(configured);
        });
    });
});
