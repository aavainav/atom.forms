import { IModule, IServiceRegistration } from "@shrub/core";

import { AuditService, IAuditService } from "./services";

/** Registers the audit service. The controller registers itself with core, and whoever renders a form calls `useAuditRecorder`. */
export class AuditModule implements IModule {
    readonly name = "audit";

    configureServices(registration: IServiceRegistration): void {
        registration.register<IAuditService, AuditService>(IAuditService, AuditService);
    }
}
