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
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this record owns go into the shared registry through the same seam a host would use to
        // replace any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of publicContactOrWarningValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        new PublicContactOrWarningFormSchema();

        catalog.registerCatalogItem({
            name,
            description,
            type: "none",
            version,
            ctor: PublicContactOrWarningFormModel,
            schema: PublicContactOrWarningFormSchema,
            formFactory: PublicContactOrWarningFormFactory,
            component: () => import("./components").then(module => module.PublicContactOrWarningForm),
            // the mapper is hand-written by this same package, so it is supplied inline rather than through a
            // separate call - unlike the record itself, which the host hands to the report viewer as an IDataManager.
            mapper: new PublicContactOrWarningMapper(),
            valueListIds: publicContactOrWarningValueLists.map(definition => definition.id)
        });
    }
}
