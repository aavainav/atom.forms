import { createElement, StrictMode } from "react";
import { RouterProvider, RouteObject } from "react-router";

import { IReactConfiguration, ReactModule, ServicesContext } from "@common/react";
import { IReactRouterService, ReactRouterModule } from "@common/react-router";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer } from "@shrub/core";

/** The id of the app's root route. A host registers its own routes as children of this one. */
export const appRouteId = "app";

export const IWorkbenchConfiguration = createConfig<IWorkbenchConfiguration>();
export interface IWorkbenchConfiguration {
    /** Registers a route as a child of the app's root route, which is what every route in the app is. */
    registerRoute: (route: RouteObject) => void;
}

/**
 * Hosts a forms app as a standalone application, owning the react root, the router, and the two routes every app
 * has: the root layout everything else hangs off, and the catch-all for a path nothing matched.
 *
 * The routes live here rather than with the report viewer because routing is the host's concern -- the viewer is a
 * component a route renders, and says nothing about where it is mounted. `@common/react-router` refuses to create a
 * router from an empty route map, so somebody has to register the root, and the package that creates the router is
 * the honest place for it.
 */
export class WorkbenchModule implements IModule {
    readonly name = "forms-workbench";
    readonly dependencies = [
        ReactModule,
        ReactRouterModule
    ];

    initialize(init: IModuleInitializer): void {
        init.config(IWorkbenchConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerRoute: route => services.get<IReactRouterService>(IReactRouterService).addChildRoute(appRouteId, route)
        }));
    }

    async configure({ config, services, next }: IModuleConfigurator): Promise<void> {
        const routerService = services.get<IReactRouterService>(IReactRouterService);

        // the root route goes in before next(), so a module configuring after this one has something to register
        // its own routes against. nothing is registered as the index here -- the root belongs to the host.
        routerService.addRoute({
            id: appRouteId,
            path: "/",
            lazy: () => import("./components").then(module => ({ Component: module.AppLayout }))
        });

        routerService.addRoute({
            id: "not-found",
            path: "*",
            lazy: () => import("./components").then(module => ({ Component: module.NotFound }))
        });

        // allow any registered modules the ability to register their routes before attempting to render.
        await next();

        // We want to create the router instance after modules have had time to register their routes.
        // This is because when initializing the react router, the router expects a non-empty array of routes, so we can't
        // just initialize a router object with an empty array and then patch them. We will just gather all the routes first
        // and then set them during creation.
        routerService.createRouter();

        // Programmatically wrap the app component with the following two elements:
        // 1. <ServicesContext.Provider> - This context allows for the services to be injected into the app.
        // 2. <RouterProvider> - The router needs to wrap the app, but also be a child of <ServicesContext.Provider>. It needs to be a child of
        // <ServicesContext.Provider> so that services can be used with routing as well.
        const router = createElement(RouterProvider, { router: routerService.router });
        const servicesProvider = createElement(ServicesContext.Provider, { value: services }, router);
        const app = createElement(StrictMode, undefined, servicesProvider);

        config.get<IReactConfiguration>(IReactConfiguration).render(app);
    }
}
