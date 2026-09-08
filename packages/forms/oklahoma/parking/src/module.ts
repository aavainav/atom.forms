import { FormCatalogModule, IFormCatalogConfiguration } from "@forms/catalog";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IValueListsConfiguration, ValueListsModule } from "@forms/value-lists";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration } from "@shrub/core";

import { OKParkingFormFactory } from "./form-factory";
import { OKParkingMapper } from "./mapping";
import { OKParkingFormModel } from "./models/parking-form";
import { OKParkingFormSchema } from "./models/parking-form-schema";
import { IOKParkingOptions } from "./options";
import { IOKParkingService, OKParkingService } from "./services";
import { okParkingValueLists } from "./value-lists";

export const IOKParkingConfiguration = createConfig<IOKParkingConfiguration>();
export interface IOKParkingConfiguration {
}

/** Defines the Oklahoma City parking violation module. */
export class OKParkingModule implements IModule {
    readonly name = "ok-parking-form";
    readonly dependencies = [ReportViewerModule, FormCatalogModule, ValueListsModule];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IOKParkingOptions>(IOKParkingOptions);
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IOKParkingService, OKParkingService>(IOKParkingService, OKParkingService);
    }

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const name = "OKC Parking Violation";
        const description = "Oklahoma City Municipal Court parking violation - the citation left on the vehicle, the complaint and warrant page the counselor and clerk endorse, and the registered owner and vehicle detail.";
        const version = "1.0";

        // the lists this form owns go into the shared registry through the same seam a host would use to replace
        // any of them; the national lists it also draws on are already there from ValueListsModule
        const valueLists = config.get<IValueListsConfiguration>(IValueListsConfiguration);

        for (const definition of okParkingValueLists) {
            valueLists.registerList(definition);
        }

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);
        reportViewer.registerForm({
            name,
            version,
            route: { path: "ok/parking", lazy: () => import("./components").then(module => ({ Component: module.OKParkingFormLoader })) }
        });

        // the report viewer owns the mapping between a form and the contract it publishes; a host is responsible for
        // mapping its own data into that contract before handing it to the report viewer.
        reportViewer.registerMapper({ name, version }, new OKParkingMapper());

        new OKParkingFormSchema();

        const catalog = config.get<IFormCatalogConfiguration>(IFormCatalogConfiguration);
        catalog.registerCatalogItem({
            name,
            description,
            version,
            ctor: OKParkingFormModel,
            schema: OKParkingFormSchema,
            formFactory: OKParkingFormFactory,
            component: () => import("./components").then(module => module.OKParkingForm)
        });
    }
}
