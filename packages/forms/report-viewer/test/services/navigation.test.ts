import { beforeEach, describe, expect, it, vi } from "vitest";

import type { IReactRouterService } from "@common/react-router";
import type { IReportViewerRoute } from "../../src/services/navigation";
import { NavigationService } from "../../src/services/navigation";

/** The service reaches the router service for exactly four things, so a stub carrying those is enough. */
function routerService() {
    return {
        router: {
            navigate: vi.fn(),
            state: { location: { pathname: "/reports", search: "", hash: "", state: null, key: "one" } }
        },
        addRoute: vi.fn(),
        addChildRoute: vi.fn()
    } as unknown as IReactRouterService & {
        router: { navigate: ReturnType<typeof vi.fn> };
        addRoute: ReturnType<typeof vi.fn>;
        addChildRoute: ReturnType<typeof vi.fn>;
    };
}

function route(overrides: Partial<IReportViewerRoute> = {}): IReportViewerRoute {
    return { lazy: () => Promise.resolve({} as never), ...overrides };
}

describe("NavigationService", () => {
    let router: ReturnType<typeof routerService>;
    let service: NavigationService;

    beforeEach(() => {
        router = routerService();
        service = new NavigationService(router);
    });

    describe("currentLocation", () => {
        it("reads the location off the router", () => {
            expect(service.currentLocation.pathname).toBe("/reports");
        });
    });

    describe("navigateTo", () => {
        it("passes a string path straight through", () => {
            service.navigateTo("/reports/1");

            expect(router.router.navigate).toHaveBeenCalledWith("/reports/1", undefined);
        });

        it("carries the options through", () => {
            service.navigateTo("/reports/1", { replace: true });

            expect(router.router.navigate).toHaveBeenCalledWith("/reports/1", { replace: true });
        });

        it("maps a link's path and hash onto the router's own shape", () => {
            service.navigateTo({ path: "/reports/1", hash: "#violations" });

            expect(router.router.navigate).toHaveBeenCalledWith(
                { pathname: "/reports/1", hash: "#violations", search: undefined },
                undefined);
        });

        /**
         * Characterization worth pinning: `IReportViewerNavigationLink` declares a `query`, but the mapping sets
         * `search` to undefined and never reads it -- so query arguments given as a link are dropped.
         */
        it("drops a link's query rather than turning it into a search string", () => {
            service.navigateTo({ path: "/reports", query: { status: "draft" } });

            expect(router.router.navigate).toHaveBeenCalledWith(
                { pathname: "/reports", hash: undefined, search: undefined },
                undefined);
        });
    });

    describe("registerRoute", () => {
        it("passes a route carrying a path to the router service", () => {
            const registered = route({ path: "reports" });

            service.registerRoute(registered);

            expect(router.addRoute).toHaveBeenCalledWith(registered);
        });

        it("accepts an index route, which carries no path of its own", () => {
            const registered = route({ index: true });

            service.registerRoute(registered);

            expect(router.addRoute).toHaveBeenCalledWith(registered);
        });

        /** Both are optional on the type, but a route with neither could never match. */
        it("refuses a route that is neither an index nor carries a path", () => {
            expect(() => service.registerRoute(route()))
                .toThrowError("A route index or path is required for registering a route.");

            expect(router.addRoute).not.toHaveBeenCalled();
        });
    });

    describe("registerChildRoute", () => {
        it("passes a child route to the router service under its parent's name", () => {
            const registered = route({ path: "edit" });

            service.registerChildRoute("reports", registered);

            expect(router.addChildRoute).toHaveBeenCalledWith("reports", registered);
        });

        it("refuses a child route that is neither an index nor carries a path", () => {
            expect(() => service.registerChildRoute("reports", route()))
                .toThrowError("A route index or path is required for registering a route.");

            expect(router.addChildRoute).not.toHaveBeenCalled();
        });
    });
});
