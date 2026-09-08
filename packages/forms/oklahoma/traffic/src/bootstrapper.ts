import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "ok-traffic-form" */ "./module").then(module => module.OKTrafficModule);
