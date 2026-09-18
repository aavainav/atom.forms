import { FormCatalogModule } from "@forms/catalog";
import { IFormIdentity } from "@forms/core";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { IViolationBinding, IViolationListDefinition } from "./models";
import { IViolationRegistrationService, IViolationSelectorService, IViolationService, ViolationSelectorService, ViolationService } from "./services";
import { standardViolationLists } from "./violations";

export const IViolationsConfiguration = createConfig<IViolationsConfiguration>();
export interface IViolationsConfiguration {
    /**
     * Registers a violation list. A list registered under an id already in use replaces it, which is how an agency
     * serves its own current code list without this package knowing where it went.
     */
    registerList: (definition: IViolationListDefinition) => void;
    /** Registers how the identified form takes the violations chosen in the selector. */
    registerViolations: (identity: IFormIdentity, binding: IViolationBinding) => void;
}

/**
 * Owns the registry of violations a citation can be written for, and the selector (an option plus the panel it
 * opens) that puts a chosen one onto a form. Which forms get the selector isn't decided here -- a catalog item
 * declares its `violationListId`, and whoever renders the form mounts `ViolationsOption`/`ViolationsPanel`
 * accordingly, keeping this package below the renderer rather than reaching up into it.
 */
export class ViolationsModule implements IModule {
    readonly name = "forms-violations";
    readonly dependencies = [FormCatalogModule];

    initialize(init: IModuleInitializer): void {
        init.config(IViolationsConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerList: definition => services.get<IViolationRegistrationService>(IViolationRegistrationService).registerList(definition),
            registerViolations: (identity, binding) => services.get<IViolationRegistrationService>(IViolationRegistrationService).registerViolations(identity, binding)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IViolationSelectorService, ViolationSelectorService>(IViolationSelectorService, ViolationSelectorService);

        const violationServiceFactory = new SingletonServiceFactory(ViolationService);
        registration.registerSingleton<IViolationService, ViolationService>(IViolationService, violationServiceFactory);
        registration.registerSingleton<IViolationRegistrationService, ViolationService>(IViolationRegistrationService, violationServiceFactory);
    }

    configure({ services }: IModuleConfigurator): void {
        // the bundled lists go in first so a module depending on this one, which configures later, can replace any
        // of them by registering over its id
        const registration = services.get<IViolationRegistrationService>(IViolationRegistrationService);

        for (const definition of standardViolationLists) {
            registration.registerList(definition);
        }
    }
}
