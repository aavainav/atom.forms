import { IModule, IModuleConfigurator } from "@shrub/core";
import { IReportViewerConfiguration, ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper } from "@forms/workbench";

/** Registers a demo route that lets you drag mock person/vehicle records onto the public contact/warning form's dropzones. */
export class DropzoneDemoModule implements IModule {
    readonly name = "dropzone-demo";
    readonly dependencies = [ReportViewerModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IReportViewerConfiguration>(IReportViewerConfiguration).registerRoute("report-viewer", {
            path: "demo/dropzone",
            lazy: () => import("./dropzone-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(DropzoneDemoModule);