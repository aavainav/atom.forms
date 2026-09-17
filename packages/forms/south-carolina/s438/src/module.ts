import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IS438CitationOptions } from "./options";
import { IS438CitationService, S438CitationService } from "./services";

export const IS438CitationConfiguration = createConfig<IS438CitationConfiguration>();
export interface IS438CitationConfiguration {
}

export const CATALOG_IDENTITY = {
    name: "S438 Citation Form",
    description: "The south carolina S438 UTT citation form.",
    version: "1.0"
} as const;

/** Defines the s438 citation module. */
export class S438CitationModule implements IModule {
    readonly name = "s438-citation-form";
    readonly dependencies = [FormCatalogModule, ViolationsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IS438CitationOptions>(IS438CitationOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IS438CitationService, S438CitationService>(IS438CitationService, S438CitationService);
    }

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        const { name, description, version } = CATALOG_IDENTITY;

        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);
        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/s438-form"),
                import("./models/s438-form-schema"),
                import("./components/"),
                import("./violations")
            ]).then(([formModule, schemaModule, componentModule, violationsModule]) => {
                for (const definition of violationsModule.s438ViolationLists) {
                    violations.registerList(definition);
                }

                violations.registerViolations({ name, version }, {
                    listId: violationsModule.S438ViolationListId.violation,
                    pageName: "front-page",
                    apply: (controllers, chosen) => services.get<IS438CitationService>(IS438CitationService).applyViolations(controllers, chosen, formModule.S438FormModel),
                    getApplied: (controllers, all) => services.get<IS438CitationService>(IS438CitationService).getAppliedViolations(controllers, all, formModule.S438FormModel)
                });

                new schemaModule.S438FormSchema();

                return {
                    ctor: formModule.S438FormModel,
                    schema: schemaModule.S438FormSchema,
                    component: componentModule.S438CitationForm
                };
            })
        });
    }
}
