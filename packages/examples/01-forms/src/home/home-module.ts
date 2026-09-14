import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/**
 * Registers the sandbox home route, listing every form registered with the catalog alongside the demo routes.
 *
 * It is the **index** route of the app's root route, so the sandbox opens on the menu rather than on a form. The
 * workbench registers nothing there itself, so the root is the host's to claim.
 *
 * It depends on the report viewer only because the page asks it which options each form offers, for the badges.
 */
export class HomeModule implements IModule {
    readonly name = "home";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
            index: true,
            lazy: () => import("./home-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(HomeModule);
