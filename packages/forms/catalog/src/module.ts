import { FormModel, Schema } from "@forms/core";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { FormCatalogService, IFormCatalogItem, IFormCatalogRegistrationService, IFormCatalogService } from "./services";

export const IFormCatalogConfiguration = createConfig<IFormCatalogConfiguration>();
export interface IFormCatalogConfiguration {
    registerCatalogItem: <TForm extends FormModel = FormModel, TSchema extends Schema = Schema>(catalogItem: IFormCatalogItem<TForm, TSchema>) => void;
}

/** Defines the form catalog module. This module manages the registry of forms available for data-driven rendering. */
export class FormCatalogModule implements IModule {
    readonly name = "form-catalog";

    initialize(init: IModuleInitializer): void {
        init.config(IFormCatalogConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerCatalogItem: catalogItem => services.get<IFormCatalogRegistrationService>(IFormCatalogRegistrationService).registerCatalogItem(catalogItem)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        const formCatalogServiceFactory = new SingletonServiceFactory(FormCatalogService);
        registration.registerSingleton<IFormCatalogService, FormCatalogService>(IFormCatalogService, formCatalogServiceFactory);
        registration.registerSingleton<IFormCatalogRegistrationService, FormCatalogService>(IFormCatalogRegistrationService, formCatalogServiceFactory);
    }
}