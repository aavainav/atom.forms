import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/** Registers a demo route that lets you drag mock person/vehicle records onto the public contact/warning form's dropzones. */
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
