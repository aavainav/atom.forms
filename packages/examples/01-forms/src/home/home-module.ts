import { IModule, IModuleConfigurator } from "@shrub/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

/**
 * Registers the sandbox home route, listing every form registered with the catalog alongside the demo routes.
 *
 * It is the **index** route of the report viewer's layout, so the sandbox opens on the menu rather than on a form.
 * The report viewer registers nothing there itself; a host that wants its generic data-driven loader at some path
 * registers `ReportViewerLoader` for it, and this one wants a menu instead.
 */
export class HomeModule implements IModule {
    readonly name = "home";
    readonly dependencies = [ReportViewerModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IReportViewerConfiguration>(IReportViewerConfiguration).registerRoute("report-viewer", {
            index: true,
            lazy: () => import("./home-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(HomeModule);
