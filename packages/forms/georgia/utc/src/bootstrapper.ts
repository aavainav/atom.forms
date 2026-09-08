import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "ga-utc-form" */ "./module").then(module => module.GAUTCModule);
