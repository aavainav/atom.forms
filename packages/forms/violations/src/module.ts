import { FormCatalogModule, IFormCatalogItem } from "@forms/catalog";
import { CitationForm, IFormIdentity } from "@forms/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { createConfig, IModule, IModuleConfigurator, IModuleInitializer, IServiceRegistration, SingletonServiceFactory } from "@shrub/core";

import { ViolationsOption, ViolationsPanel } from "./components";
import { IViolationBinding, IViolationListDefinition } from "./models";
import { IViolationPickerService, IViolationRegistrationService, IViolationService, ViolationPickerService, ViolationService } from "./services";
import { standardViolationLists } from "./violations";

/** Where the violations option sits in the report viewer's options bar, between validate and save. */
const violationsOptionOrder = 150;

export const IViolationsConfiguration = createConfig<IViolationsConfiguration>();
export interface IViolationsConfiguration {
    /**
     * Registers a violation list. A list registered under an id already in use replaces it, which is how an agency
     * serves its own current code list without this package knowing where it went.
     */
    registerList: (definition: IViolationListDefinition) => void;
    /** Registers how the identified form takes the violations chosen in the picker. */
    registerViolations: (identity: IFormIdentity, binding: IViolationBinding) => void;
}

/**
 * Defines the violations module. It owns the registry of violations a citation can be written for, and adds the
 * picker -- an option in the report viewer's bar and the panel it opens -- to the forms that declare a binding.
 */
export class ViolationsModule implements IModule {
    readonly name = "forms-violations";
    readonly dependencies = [ReportViewerModule, FormCatalogModule];

    initialize(init: IModuleInitializer): void {
        init.config(IViolationsConfiguration).register(({ services }: IModuleConfigurator) => ({
            registerList: definition => services.get<IViolationRegistrationService>(IViolationRegistrationService).registerList(definition),
            registerViolations: (identity, binding) => services.get<IViolationRegistrationService>(IViolationRegistrationService).registerViolations(identity, binding)
        }));
    }

    configureServices(registration: IServiceRegistration): void {
        registration.register<IViolationPickerService, ViolationPickerService>(IViolationPickerService, ViolationPickerService);

        const violationServiceFactory = new SingletonServiceFactory(ViolationService);
        registration.registerSingleton<IViolationService, ViolationService>(IViolationService, violationServiceFactory);
        registration.registerSingleton<IViolationRegistrationService, ViolationService>(IViolationRegistrationService, violationServiceFactory);
    }

    configure({ config, services }: IModuleConfigurator): void {
        // the bundled lists go in first so a module depending on this one, which configures later, can replace any
        // of them by registering over its id
        const registration = services.get<IViolationRegistrationService>(IViolationRegistrationService);

        for (const definition of standardViolationLists) {
            registration.registerList(definition);
        }

        const violationService = services.get<IViolationService>(IViolationService);

        // the picker is offered only where it can actually do something: the form has declared how it takes a
        // violation, and it is a citation. the registration is the working gate -- a form that declared nothing has
        // nowhere to put a charge -- while the citation check states the rule the feature is bound by rather than
        // leaving it to be inferred from which forms happened to register.
        const canShow = (catalogItem: IFormCatalogItem): boolean =>
            !!violationService.getBinding(catalogItem) && catalogItem.ctor.prototype instanceof CitationForm;

        const reportViewer = config.get<IReportViewerConfiguration>(IReportViewerConfiguration);

        reportViewer.registerOption({ id: "violations", order: violationsOptionOrder, Component: ViolationsOption, canShow });
        reportViewer.registerPanel({ id: "violations", Component: ViolationsPanel, canShow });
    }
}
