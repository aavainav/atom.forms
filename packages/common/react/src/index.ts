import React, { createContext, useContext } from "react";
import { createRoot, Root } from "react-dom/client";
import { createConfig, createService, IModule, IModuleConfigurator, IModuleInitializer, IService, IServiceCollection, IServiceRegistration } from "@shrub/core";

export const IReactRootService = createService<IReactRootService>("react-root-service");
export const IReactConfiguration = createConfig<IReactConfiguration>();

/** Defines configuration for the react module. */
export interface IReactConfiguration {
    /** Allows configuring the root object of the app before rendering. */
    configure(callback: (root: Root) => void): void;
    /** Renders the provided component at the root of the react app. */
    render(node: React.ReactNode): void;
}

/** Defines the service for the react module. */
export interface IReactRootService {
    /** The react root object for the current application. */
    readonly root: Root;
}

// Create the context with an undefined default value
export const ServicesContext = createContext<IServiceCollection | undefined>(undefined);

/** Uses the current react app context to get a list of services. */
export function useServices(): IServiceCollection {
    const context = useContext<IServiceCollection | undefined>(ServicesContext);

    if (!context) {
        throw new Error('useServices must be used within a ServicesProvider');
    }

    return context;
}

/** Uses the current react app context to get a service from the service collection. */
export function useService<T>(service: IService<T>): T {
    const context = useContext<IServiceCollection | undefined>(ServicesContext);

    if (!context) {
        throw new Error('useService must be used within a ServicesProvider');
    }

    return context.get<T>(service);
}

export class ReactModule implements IModule {
    private root?: Root;
    private app?: React.ReactNode;

    readonly name = "react";

    initialize({ config }: IModuleInitializer): void {
        config(IReactConfiguration).register(() => ({
            configure: callback => callback(this.root!),
            render: app => {
                if (this.app) {
                    throw new Error("A root app has already been rendered.");
                }
                this.app = app;
            }
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        const self = this;
        registration.registerInstance(IReactRootService, { 
            get root() {
                return self.root!;
            }
        });
    }

    async configure({ next }: IModuleConfigurator): Promise<void> {
        if (!document.getElementById("root")) {
            throw new Error(`An element with the id of 'root' must be defined in order for the react app to render.`)
        }

        // Create the root object for the react app.
        this.root = createRoot(document.getElementById("root")!);

        // Allow dependancies to configure the root app before rendering.
        await next();

        this.root.render(this.app ?? null);
    }
}