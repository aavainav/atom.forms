import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { PublicContactOrWarningFormFactory } from "./form-factory";
import { PublicContactOrWarningMapper } from "./mapping";
import { CATALOG_IDENTITY, PublicContactOrWarningFormModel } from "./models/public-contact-or-warning-form";
import { PublicContactOrWarningFormSchema } from "./models/public-contact-or-warning-form-schema";
import { IPublicContactOrWarningOptions } from "./options";
import { IPublicContactOrWarningService, PublicContactOrWarningService } from "./services";
import { publicContactOrWarningValueLists } from "./value-lists";

export const IPublicContactOrWarningConfiguration = createConfig<IPublicContactOrWarningConfiguration>();
export interface IPublicContactOrWarningConfiguration {
}

/** Defines the public contact/warning form module. */
export class PublicContactOrWarningModule implements IModule {
    readonly name = "public-contact-or-warning";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IPublicContactOrWarningOptions>(IPublicContactOrWarningOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IPublicContactOrWarningService, PublicContactOrWarningService>(IPublicContactOrWarningService, PublicContactOrWarningService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this record owns go into the shared registry through the same seam a host would use to
        // replace any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of publicContactOrWarningValueLists) {
            valueLists.registerList(definition);
        }

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "sc/432", lazy: () => import("./components").then(module => ({ Component: module.PublicContactOrWarningFormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new PublicContactOrWarningMapper());

        new PublicContactOrWarningFormSchema();

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: PublicContactOrWarningFormModel,
            schema: PublicContactOrWarningFormSchema,
            formFactory: PublicContactOrWarningFormFactory,
            component: () => import("./components").then(module => module.PublicContactOrWarningForm)
        });
    }
}
