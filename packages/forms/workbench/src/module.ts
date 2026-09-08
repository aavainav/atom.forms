import { createElement, StrictMode } from "react";
import { RouterProvider } from "react-router";

import { IReactConfiguration, ReactModule, ServicesContext } from "@common/react";
import { IReactRouterService, ReactRouterModule } from "@common/react-router";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModule, IModuleConfigurator } from "@shrub/core";

/** Hosts the report viewer as a standalone app, owning the react root and router that the report viewer itself no longer owns. */
export class WorkbenchModule implements IModule {
    readonly name = "forms-workbench";
    readonly dependencies = [
        ReactModule,
        ReactRouterModule,
        ReportViewerModule
    ];

    async configure({ config, services, next }: IModuleConfigurator): Promise<void> {
        const routerService = services.get<IReactRouterService>(IReactRouterService);

        // allow the report viewer and any registered form packages the ability to register their routes before attempting to render.
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
