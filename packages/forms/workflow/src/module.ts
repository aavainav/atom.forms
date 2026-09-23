import { IModule, IServiceRegistration } from "@shrub/core";

import { IWorkflowService, WorkflowService } from "./services";

/** Registers the workflow service: what a form with a workflow can do now, and what doing it changes. */
export class WorkflowModule implements IModule {
    readonly name = "workflow";

    configureServices(registration: IServiceRegistration): void {
        registration.register<IWorkflowService, WorkflowService>(IWorkflowService, WorkflowService);
    }
}
