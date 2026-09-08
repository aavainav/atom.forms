import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { GAUTCFormFactory } from "./form-factory";
import { GAUTCMapper } from "./mapping";
import { GAUTCFormModel } from "./models/utc-form";
import { GAUTCFormSchema } from "./models/utc-form-schema";
import { IGAUTCOptions } from "./options";
import { IGAUTCService, GAUTCService } from "./services";
import { gaUtcValueLists } from "./value-lists";

export const IGAUTCConfiguration = createConfig<IGAUTCConfiguration>();
export interface IGAUTCConfiguration {
}

/** Defines the Georgia uniform traffic citation module. */
export class GAUTCModule implements IModule {
    readonly name = "ga-utc-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IGAUTCOptions>(IGAUTCOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IGAUTCService, GAUTCService>(IGAUTCService, GAUTCService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const name = "GA Uniform Traffic Citation";
        const description = "Georgia uniform traffic citation, summons, and accusation as issued by the City of Atlanta Department of Police - the face of the citation the officer serves, and the reverse of the court's copy the clerk and judge complete.";
        const version = "1.0";

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of gaUtcValueLists) {
            valueLists.registerList(definition);
        }

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "ga/utc", lazy: () => import("./components").then(module => ({ Component: module.GAUTCFormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new GAUTCMapper());

        new GAUTCFormSchema();

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: GAUTCFormModel,
            schema: GAUTCFormSchema,
            formFactory: GAUTCFormFactory,
            component: () => import("./components").then(module => module.GAUTCForm)
        });
    }
}
