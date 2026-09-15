import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IPrintingConfiguration, PrintingModule } from "@forms/printing";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IOKTrafficOptions } from "./options";
import { IOKTrafficService, OKTrafficService } from "./services";
import { okTrafficValueLists } from "./value-lists";
import { OKTrafficViolationListId, okTrafficViolationLists } from "./violations";

export const IOKTrafficConfiguration = createConfig<IOKTrafficConfiguration>();
export interface IOKTrafficConfiguration {
}

export const CATALOG_IDENTITY = {
    name: "OKC Traffic Citation",
    description: "Oklahoma City Municipal Court traffic citation - the complaint and information sworn by the issuing officer, the warrant page the counselor and clerk endorse, and the witness, registered owner and status supplement.",
    version: "1.0"
} as const;

/** Defines the Oklahoma City traffic citation module. */
export class OKTrafficModule implements IModule {
    readonly name = "ok-traffic-form";
    readonly dependencies = [FormCatalogModule, PrintingModule, ValueListsModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IOKTrafficOptions>(IOKTrafficOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IOKTrafficService, OKTrafficService>(IOKTrafficService, OKTrafficService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okTrafficValueLists) {
            valueLists.registerList(definition);
        }

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

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/traffic-form"),
                import("./models/traffic-form-schema"),
                import("./components")
            ]).then(([formModule, schemaModule, componentModule]) => {
                new schemaModule.OKTrafficFormSchema();

                return {
                    ctor: formModule.OKTrafficFormModel,
                    schema: schemaModule.OKTrafficFormSchema,
                    component: componentModule.OKTrafficForm
                };
            })
        });
    }
}
