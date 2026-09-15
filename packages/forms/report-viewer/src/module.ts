import { lazy } from "react";
import { FormCatalogModule } from "@forms/catalog";
import { PrintingModule } from "@forms/printing";
import { ValueListsModule } from "@forms/value-lists";
import { ViolationsModule } from "@forms/violations";
import { IModule, IModuleConfigurator, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import {
    IModalService,
    INotificationService,
    IReportViewerOptionRegistrationService,
    IReportViewerService,
    IThemeService,
    IValidationService,
    ModalService,
    NotificationService,
    ReportViewerService,
    ThemeService,
    ValidationService,
} from "./services";

/**
 * Defines the report viewer module -- the top of this stack and the only part of it a host app renders.
 *
 * It depends on every package whose capability it offers rather than letting them register into it: the catalog it
 * resolves a form from, the value lists a form's option fields draw on, and the violations and printing whose
 * option and panel it mounts itself. That direction is the point: a form package, a violation list and a print
 * copy are all things that exist without a viewer, while a viewer is not much without them.
 *
 * The options bar is the one thing left to configure, and even that is this module registering into its own
 * service -- `@forms/violations`/`@forms/printing` stay unaware that a report viewer exists at all.
 */
export class ReportViewerModule implements IModule {
    readonly name = "report-viewer";
    readonly dependencies = [FormCatalogModule, ValueListsModule, ViolationsModule, PrintingModule];

    configureServices(registration: IServiceRegistration): void {
        registration.register<IModalService, ModalService>(IModalService, ModalService);
        registration.register<INotificationService, NotificationService>(INotificationService, NotificationService);

        // one instance behind two interfaces, since the options bar's read side (getOptions) and its write side
        // (registerOption) are the same registry
        const reportViewerServiceFactory = new SingletonServiceFactory(ReportViewerService);
        registration.registerSingleton<IReportViewerService, ReportViewerService>(IReportViewerService, reportViewerServiceFactory);
        registration.registerSingleton<IReportViewerOptionRegistrationService, ReportViewerService>(IReportViewerOptionRegistrationService, reportViewerServiceFactory);

        registration.register<IThemeService, ThemeService>(IThemeService, ThemeService);
        registration.register<IValidationService, ValidationService>(IValidationService, ValidationService);
    }

    async configure({ services, next }: IModuleConfigurator): Promise<void> {
        // registered here, in order, rather than as a bare array: this is the seam a host's own option would go
        // through too, so the report viewer's own six are registered through it rather than special-cased.
        //
        // violations and printing sit *below* this module, so their option is imported directly rather than
        // handed up through this registration -- registering them here is what keeps that direction one-way. each
        // is loaded through `lazy` so a host still only downloads the selector or the print dialog once a form
        // that offers one is opened; the four built here go through the same door for one rule rather than two.
        const options = services.get<IReportViewerOptionRegistrationService>(IReportViewerOptionRegistrationService);
        const reportViewerService = services.get<IReportViewerService>(IReportViewerService);

        options.registerOption({ id: "validate", title: "Validate", Component: lazy(() => import("./components/options").then(m => ({ default: m.ValidateOption }))) });
        options.registerOption({
            id: "violations",
            title: "Violations",
            Component: lazy(() => import("@forms/violations").then(m => ({ default: m.ViolationsOption }))),
            // the form's own declaration is the gate: a form that draws its charges from a violation list says so
            // on itself, and nothing else has to be asked whether the selector belongs on it
            canShow: form => !!form.violationListId
        });
        options.registerOption({
            id: "save",
            title: "Save",
            Component: lazy(() => import("./components/options").then(m => ({ default: m.SaveOption }))),
            canShow: (form, dataManager) => reportViewerService.canSaveForm(form, dataManager)
        });
        options.registerOption({
            id: "report-data",
            title: "View report data",
            Component: lazy(() => import("./components/options").then(m => ({ default: m.ReportDataOption }))),
            // the data is only worth showing once a mapper can produce it; without one the payload is the stamped
            // identity and nothing the user filled in
            canShow: form => reportViewerService.canExtractData(form)
        });
        options.registerOption({ id: "print", title: "Print", Component: lazy(() => import("@forms/printing").then(m => ({ default: m.PrintOption }))) });
        options.registerOption({ id: "day-night-mode", title: "Toggle day/night mode", Component: lazy(() => import("./components/options").then(m => ({ default: m.DayNightModeOption }))) });

        // lets a host register its own option before anything renders
        await next();
    }
}
