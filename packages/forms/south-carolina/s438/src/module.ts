import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { S438FormFactory } from "./form-factory";
import { S438Mapper } from "./mapping";
import { CATALOG_IDENTITY, S438FormModel } from "./models/s438-form";
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
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

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

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            ctor: S438FormModel,
            schema: S438FormSchema,
            formFactory: S438FormFactory,
            component: () => import("./components/").then(module => module.S438CitationForm),
            // the mapper is hand-written by this same package, so it's supplied inline rather than through a
            // separate call - unlike a data reader/writer, which a host attaches later via IFormDataHooks.
            mapper: new S438Mapper(),
            violationListId: S438ViolationListId.violation
        });

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerRoute("report-viewer", { path: "sc/s438", lazy: () => import("./components/").then(module => ({ Component: module.S438CitationFormLoader })) });
    }
}