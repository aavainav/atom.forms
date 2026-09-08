import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { TR310FormFactory } from "./form-factory";
import { TR310Mapper } from "./mapping";
import { TR310FormModel } from "./models/tr310-form";
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
    readonly dependencies = [ReportViewerModule, FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<ITR310Options>(ITR310Options);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<ITR310Service, TR310Service>(ITR310Service, TR310Service);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const name = "SC TR-310 - Traffic Collision Report";
        const description = "South Carolina TR-310 (Rev. 7/2024) - the traffic collision report, carrying the collision, a page per person and per unit involved, and the officer's narrative and diagram.";
        const version = "1.0";

        // the lists this report owns go into the shared registry through the same seam a host would use to
        // replace any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of tr310ValueLists) {
            valueLists.registerList(definition);
        }

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "sc/tr310", lazy: () => import("./components").then(module => ({ Component: module.TR310FormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new TR310Mapper());

        new TR310FormSchema();

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: TR310FormModel,
            schema: TR310FormSchema,
            formFactory: TR310FormFactory,
            component: () => import("./components").then(module => module.TR310Form)
        });
    }
}
