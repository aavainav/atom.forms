import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IOKParkingOptions } from "./options";
import { IOKParkingService, OKParkingService } from "./services";

export const IOKParkingConfiguration = createConfig<IOKParkingConfiguration>();
export interface IOKParkingConfiguration {
}

export const CATALOG_IDENTITY = {
    name: "OKC Parking Violation",
    description: "Oklahoma City Municipal Court parking violation - the citation left on the vehicle, the complaint and warrant page the counselor and clerk endorse, and the registered owner and vehicle detail.",
    version: "1.0"
} as const;

/** Defines the Oklahoma City parking violation module. */
export class OKParkingModule implements IModule {
    readonly name = "ok-parking-form";
    readonly dependencies = [FormCatalogModule, ValueListsModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IOKParkingOptions>(IOKParkingOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IOKParkingService, OKParkingService>(IOKParkingService, OKParkingService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        const { name, description, version } = CATALOG_IDENTITY;

        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);
        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/parking-form"),
                import("./models/parking-form-schema"),
                import("./components"),
                import("./value-lists"),
                import("./violations")
            ]).then(([formModule, schemaModule, componentModule, valueListsModule, violationsModule]) => {
                for (const definition of valueListsModule.okParkingValueLists) {
                    valueLists.registerList(definition);
                }

                for (const definition of violationsModule.okParkingViolationLists) {
                    violations.registerList(definition);
                }

                violations.registerViolations({ name, version }, {
                    listId: violationsModule.OKParkingViolationListId.violation,
                    pageName: "citation-page",
                    apply: (controllers, chosen) => services.get<IOKParkingService>(IOKParkingService).applyViolations(controllers, chosen),
                    getApplied: (controllers, all) => services.get<IOKParkingService>(IOKParkingService).getAppliedViolations(controllers, all)
                });

                new schemaModule.OKParkingFormSchema();

                return {
                    ctor: formModule.OKParkingFormModel,
                    schema: schemaModule.OKParkingFormSchema,
                    component: componentModule.OKParkingForm
                };
            })
        });
    }
}
