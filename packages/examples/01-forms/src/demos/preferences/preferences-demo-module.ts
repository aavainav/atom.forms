import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/** Registers a demo route showing what `IReportViewerComponent.onPreferencesChanged` raises as a form is worked on. */
export class PreferencesDemoModule implements IModule {
    readonly name = "preferences-demo";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
            path: "demo/preferences",
            lazy: () => import("./preferences-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(PreferencesDemoModule);
