import { createBrowserRouter, RouteObject } from "react-router";
import { createService, IModule, IServiceRegistration } from "@shrub/core";

// The only way I could get the types to not error was to get the Browser Router type this way.
export type BrowserRouterType = ReturnType<typeof createBrowserRouter>;

export const IReactRouterService = createService<IReactRouterService>("react-router-service");

export interface IReactRouterService {
    /** The router instance used for routing in the react app. */
    readonly router: BrowserRouterType;
    /** Adds the specified route to the router. */
    addRoute(route: RouteObject): void;
    /** Adds a child route to the specified route parent. The name should match the RouteObject.id property. The addRoute function will make the id required. */
    addChildRoute(name: string, child: RouteObject): void;
    /** The creation of the react router. */
    createRouter(): void;
}

/** Defines the react router module, used for collecting and creating the router instance for a react app. */
export class ReactRouterModule implements IModule {
    private router?: BrowserRouterType;
    private routes?: Map<string, RouteObject> = new Map<string, RouteObject>();
    
    readonly name = "react-router";

    configureServices(registration: IServiceRegistration): void {
        const self = this;
        registration.registerInstance(IReactRouterService, {
            get router(): BrowserRouterType {
                return self.router!;
            },
            addRoute: route => {
                if (this.routes) {
                    if (!route.id) {
                        throw new Error("A route id is required to register the route with the react router module.")
                    }

                    this.routes.set(route.id, route);
                }
            },
            addChildRoute: (name, child) => {
                if (this.routes) {
                    const route = this.routes.get(name);
                    if (!route) throw new Error(`No top level route could be found for key: ${name} in the route collection.`);

                    if (route.index) {
                        throw new Error(`Cannot add a child route to an index route.`);
                    }

                    const updatedRoute: RouteObject = {
                        ...route,
                        children: [...(route.children ?? []), child]
                    };

                    this.routes.set(name, updatedRoute);
                }
            },
            createRouter: () => this.createRouter()
        });
    }

    private createRouter(): BrowserRouterType {
        if (this.routes && this.routes.size === 0) {
            throw new Error("The routes collection cannot be empty before calling createRouter().")
        }

        this.router = createBrowserRouter(Array.from(this.routes!.values()));
        return this.router;
    }
}