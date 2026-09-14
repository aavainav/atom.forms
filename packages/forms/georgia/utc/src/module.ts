import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { GAUTCFormFactory } from "./form-factory";
import { GAUTCMapper } from "./mapping";
import { CATALOG_IDENTITY, GAUTCFormModel } from "./models/utc-form";
import { GAUTCFormSchema } from "./models/utc-form-schema";
import { IGAUTCOptions } from "./options";
import { IGAUTCService, GAUTCService } from "./services";
import { gaUtcValueLists } from "./value-lists";
import { gaUtcViolationLists, GAUTCValueViolationListId } from "./violations";

export const IGAUTCConfiguration = createConfig<IGAUTCConfiguration>();
export interface IGAUTCConfiguration {
}

/** Defines the Georgia uniform traffic citation module. */
export class GAUTCModule implements IModule {
    readonly name = "ga-utc-form";
    readonly dependencies = [FormCatalogModule, ValueListsModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IGAUTCOptions>(IGAUTCOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IGAUTCService, GAUTCService>(IGAUTCService, GAUTCService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of gaUtcValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        new GAUTCFormSchema();

        // the list this form draws its charges from, and how a chosen violation lands on it. the charge goes onto
        // the offense section rather than the one this form calls "violation", which holds the speed detection gear.
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);

        for (const definition of gaUtcViolationLists) {
            violations.registerList(definition);
        }

        violations.registerViolations({ name, version }, {
            listId: GAUTCValueViolationListId.violation,
            pageName: "citation-page",
            apply: (controllers, chosen) => services.get<IGAUTCService>(IGAUTCService).applyViolations(controllers, chosen),
            getApplied: (controllers, all) => services.get<IGAUTCService>(IGAUTCService).getAppliedViolations(controllers, all)
        });

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            ctor: GAUTCFormModel,
            schema: GAUTCFormSchema,
            formFactory: GAUTCFormFactory,
            component: () => import("./components").then(module => module.GAUTCForm),
            // the mapper is hand-written by this same package, so it is supplied inline rather than through a
            // separate call - unlike the record itself, which the host hands to the report viewer as an IDataManager.
            mapper: new GAUTCMapper(),
            valueListIds: gaUtcValueLists.map(definition => definition.id),
            violationListId: GAUTCValueViolationListId.violation
        });
    }
}
