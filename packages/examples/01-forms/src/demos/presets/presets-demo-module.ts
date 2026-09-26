import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/** Registers a demo route for applying presets to a report under way, and saving one's own. */
export class PresetsDemoModule implements IModule {
    readonly name = "presets-demo";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
            path: "demo/presets",
            lazy: () => import("./presets-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(PresetsDemoModule);
