import { IModule, IModuleConfigurator } from "@shrub/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

/** Registers the sandbox home route, listing every form registered with the catalog alongside the demo routes. */
export class HomeModule implements IModule {
    readonly name = "home";
    readonly dependencies = [ReportViewerModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IReportViewerConfiguration>(IReportViewerConfiguration).registerRoute("report-viewer", {
            path: "home",
            lazy: () => import("./home-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(HomeModule);
