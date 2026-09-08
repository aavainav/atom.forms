import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { IValueListDefinition } from "./models";
import { IValueListRegistrationService, IValueListService, ValueListService } from "./services";
import { standardValueLists } from "./value-lists";

export const IValueListsConfiguration = createConfig<IValueListsConfiguration>();
export interface IValueListsConfiguration {
    /**
     * Registers a value list. A list registered under an id already in use replaces it, which is how a host serves
     * one of the built-in lists from its own source without this package knowing where it went.
     */
    registerList: (definition: IValueListDefinition) => void;
}

/** Defines the value lists module. This module owns the registry of value lists backing form option fields. */
export class ValueListsModule implements IModule {
    readonly name = "forms-value-lists";

    initialize(init: IModuleInitializer): void {
        init.config(IValueListsConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerList: definition => services.get<IValueListRegistrationService>(IValueListRegistrationService).registerList(definition)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        const valueListServiceFactory = new SingletonServiceFactory(ValueListService);
        registration.registerSingleton<IValueListService, ValueListService>(IValueListService, valueListServiceFactory);
        registration.registerSingleton<IValueListRegistrationService, ValueListService>(IValueListRegistrationService, valueListServiceFactory);
    }

    configure({ services }: IModuleConfigurator): void {
        // the standard lists go in first so a module depending on this one, which configures later, can replace
        // any of them by registering over its id
        const registration = services.get<IValueListRegistrationService>(IValueListRegistrationService);

        for (const definition of standardValueLists) {
            registration.registerList(definition);
        }
    }
}
