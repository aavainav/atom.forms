import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "printing" */ "./module").then(module => module.PrintingModule);
