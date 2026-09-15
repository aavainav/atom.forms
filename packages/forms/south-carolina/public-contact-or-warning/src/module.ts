import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { IPublicContactOrWarningOptions } from "./options";
import { IPublicContactOrWarningService, PublicContactOrWarningService } from "./services";
import { publicContactOrWarningValueLists } from "./value-lists";

export const IPublicContactOrWarningConfiguration = createConfig<IPublicContactOrWarningConfiguration>();
export interface IPublicContactOrWarningConfiguration {
}

export const CATALOG_IDENTITY = {
    name: "SC Form 432 - Public Contact / Warning",
    description: "South Carolina Form 432 (Rev. 06/2014) - Public Contact / Warning record, completed when a stop results in no citation and no arrest, per SC Code 56-5-6560(A).",
    version: "1.0"
} as const;

/** Defines the public contact/warning form module. */
export class PublicContactOrWarningModule implements IModule {
    readonly name = "public-contact-or-warning";
    readonly dependencies = [FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IPublicContactOrWarningOptions>(IPublicContactOrWarningOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IPublicContactOrWarningService, PublicContactOrWarningService>(IPublicContactOrWarningService, PublicContactOrWarningService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const { name, description, version } = CATALOG_IDENTITY;

        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of publicContactOrWarningValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        catalog.registerCatalogItem({
            name,
            description,
            type: "warning",
            version,
            load: () => Promise.all([
                import("./models/public-contact-or-warning-form"),
                import("./models/public-contact-or-warning-form-schema"),
                import("./components")
            ]).then(([formModule, schemaModule, componentModule]) => {
                new schemaModule.PublicContactOrWarningFormSchema();

                return {
                    ctor: formModule.PublicContactOrWarningFormModel,
                    schema: schemaModule.PublicContactOrWarningFormSchema,
                    component: componentModule.PublicContactOrWarningForm
                };
            })
        });
    }
}
