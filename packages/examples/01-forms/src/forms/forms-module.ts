import { lazy } from "react";
import { IReportViewerOptionRegistrationService, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";
import { IModule, IModuleConfigurator } from "@shrub/core";

import { formRoutes } from "../form-routes";
import { getExampleTestData } from "../example-data";

/**
 * Registers one route per catalog form this app routes to, all of them rendered by the same component.
 *
 * This is where the flip shows up most plainly: six form packages used to register a route and a loader each, and
 * now the host registers six paths against one component, because nothing about a route varies per form except
 * which identity the report viewer is handed.
 */
export class FormsModule implements IModule {
    readonly name = "forms-routes";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config, services }: IModuleConfigurator): Promise<void> {
        const workbench = config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration);

        for (const { path } of formRoutes) {
            workbench.registerRoute({
                path,
                lazy: () => import("./form-route-page").then(module => ({ Component: module.default }))
            });
        }

        // demonstrates the seam ReportViewerModule leaves open for a host to add its own option: this runs as part
        // of ReportViewerModule's own `next()`, after its built-in six are already registered
        const options = services.get<IReportViewerOptionRegistrationService>(IReportViewerOptionRegistrationService);
        options.registerOption({
            id: "load-test-data",
            title: "Load test data",
            Component: lazy(() => import("./load-test-data-option").then(m => ({ default: m.LoadTestDataOption }))),
            canShow: form => !!getExampleTestData({ name: form.name, version: form.version })
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(FormsModule);
