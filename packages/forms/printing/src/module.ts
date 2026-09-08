import { FormCatalogModule } from "@forms/catalog";
import { IFormIdentity } from "@forms/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { PrintOption } from "./components";
import { IPrintProfile } from "./models/print-profile";
import { IPrintingOptions } from "./options";
import { IPrintRegistrationService, IPrintService, PrintService } from "./services";

/** Where the print option sits in the report viewer's options bar, between save and the day/night toggle. */
const printOptionOrder = 300;

export const IPrintingConfiguration = createConfig<IPrintingConfiguration>();
export interface IPrintingConfiguration {
    /** Registers the copies the identified form can be printed as, e.g. the copy handed to the violator and the copy filed with the court. */
    registerProfiles: (identity: IFormIdentity, profiles: ReadonlyArray<IPrintProfile>) => void;
}

/**
 * Defines the printing module. It adds the print option to the report viewer and holds the copies each form
 * publishes; a form that registers none still prints, as every page of itself.
 */
export class PrintingModule implements IModule {
    readonly name = "printing";
    readonly dependencies = [ReportViewerModule, FormCatalogModule];

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

    configure({ config }: IModuleConfigurator): void {
        // the report viewer owns its options bar but not what a package puts in it, so the button is registered
        // rather than the report viewer being made to know about printing
        config.get<IReportViewerConfiguration>(IReportViewerConfiguration).registerOption({
            id: "print",
            order: printOptionOrder,
            Component: PrintOption
        });
    }
}
