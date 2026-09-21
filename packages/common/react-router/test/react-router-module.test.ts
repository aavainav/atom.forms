import { afterEach, describe, expect, it, vi } from "vitest";
import type { IServiceRegistration } from "@shrub/core";
import type { RouteObject } from "react-router";

import { IReactRouterService, ReactRouterModule } from "../src/index";
import type { IReactRouterService as ReactRouterService } from "../src/index";

/** Configures the module against a registration that keeps the service it is given, and hands that service back. */
function configure(): ReactRouterService {
    let service: ReactRouterService | undefined;
    const registration = {
        registerInstance: vi.fn((_token: unknown, instance: ReactRouterService) => { service = instance; })
    } as unknown as IServiceRegistration;

    new ReactRouterModule().configureServices(registration);

    return service!;
}

const home: RouteObject = { id: "home", path: "/" };
const admin: RouteObject = { id: "admin", path: "/admin" };

afterEach(() => {
    window.history.pushState({}, "", "/");
});

describe("ReactRouterModule", () => {
    it("is named for what it does", () => {
        expect(new ReactRouterModule().name).toBe("react-router");
    });

    it("registers the service it provides, under its own token", () => {
        const registerInstance = vi.fn();

        new ReactRouterModule().configureServices({ registerInstance } as unknown as IServiceRegistration);

        expect(registerInstance).toHaveBeenCalledTimes(1);
        expect(registerInstance.mock.calls[0][0]).toBe(IReactRouterService);
    });

    describe("adding a route", () => {
        it("requires the route to have an id, which is what child routes are added to it by", () => {
            expect(() => configure().addRoute({ path: "/" })).toThrow("A route id is required to register the route with the react router module.");
        });

        it("is what the router is created from", () => {
            const service = configure();
            service.addRoute(home);
            service.addRoute(admin);

            service.createRouter();

            expect(service.router.routes.map(route => route.id)).toEqual(["home", "admin"]);
        });

        it("replaces a route added again under the same id", () => {
            const service = configure();
            service.addRoute(home);
            service.addRoute({ id: "home", path: "/start" });

            service.createRouter();

            expect(service.router.routes).toHaveLength(1);
            expect(service.router.routes[0].path).toBe("/start");
        });
    });

    describe("adding a child route", () => {
        it("adds it to the route named, after any it already has", () => {
            const service = configure();
            service.addRoute({ id: "app", path: "/", children: [{ id: "existing", path: "existing" }] });

            service.addChildRoute("app", { id: "added", path: "added" });
            service.createRouter();

            expect(service.router.routes[0].children!.map(route => route.id)).toEqual(["existing", "added"]);
        });

        it("starts the children of a route that had none", () => {
            const service = configure();
            service.addRoute({ id: "app", path: "/" });

            service.addChildRoute("app", { id: "added", path: "added" });
            service.createRouter();

            expect(service.router.routes[0].children!.map(route => route.id)).toEqual(["added"]);
        });

        it("can be done more than once", () => {
            const service = configure();
            service.addRoute({ id: "app", path: "/" });

            service.addChildRoute("app", { id: "first", path: "first" });
            service.addChildRoute("app", { id: "second", path: "second" });
            service.createRouter();

            expect(service.router.routes[0].children!.map(route => route.id)).toEqual(["first", "second"]);
        });

        it("says so when there is no route by that name", () => {
            expect(() => configure().addChildRoute("missing", { id: "added" })).toThrow("No top level route could be found for key: missing in the route collection.");
        });

        it("refuses a route that is an index, which cannot have children", () => {
            const service = configure();
            service.addRoute({ id: "landing", index: true });

            expect(() => service.addChildRoute("landing", { id: "added" })).toThrow("Cannot add a child route to an index route.");
        });

        it("leaves the route it was given untouched", () => {
            const service = configure();
            const app: RouteObject = { id: "app", path: "/" };
            service.addRoute(app);

            service.addChildRoute("app", { id: "added", path: "added" });

            expect(app.children).toBeUndefined();
        });
    });

    describe("creating the router", () => {
        it("refuses when there are no routes to create it from", () => {
            expect(() => configure().createRouter()).toThrow("The routes collection cannot be empty before calling createRouter().");
        });

        it("has no router until it is created", () => {
            expect(configure().router).toBeUndefined();
        });

        it("makes a router that routes the current location", () => {
            window.history.pushState({}, "", "/admin");
            const service = configure();
            service.addRoute(home);
            service.addRoute(admin);

            service.createRouter();

            expect(service.router.state.location.pathname).toBe("/admin");
            expect(service.router.state.matches.map(match => match.route.id)).toEqual(["admin"]);
        });

        it("makes the router the one the service then gives", () => {
            const service = configure();
            service.addRoute(home);

            service.createRouter();
            const router = service.router;

            expect(router).toBeDefined();
            expect(service.router).toBe(router);
        });
    });
});
