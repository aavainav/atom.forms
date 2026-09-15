import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IGAUTCOptions } from "./options";
import { IGAUTCService, GAUTCService } from "./services";

export const IGAUTCConfiguration = createConfig<IGAUTCConfiguration>();
export interface IGAUTCConfiguration {
}

export const CATALOG_IDENTITY = {
    name: "GA Uniform Traffic Citation",
    description: "Georgia uniform traffic citation, summons, and accusation as issued by the City of Atlanta Department of Police - the face of the citation the officer serves, and the reverse of the court's copy the clerk and judge complete.",
    version: "1.0"
} as const;

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
                import("./models/utc-form"),
                import("./models/utc-form-schema"),
                import("./components"),
                import("./value-lists"),
                import("./violations")
            ]).then(([formModule, schemaModule, componentModule, valueListsModule, violationsModule]) => {
                for (const definition of valueListsModule.gaUtcValueLists) {
                    valueLists.registerList(definition);
                }

                for (const definition of violationsModule.gaUtcViolationLists) {
                    violations.registerList(definition);
                }

                violations.registerViolations({ name, version }, {
                    listId: violationsModule.GAUTCValueViolationListId.violation,
                    pageName: "citation-page",
                    apply: (controllers, chosen) => services.get<IGAUTCService>(IGAUTCService).applyViolations(controllers, chosen),
                    getApplied: (controllers, all) => services.get<IGAUTCService>(IGAUTCService).getAppliedViolations(controllers, all)
                });

                new schemaModule.GAUTCFormSchema();

                return {
                    ctor: formModule.GAUTCFormModel,
                    schema: schemaModule.GAUTCFormSchema,
                    component: componentModule.GAUTCForm
                };
            })
        });
    }
}
