import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "tr310-crash-form" */ "./module").then(module => module.TR310Module);
