import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { S438FormFactory } from "./form-factory";
import { S438Mapper } from "./mapping";
import { S438FormModel } from "./models/s438-form";
import { S438FormSchema } from "./models/s438-form-schema";
import { IS438CitationOptions } from "./options";
import { IS438CitationService, S438CitationService } from "./services";
import { S438ViolationListId, s438ViolationLists } from "./violations";

export const IS438CitationConfiguration = createConfig<IS438CitationConfiguration>();
export interface IS438CitationConfiguration {
}

/** Defines the s438 citation module. */
export class S438CitationModule implements IModule {
    readonly name = "s438-citation-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IS438CitationOptions>(IS438CitationOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IS438CitationService, S438CitationService>(IS438CitationService, S438CitationService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
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

        // the list this form draws its charges from, and how a chosen violation lands on it. the selector never
        // writes a field itself: the citation names its charge in its own section under its own field names, and a
        // second violation means a second front page, which is the form's business rather than the selector's.
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);

        for (const definition of s438ViolationLists) {
            violations.registerList(definition);
        }

        violations.registerViolations({ name, version }, {
            listId: S438ViolationListId.violation,
            pageName: "front-page",
            apply: (controllers, chosen) => services.get<IS438CitationService>(IS438CitationService).applyViolations(controllers, chosen),
            getApplied: (controllers, all) => services.get<IS438CitationService>(IS438CitationService).getAppliedViolations(controllers, all)
        });

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