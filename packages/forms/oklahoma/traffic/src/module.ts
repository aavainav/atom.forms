import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IPrintingConfiguration, PrintingModule } from "@forms/printing";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { OKTrafficFormFactory } from "./form-factory";
import { OKTrafficMapper } from "./mapping";
import { OKTrafficFormModel } from "./models/traffic-form";
import { OKTrafficFormSchema } from "./models/traffic-form-schema";
import { IOKTrafficOptions } from "./options";
import { IOKTrafficService, OKTrafficService } from "./services";
import { okTrafficValueLists } from "./value-lists";

export const IOKTrafficConfiguration = createConfig<IOKTrafficConfiguration>();
export interface IOKTrafficConfiguration {
}

/** Defines the Oklahoma City traffic citation module. */
export class OKTrafficModule implements IModule {
    readonly name = "ok-traffic-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, PrintingModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IOKTrafficOptions>(IOKTrafficOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IOKTrafficService, OKTrafficService>(IOKTrafficService, OKTrafficService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const name = "OKC Traffic Citation";
        const description = "Oklahoma City Municipal Court traffic citation - the complaint and information sworn by the issuing officer, the warrant page the counselor and clerk endorse, and the witness, registered owner and status supplement.";
        const version = "1.0";

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okTrafficValueLists) {
            valueLists.registerList(definition);
        }

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "ok/traffic", lazy: () => import("./components").then(module => ({ Component: module.OKTrafficFormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new OKTrafficMapper());

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

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: OKTrafficFormModel,
            schema: OKTrafficFormSchema,
            formFactory: OKTrafficFormFactory,
            component: () => import("./components").then(module => module.OKTrafficForm)
        });
    }
}
