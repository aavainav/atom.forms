import { IModuleSettingsCollection, ModuleDependency, ModuleInstanceOrConstructor, ModuleLoader } from "@shrub/core";
import { WorkbenchModule } from "./module";

/** A function that returns an async module instance or constructor. */
export type ModuleImportFunction = () => Promise<ModuleInstanceOrConstructor>;

export interface IModuleBootstrapper {
    (): ModuleImportFunction | undefined;
}

/** Defines options for loading the workbench bootstrapper. */
export interface IWorkbenchBootstrapperOptions {
    readonly bootstrappers: IModuleBootstrapper[];
    readonly settings: IModuleSettingsCollection;
}

export namespace WorkbenchBootstrapper {
    export async function start(options: IWorkbenchBootstrapperOptions): Promise<void> {
        const modules: ModuleDependency[] = [WorkbenchModule];
        for (const bootstrapper of options.bootstrappers) {
            const result = bootstrapper();
            if (result) {
                modules.push(result);
            }
        }

        await ModuleLoader
            .useModules(modules)
            .useSettings(options.settings)
            .load();
    }
}
