import { IModule, IModuleConfigurator } from "@shrub/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

/** Registers a demo route that lets you demo various watermark statuses. */
export class WatermarkDemoModule implements IModule {
    readonly name = "watermark-demo";
    readonly dependencies = [ReportViewerModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IReportViewerConfiguration>(IReportViewerConfiguration).registerRoute("report-viewer", {
            path: "demo/watermark",
            lazy: () => import("./watermark-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(WatermarkDemoModule);