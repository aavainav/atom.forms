import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "ok-parking-form" */ "./module").then(module => module.OKParkingModule);
