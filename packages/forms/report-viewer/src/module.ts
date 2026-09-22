import { lazy } from "react";
import { AuditModule } from "@forms/audit";
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
    IReviewService,
    IThemeService,
    IValidationService,
    ModalService,
    NotificationService,
    ReportViewerService,
    ReviewService,
    ThemeService,
    ValidationService,
} from "./services";

/**
 * The report viewer module -- the top of this stack, and the only part a host app renders.
 *
 * It depends on every package whose capability it offers, rather than letting them register into it: the catalog,
 * value lists, violations and printing all exist without a viewer, while a viewer is not much without them.
 *
 * The options bar is the one thing left to configure, and even that is this module registering into its own
 * service -- `@forms/violations`/`@forms/printing` stay unaware a report viewer exists at all.
 */
export class ReportViewerModule implements IModule {
    readonly name = "report-viewer";
    readonly dependencies = [AuditModule, FormCatalogModule, ValueListsModule, ViolationsModule, PrintingModule];

    configureServices(registration: IServiceRegistration): void {
        registration.register<IModalService, ModalService>(IModalService, ModalService);
        registration.register<INotificationService, NotificationService>(INotificationService, NotificationService);

        // one instance behind two interfaces, since the options bar's read side (getOptions) and its write side
        // (registerOption) are the same registry
        const reportViewerServiceFactory = new SingletonServiceFactory(ReportViewerService);
        registration.registerSingleton<IReportViewerService, ReportViewerService>(IReportViewerService, reportViewerServiceFactory);
        registration.registerSingleton<IReportViewerOptionRegistrationService, ReportViewerService>(IReportViewerOptionRegistrationService, reportViewerServiceFactory);

        registration.register<IReviewService, ReviewService>(IReviewService, ReviewService);
        registration.register<IThemeService, ThemeService>(IThemeService, ThemeService);
        registration.register<IValidationService, ValidationService>(IValidationService, ValidationService);
    }

    async configure({ services, next }: IModuleConfigurator): Promise<void> {
        // registered here, in order, rather than as a bare array: this is the seam a host's own option would go
        // through too, so the report viewer's own built-ins go through it rather than being special-cased.
        //
        // violations/printing sit *below* this module, so their option is imported directly rather than handed up
        // -- registering them here keeps that direction one-way. Each loads via `lazy`, so a host only downloads
        // the selector or print dialog once a form that offers one is opened.
        const options = services.get<IReportViewerOptionRegistrationService>(IReportViewerOptionRegistrationService);
        const reportViewerService = services.get<IReportViewerService>(IReportViewerService);

        options.registerOption({ id: "validate", title: "Validate", Component: lazy(() => import("./components/options").then(m => ({ default: m.ValidateOption }))) });

        options.registerOption({
            id: "review",
            title: "Review comments",
            Component: lazy(() => import("./components/options").then(module => ({ default: module.ReviewOption }))),
            canShow: (form, dataManager) => reportViewerService.canReview(form, dataManager)
        });

        options.registerOption({
            id: "violations",
            title: "Violations",
            Component: lazy(() => import("@forms/violations").then(module => ({ default: module.ViolationsOption }))),
            canShow: form => !!form.violationListId
        });

        options.registerOption({
            id: "save",
            title: "Save",
            Component: lazy(() => import("./components/options").then(module => ({ default: module.SaveOption }))),
            canShow: (form, dataManager) => reportViewerService.canSaveForm(form, dataManager)
        });

        options.registerOption({
            id: "new-form",
            title: "Start a new form",
            Component: lazy(() => import("./components/options").then(module => ({ default: module.NewFormOption })))
        });

        options.registerOption({
            id: "report-data",
            title: "View report data",
            Component: lazy(() => import("./components/options").then(module => ({ default: module.ReportDataOption }))),
            canShow: form => reportViewerService.canExtractData(form)
        });

        options.registerOption({ id: "print", title: "Print", Component: lazy(() => import("@forms/printing").then(m => ({ default: m.PrintOption }))) });
        options.registerOption({ id: "day-night-mode", title: "Toggle day/night mode", Component: lazy(() => import("./components/options").then(m => ({ default: m.DayNightModeOption }))) });

        // lets a host register its own option before anything renders
        await next();
    }
}
