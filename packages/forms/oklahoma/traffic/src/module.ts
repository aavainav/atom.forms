import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IPrintingConfiguration, PrintingModule } from "@forms/printing";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IOKTrafficOptions } from "./options";
import { IOKTrafficService, OKTrafficService } from "./services";

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

        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);
        const printing = config.get<IPrintingConfiguration>(IPrintingConfiguration);
        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/traffic-form"),
                import("./models/traffic-form-schema"),
                import("./components"),
                import("./value-lists"),
                import("./violations")
            ]).then(([formModule, schemaModule, componentModule, valueListsModule, violationsModule]) => {
                for (const definition of valueListsModule.okTrafficValueLists) {
                    valueLists.registerList(definition);
                }

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

                for (const definition of violationsModule.okTrafficViolationLists) {
                    violations.registerList(definition);
                }

                violations.registerViolations({ name, version }, {
                    listId: violationsModule.OKTrafficViolationListId.violation,
                    pageName: "complaint-page",
                    apply: (controllers, chosen) => services.get<IOKTrafficService>(IOKTrafficService).applyViolations(controllers, chosen, formModule.OKTrafficFormModel),
                    getApplied: (controllers, all) => services.get<IOKTrafficService>(IOKTrafficService).getAppliedViolations(controllers, all, formModule.OKTrafficFormModel)
                });

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
