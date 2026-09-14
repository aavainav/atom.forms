import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";
import { IModule, IModuleConfigurator } from "@shrub/core";

import { formRoutes } from "../form-routes";

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

    async configure({ config }: IModuleConfigurator): Promise<void> {
        const workbench = config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration);

        for (const { path } of formRoutes) {
            workbench.registerRoute({
                path,
                lazy: () => import("./form-route-page").then(module => ({ Component: module.default }))
            });
        }
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(FormsModule);
