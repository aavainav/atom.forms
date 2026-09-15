import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { ITR310Options } from "./options";
import { ITR310Service, TR310Service } from "./services";

export const ITR310Configuration = createConfig<ITR310Configuration>();
export interface ITR310Configuration {
}

export const CATALOG_IDENTITY = {
    name: "SC TR-310 - Traffic Collision Report",
    description: "South Carolina TR-310 (Rev. 7/2024) - the traffic collision report, carrying the collision, a page per person and per unit involved, and the officer's narrative and diagram.",
    version: "1.0"
} as const;

/** Defines the TR-310 traffic collision report module. */
export class TR310Module implements IModule {
    readonly name = "tr310-crash-form";
    readonly dependencies = [FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<ITR310Options>(ITR310Options);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<ITR310Service, TR310Service>(ITR310Service, TR310Service);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const { name, description, version } = CATALOG_IDENTITY;

        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);
        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "crash",
            version,
            load: () => Promise.all([
                import("./models/tr310-form"),
                import("./models/tr310-form-schema"),
                import("./components"),
                import("./value-lists")
            ]).then(([formModule, schemaModule, componentModule, valueListsModule]) => {
                for (const definition of valueListsModule.tr310ValueLists) {
                    valueLists.registerList(definition);
                }

                new schemaModule.TR310FormSchema();

                return {
                    ctor: formModule.TR310FormModel,
                    schema: schemaModule.TR310FormSchema,
                    component: componentModule.TR310Form
                };
            })
        });
    }
}
