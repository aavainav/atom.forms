import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IViolationsConfiguration, ViolationsModule } from "@forms/violations";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IS438CitationOptions } from "./options";
import { IS438CitationService, S438CitationService } from "./services";
import { S438ViolationListId, s438ViolationLists } from "./violations";

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

        // the list this form draws its charges from, and how a chosen violation lands on it. the selector never
        // writes a field itself: the citation names its charge in its own section under its own field names, and a
        // second violation means a second front page, which is the form's business rather than the selector's.
        const violations = config.get<IViolationsConfiguration>(IViolationsConfiguration);

        for (const definition of s438ViolationLists) {
            violations.registerList(definition);
        }

        violations.registerViolations({ name, version }, {
            listId: S438ViolationListId.violation,
            pageName: "front-page",
            apply: (controllers, chosen) => services.get<IS438CitationService>(IS438CitationService).applyViolations(controllers, chosen),
            getApplied: (controllers, all) => services.get<IS438CitationService>(IS438CitationService).getAppliedViolations(controllers, all)
        });

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "citation",
            version,
            load: () => Promise.all([
                import("./models/s438-form"),
                import("./models/s438-form-schema"),
                import("./components/")
            ]).then(([formModule, schemaModule, componentModule]) => {
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
