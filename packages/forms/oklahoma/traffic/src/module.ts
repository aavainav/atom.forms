import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IPrintingConfiguration, PrintingModule } from "@forms/printing";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { OKTrafficFormFactory } from "./form-factory";
import { OKTrafficMapper } from "./mapping";
import { CATALOG_IDENTITY, OKTrafficFormModel } from "./models/traffic-form";
import { OKTrafficFormSchema } from "./models/traffic-form-schema";
import { IOKTrafficOptions } from "./options";
import { IOKTrafficService, OKTrafficService } from "./services";
import { okTrafficValueLists } from "./value-lists";
import { OKTrafficViolationListId, okTrafficViolationLists } from "./violations";

export const IOKTrafficConfiguration = createConfig<IOKTrafficConfiguration>();
export interface IOKTrafficConfiguration {
}

/** Defines the Oklahoma City traffic citation module. */
export class OKTrafficModule implements IModule {
    readonly name = "ok-traffic-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, PrintingModule, ValueListsModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IOKTrafficOptions>(IOKTrafficOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IOKTrafficService, OKTrafficService>(IOKTrafficService, OKTrafficService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okTrafficValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        // the citation is a multi-part set on paper, and which pages a part carries depends on who receives it:
        // the violator is handed the complaint and the warrant, the court is filed the complaint and the supplement
        const printing = config.get<IPrintingConfiguration>(IPrintingConfiguration);
        printing.registerProfiles({ name, version }, [
            {
                id: "violator",
                name: "Violator copy",
                description: "The complaint and the warrant page, handed to the person cited.",
                layout: "side-by-side",
                pages: ["complaint-page", "warrant-page"]
            },
            {
                id: "court",
                name: "Court copy",
                description: "The complaint and the supplement, filed with the municipal court.",
                layout: "top-down",
                pages: ["complaint-page", "supplement-page"]
            }
        ]);

        new OKTrafficFormSchema();

        // the list this form draws its charges from, and how a chosen violation lands on it; the codes go in the
        // violation block and the description and fine into the offense block beneath it
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);

        for (const definition of okTrafficViolationLists) {
            violations.registerList(definition);
        }

        violations.registerViolations({ name, version }, {
            listId: OKTrafficViolationListId.violation,
            pageName: "complaint-page",
            apply: (controllers, chosen) => services.get<IOKTrafficService>(IOKTrafficService).applyViolations(controllers, chosen),
            getApplied: (controllers, all) => services.get<IOKTrafficService>(IOKTrafficService).getAppliedViolations(controllers, all)
        });

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            ctor: OKTrafficFormModel,
            schema: OKTrafficFormSchema,
            formFactory: OKTrafficFormFactory,
            component: () => import("./components").then(module => module.OKTrafficForm),
            // the mapper is hand-written by this same package, so it's supplied inline rather than through a
            // separate call - unlike a data reader/writer, which a host attaches later via IFormDataHooks.
            mapper: new OKTrafficMapper(),
            valueListIds: okTrafficValueLists.map(definition => definition.id),
            violationListId: OKTrafficViolationListId.violation
        });

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerRoute("report-viewer", { path: "ok/traffic", lazy: () => import("./components").then(module => ({ Component: module.OKTrafficFormLoader })) });
    }
}
