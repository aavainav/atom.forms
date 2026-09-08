import { IModuleBootstrapper } from "@forms/workbench";

export const bootstrapper: IModuleBootstrapper = () => () => import(/* webpackChunkName: "s438-citation-form" */ "./module").then(module => module.S438CitationModule);