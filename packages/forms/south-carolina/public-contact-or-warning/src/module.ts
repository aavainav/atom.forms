import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { PublicContactOrWarningFormFactory } from "./form-factory";
import { PublicContactOrWarningMapper } from "./mapping";
import { CATALOG_IDENTITY, PublicContactOrWarningFormModel } from "./models/public-contact-or-warning-form";
import { PublicContactOrWarningFormSchema } from "./models/public-contact-or-warning-form-schema";
import { IPublicContactOrWarningOptions } from "./options";
import { IPublicContactOrWarningService, PublicContactOrWarningService } from "./services";
import { publicContactOrWarningValueLists } from "./value-lists";

export const IPublicContactOrWarningConfiguration = createConfig<IPublicContactOrWarningConfiguration>();
export interface IPublicContactOrWarningConfiguration {
}

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

        new PublicContactOrWarningFormSchema();

        catalog.registerCatalogItem({
            name,
            description,
            type: "warning",
            version,
            ctor: PublicContactOrWarningFormModel,
            schema: PublicContactOrWarningFormSchema,
            formFactory: PublicContactOrWarningFormFactory,
            component: () => import("./components").then(module => module.PublicContactOrWarningForm),
            mapper: new PublicContactOrWarningMapper(),
            valueListIds: publicContactOrWarningValueLists.map(definition => definition.id)
        });
    }
}
