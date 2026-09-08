import { ReactRouterModule } from "@common/react-router";
import { FormCatalogModule } from "@forms/catalog";
import { IFormIdentity, IFormMapper, FormModel } from "@forms/core";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { IReportViewerOptions } from "./options";
import {
    IFormDataReader,
    IFormDataWriter,
    IFormRegistration,
    IModalService,
    INavigationRegistrationService,
    INavigationService,
    INotificationService,
    IReportViewerOption,
    IReportViewerPanel,
    IReportViewerRegistrationService,
    IReportViewerRoute,
    IReportViewerService,
    IValidationService,
    ModalService,
    NavigationService,
    NotificationService,
    ReportViewerService,
    ValidationService,
} from "./services";

export const IReportViewerConfiguration = createConfig<IReportViewerConfiguration>();
export interface IReportViewerConfiguration {
    /** Registers a catalog form with the report viewer, along with the route it is reachable at. */
    registerForm: (registration: IFormRegistration) => void;
    /** Registers a route with the report viewer. For a catalog form, use `registerForm` so the form and its route are registered together. */
    registerRoute: (name: string, route: IReportViewerRoute) => void;
    /** Registers the reader responsible for supplying report data to load, from whatever source(s) the host app defines. */
    registerDataReader: (reader: IFormDataReader) => void;
    /** Registers the writer responsible for persisting saved report data, to whatever destination the host app defines. */
    registerDataWriter: (writer: IFormDataWriter) => void;
    /** Registers the mapper that translates between the identified catalog form and the data contract it publishes. */
    registerMapper: <TForm extends FormModel, TData extends object>(identity: IFormIdentity, mapper: IFormMapper<TForm, TData>) => void;
    /** Registers an option to render in the report viewer's options bar, alongside the built-in validate and save. */
    registerOption: (option: IReportViewerOption) => void;
    /** Registers a panel to mount at the report viewer's root, which is where an off canvas belongs rather than inside the options bar. */
    registerPanel: (panel: IReportViewerPanel) => void;
}

/** Defines the report viewer module. This module handles displaying and interacting with reports. */
export class ReportViewerModule implements IModule {
    readonly name = "report-viewer";
    readonly dependencies = [
        ReactRouterModule,
        FormCatalogModule
    ];

    initialize(init: IModuleInitializer): void {
        init.settings.bindToOptions<IReportViewerOptions>(IReportViewerOptions);
        init.config(IReportViewerConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerForm: registration => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerForm(registration),
            registerRoute: (name, route) => services.get<INavigationRegistrationService>(INavigationRegistrationService).registerChildRoute(name, route),
            registerDataReader: reader => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerDataReader(reader),
            registerDataWriter: writer => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerDataWriter(writer),
            registerMapper: (identity, mapper) => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerMapper(identity, mapper),
            registerOption: option => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerOption(option),
            registerPanel: panel => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerPanel(panel),
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IModalService, ModalService>(IModalService, ModalService);
        registration.register<INotificationService, NotificationService>(INotificationService, NotificationService);
        registration.register<IValidationService, ValidationService>(IValidationService, ValidationService);

        const navigationServiceFactory = new SingletonServiceFactory(NavigationService);
        registration.registerSingleton<INavigationService, NavigationService>(INavigationService, navigationServiceFactory);
        registration.registerSingleton<INavigationRegistrationService, NavigationService>(INavigationRegistrationService, navigationServiceFactory);

        const reportViewerServiceFactory = new SingletonServiceFactory(ReportViewerService);
        registration.registerSingleton<IReportViewerService, ReportViewerService>(IReportViewerService, reportViewerServiceFactory);
        registration.registerSingleton<IReportViewerRegistrationService, ReportViewerService>(IReportViewerRegistrationService, reportViewerServiceFactory);
    }

    async configure({ services, next }: IModuleConfigurator): Promise<void> {
        // We need to initialize the top level report viewer route so that the modules can register their child routes.
        // The route itself is just a layout that renders the matched child via <Outlet />: the generic, data-driven
        // ReportViewerLoader registered below as its index route, or a form-specific route registered by a form package.
        const registration = services.get<INavigationRegistrationService>(INavigationRegistrationService);
        registration.registerRoute({
            id: "report-viewer",
            path: "/",
            lazy: () => import("./components/").then(module => ({ Component: module.ReportViewerLayout })) });

        registration.registerChildRoute("report-viewer", { index: true, lazy: () => import("./components/").then(module => ({ Component: module.ReportViewerLoader })) });

        registration.registerRoute({ id: "not-found", path: "*", lazy: () => import("./components/").then(module => ({ Component: module.NotFound })) });

        // allow other modules the ability to configure the report viewer before the host renders.
        await next();
    }
}