import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IOKParkingOptions } from "./options";
import { IOKParkingService, OKParkingService } from "./services";
import { okParkingValueLists } from "./value-lists";
import { OKParkingViolationListId, okParkingViolationLists } from "./violations";

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

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okParkingValueLists) {
            valueLists.registerList(definition);
        }

        // the list this form draws its violations from, and how a chosen violation lands on it; the code goes in
        // the violation block and the scheduled fine in the payment block beneath it
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);

        for (const definition of okParkingViolationLists) {
            violations.registerList(definition);
        }

        violations.registerViolations({ name, version }, {
            listId: OKParkingViolationListId.violation,
            pageName: "citation-page",
            apply: (controllers, chosen) => services.get<IOKParkingService>(IOKParkingService).applyViolations(controllers, chosen),
            getApplied: (controllers, all) => services.get<IOKParkingService>(IOKParkingService).getAppliedViolations(controllers, all)
        });

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/parking-form"),
                import("./models/parking-form-schema"),
                import("./components")
            ]).then(([formModule, schemaModule, componentModule]) => {
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
