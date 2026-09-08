import type { BaseRouteObject, LazyRouteFunction, LoaderFunction } from "react-router";
import { Location, To } from "react-router";
import { BrowserRouterType, IReactRouterService } from "@common/react-router";
import { createService, Singleton } from "@shrub/core";


export const INavigationService = createService<INavigationService>("report-viewer-navigation-service");
export const INavigationRegistrationService = createService<INavigationRegistrationService>("report-viewer-navigation-registration-service");

/** Defines the report viewer navigation services used for routing. */
export interface INavigationService {
    /** Gets the current route location for the report viewer. */
    readonly currentLocation: Location;
    /** Gets the current instance of the route for the report viewer. */
    readonly router: BrowserRouterType;
    /** Programmatically navigate to the desired path. */
    navigateTo(link: string | IReportViewerNavigationLink, options?: IReportViewerNavigationLinkOptions): void;
}

interface IReportViewerNavigationLinkOptions {
    /** An optional indicator to replace the current entry in the history stack for the report viewer link. */
    readonly replace?: boolean;
}

/** Defines the report viewer navigation route registration. */
export interface INavigationRegistrationService {
    /** Registers a route with the react module. This is mainly used for top level routes. If a route is a child, use `registerChildRoute()`. */
    registerRoute(route: IReportViewerRoute): void;
    /** Registers a child route for the provided name. The name should match the id for the top level route. */
    registerChildRoute(name: string, route: IReportViewerRoute): void;
}

/** The route object that is used for registering routes with report viewer. */
export interface IReportViewerRoute {
    /** An optional id for the route. */
    readonly id?: string;
    /** A route path. */
    readonly path?: string;
    /** Whether this is an index route. */
    readonly index?: boolean;
    /** The router loader. */
    readonly loader?: LoaderFunction | boolean;
    /** 
     * A function that returns a promise that resolves to the route object.
     * Used for code-splitting routes.
     */
    readonly lazy: LazyRouteFunction<BaseRouteObject>;
}

export interface IReportViewerNavigationLink {
    /** The navigate path name, beginning with `/`. */
    readonly path: string;
    /** The navigation fragment identifier, beginning with #. */
    readonly hash?: string;
    /** Represents url query string arguments. */
    readonly query?: { [key: string]: string | string[] };
}

@Singleton
export class NavigationService implements INavigationService, INavigationRegistrationService {
    constructor(
        @IReactRouterService private readonly routerService: IReactRouterService) {
    }

    get currentLocation(): Location {
        return this.routerService.router.state.location;
    }

    get router(): BrowserRouterType {
        return this.routerService.router;
    }

    navigateTo(link: string | IReportViewerNavigationLink, options?: IReportViewerNavigationLinkOptions): void {
        this.router.navigate(typeof link === "string" ? link : this.asNavigationTo(link), options);
    }

    registerRoute(route: IReportViewerRoute): void {
        this.validateRoute(route);

        this.routerService.addRoute(route);
    }

    registerChildRoute(name: string, route: IReportViewerRoute): void {
        this.validateRoute(route);

        this.routerService.addChildRoute(name, route);
    }

    private asNavigationTo(link: IReportViewerNavigationLink): To {
        return {
            pathname: link.path,
            hash: link.hash,
            search: undefined
        }
    }

    private validateRoute(route: IReportViewerRoute): void {
        // These properties need to be optional but we need at least one to be populated for the route to work properly.
        if (!route.index && !route.path) {
            throw new Error("A route index or path is required for registering a route.");
        }
    }
}