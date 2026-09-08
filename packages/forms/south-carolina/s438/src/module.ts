import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { S438FormFactory } from "./form-factory";
import { S438Mapper } from "./mapping";
import { S438FormModel } from "./models/s438-form";
import { S438FormSchema } from "./models/s438-form-schema";
import { IS438CitationOptions } from "./options";
import { IS438CitationService, S438CitationService } from "./services";

export const IS438CitationConfiguration = createConfig<IS438CitationConfiguration>();
export interface IS438CitationConfiguration {
}

/** Defines the s438 citation module. */
export class S438CitationModule implements IModule {
    readonly name = "s438-citation-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IS438CitationOptions>(IS438CitationOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IS438CitationService, S438CitationService>(IS438CitationService, S438CitationService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const name = "S438 Citation Form";
        const description = "The south carolina S438 UTT citation form.";
        const version = "1.0";

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "sc/s438", lazy: () => import("./components/").then(module => ({ Component: module.S438CitationFormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new S438Mapper());

        new S438FormSchema();

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: S438FormModel,
            schema: S438FormSchema,
            formFactory: S438FormFactory,
            component: () => import("./components/").then(module => module.S438CitationForm)
        });
    }
}