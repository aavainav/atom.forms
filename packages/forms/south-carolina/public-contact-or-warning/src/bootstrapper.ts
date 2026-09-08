import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "public-contact-or-warning-form" */ "./module").then(module => module.PublicContactOrWarningModule);