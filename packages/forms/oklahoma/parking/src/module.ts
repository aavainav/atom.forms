import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { OKParkingFormFactory } from "./form-factory";
import { OKParkingMapper } from "./mapping";
import { CATALOG_IDENTITY, OKParkingFormModel } from "./models/parking-form";
import { OKParkingFormSchema } from "./models/parking-form-schema";
import { IOKParkingOptions } from "./options";
import { IOKParkingService, OKParkingService } from "./services";
import { okParkingValueLists } from "./value-lists";
import { OKParkingViolationListId, okParkingViolationLists } from "./violations";

export const IOKParkingConfiguration = createConfig<IOKParkingConfiguration>();
export interface IOKParkingConfiguration {
}

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
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okParkingValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        new OKParkingFormSchema();

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

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            ctor: OKParkingFormModel,
            schema: OKParkingFormSchema,
            formFactory: OKParkingFormFactory,
            component: () => import("./components").then(module => module.OKParkingForm),
            // the mapper is hand-written by this same package, so it is supplied inline rather than through a
            // separate call - unlike the record itself, which the host hands to the report viewer as an IDataManager.
            mapper: new OKParkingMapper(),
            valueListIds: okParkingValueLists.map(definition => definition.id),
            violationListId: OKParkingViolationListId.violation
        });
    }
}
