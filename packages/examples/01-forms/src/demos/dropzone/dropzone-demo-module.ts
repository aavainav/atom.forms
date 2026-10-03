import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/** Registers a demo route that lets you put mock person, vehicle and violation records onto the S438 citation's dropzones, by dragging or by button. */
export class DropzoneDemoModule implements IModule {
    readonly name = "dropzone-demo";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
            path: "demo/dropzone",
            lazy: () => import("./dropzone-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(DropzoneDemoModule);
