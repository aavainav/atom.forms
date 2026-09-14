import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { TR310FormFactory } from "./form-factory";
import { TR310Mapper } from "./mapping";
import { CATALOG_IDENTITY, TR310FormModel } from "./models/tr310-form";
import { TR310FormSchema } from "./models/tr310-form-schema";
import { ITR310Options } from "./options";
import { ITR310Service, TR310Service } from "./services";
import { tr310ValueLists } from "./value-lists";

export const ITR310Configuration = createConfig<ITR310Configuration>();
export interface ITR310Configuration {
}

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
        // the form model declares the identity and stamps it on itself, so everything registered here names the
        // same form the extracted data is stamped with
        const { name, description, version } = CATALOG_IDENTITY;

        // the lists this report owns go into the shared registry through the same seam a host would use to
        // replace any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of tr310ValueLists) {
            valueLists.registerList(definition);
        }

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);

        new TR310FormSchema();

        catalog.registerCatalogItem({
            name,
            description,
            type: "crash",
            version,
            ctor: TR310FormModel,
            schema: TR310FormSchema,
            formFactory: TR310FormFactory,
            component: () => import("./components").then(module => module.TR310Form),
            // the mapper is hand-written by this same package, so it is supplied inline rather than through a
            // separate call - unlike the record itself, which the host hands to the report viewer as an IDataManager.
            mapper: new TR310Mapper(),
            valueListIds: tr310ValueLists.map(definition => definition.id)
        });
    }
}
