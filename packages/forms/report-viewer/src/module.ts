import { ReactRouterModule } from "@common/react-router";
import { FormCatalogModule } from "@forms/catalog";
import { IFormIdentity, IFormMapper, FormModel } from "@forms/core";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { DayNightModeOption, ReportDataOption, SaveOption, ValidateOption } from "./components/options";
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
    IThemeService,
    IValidationService,
    ModalService,
    NavigationService,
    NotificationService,
    ReportViewerService,
    ThemeService,
    ValidationService,
} from "./services";

/** Where the report viewer's own options sit in the bar. A package registering one places it against these. */
const validateOptionOrder = 100;
const saveOptionOrder = 200;
const reportDataOptionOrder = 250;
const dayNightModeOptionOrder = 900;

export const IReportViewerConfiguration = createConfig<IReportViewerConfiguration>();
export interface IReportViewerConfiguration {
    /** Registers the reader responsible for supplying report data to load, from whatever source(s) the host app defines. */
    registerDataReader: (reader: IFormDataReader) => void;
    /** Registers the writer responsible for persisting saved report data, to whatever destination the host app defines. */
    registerDataWriter: (writer: IFormDataWriter) => void;
    /** Registers a catalog form with the report viewer, along with the route it is reachable at. */
    registerForm: (registration: IFormRegistration) => void;
    /** Registers the mapper that translates between the identified catalog form and the data contract it publishes. */
    registerMapper: <TForm extends FormModel, TData extends object>(identity: IFormIdentity, mapper: IFormMapper<TForm, TData>) => void;
    /** Registers an option to render in the report viewer's options bar, alongside the built-in validate and save. */
    registerOption: (option: IReportViewerOption) => void;
    /** Registers a panel to mount at the report viewer's root, which is where an off canvas belongs rather than inside the options bar. */
    registerPanel: (panel: IReportViewerPanel) => void;
    /** Registers a route with the report viewer. For a catalog form, use `registerForm` so the form and its route are registered together. */
    registerRoute: (name: string, route: IReportViewerRoute) => void;
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
            registerDataReader: reader => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerDataReader(reader),
            registerDataWriter: writer => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerDataWriter(writer),
            registerForm: registration => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerForm(registration),
            registerMapper: (identity, mapper) => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerMapper(identity, mapper),
            registerOption: option => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerOption(option),
            registerPanel: panel => services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService).registerPanel(panel),
            registerRoute: (name, route) => services.get<INavigationRegistrationService>(INavigationRegistrationService).registerChildRoute(name, route)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IModalService, ModalService>(IModalService, ModalService);
        registration.register<INotificationService, NotificationService>(INotificationService, NotificationService);
        registration.register<IThemeService, ThemeService>(IThemeService, ThemeService);
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
        // The route itself is just a layout that renders the matched child via <Outlet />, which is a form-specific
        // route registered by a form package, or whatever the host registers as the index.
        //
        // Nothing is registered as that index here. `ReportViewerLoader` is exported for a host that wants the
        // generic, data-driven route -- it loads whichever form the data reader answers with -- but a host is
        // rarely asking for a form at its root, and registering one there would take the root away from the host
        // before it had a say. A host that wants it registers it, at the path it wants it on.
        const registration = services.get<INavigationRegistrationService>(INavigationRegistrationService);
        registration.registerRoute({
            id: "report-viewer",
            path: "/",
            lazy: () => import("./components/").then(module => ({ Component: module.ReportViewerLayout })) });

        registration.registerRoute({ id: "not-found", path: "*", lazy: () => import("./components/").then(module => ({ Component: module.NotFound })) });

        // the report viewer's own options go through the same seam a package adding one uses, so the bar has no
        // built-ins of its own to special case and every option is gated, ordered and describable the same way
        const reportViewer = services.get<IReportViewerRegistrationService>(IReportViewerRegistrationService);
        const reportViewerService = services.get<IReportViewerService>(IReportViewerService);

        reportViewer.registerOption({ id: "validate", order: validateOptionOrder, title: "Validate", Component: ValidateOption });
        reportViewer.registerOption({
            id: "save",
            order: saveOptionOrder,
            title: "Save",
            Component: SaveOption,
            // saving needs both halves: a mapper to extract the data and a writer to hand it to. with a mapper and
            // no writer the data would be extracted, dropped, and the report reported as saved.
            canShow: catalogItem => reportViewerService.canSaveForm(catalogItem)
        });
        reportViewer.registerOption({
            id: "report-data",
            order: reportDataOptionOrder,
            title: "View report data",
            Component: ReportDataOption,
            // the data is only worth showing once a mapper can produce it; without one the payload is the stamped
            // identity and nothing the user filled in
            canShow: catalogItem => reportViewerService.canExtractData(catalogItem)
        });
        reportViewer.registerOption({ id: "day-night-mode", order: dayNightModeOptionOrder, title: "Toggle day/night mode", Component: DayNightModeOption });

        // allow other modules the ability to configure the report viewer before the host renders.
        await next();
    }
}