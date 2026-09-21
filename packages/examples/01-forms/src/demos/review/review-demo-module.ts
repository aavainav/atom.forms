import { IModule, IModuleConfigurator } from "@shrub/core";
import { ReportViewerModule } from "@forms/report-viewer";
import { IModuleBootstrapper, IWorkbenchConfiguration, WorkbenchModule } from "@forms/workbench";

/** Registers a demo route that lets you review a report as a reviewer would, and read the comments as the officer would. */
export class ReviewDemoModule implements IModule {
    readonly name = "review-demo";
    readonly dependencies = [ReportViewerModule, WorkbenchModule];

    async configure({ config }: IModuleConfigurator): Promise<void> {
        config.get<IWorkbenchConfiguration>(IWorkbenchConfiguration).registerRoute({
            path: "demo/review",
            lazy: () => import("./review-demo-page").then(module => ({ Component: module.default }))
        });
    }
}

export const bootstrapper: IModuleBootstrapper = () => () => Promise.resolve(ReviewDemoModule);
