import { FormCatalogModule } from "@forms/catalog";
import { IFormIdentity } from "@forms/core";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { IPrintProfile } from "./models/print-profile";
import { IPrintingOptions } from "./options";
import { IPrintRegistrationService, IPrintService, PrintService } from "./services";

export const IPrintingConfiguration = createConfig<IPrintingConfiguration>();
export interface IPrintingConfiguration {
    /** Registers the copies the identified form can be printed as, e.g. the copy handed to the violator and the copy filed with the court. */
    registerProfiles: (identity: IFormIdentity, profiles: ReadonlyArray<IPrintProfile>) => void;
}

/**
 * Holds the copies each form publishes; a form registering none still prints, as every page of itself.
 * `PrintOption` isn't registered anywhere -- whoever renders a form mounts it directly, keeping this package
 * below the renderer rather than reaching up into it.
 */
export class PrintingModule implements IModule {
    readonly name = "printing";
    readonly dependencies = [FormCatalogModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IPrintingOptions>(IPrintingOptions);
        init.config(IPrintingConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerProfiles: (identity, profiles) => services.get<IPrintRegistrationService>(IPrintRegistrationService).registerProfiles(identity, profiles)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        const printServiceFactory = new SingletonServiceFactory(PrintService);
        registration.registerSingleton<IPrintService, PrintService>(IPrintService, printServiceFactory);
        registration.registerSingleton<IPrintRegistrationService, PrintService>(IPrintRegistrationService, printServiceFactory);
    }
}
