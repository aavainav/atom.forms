export * from "./module";
export * from "./services";

// no bootstrapper: the report viewer mounts the recorder itself. importing the controller is what registers it with core.
export { editQuietPeriod, getAuditController, maxPendingRecords, AuditController } from "./controllers";
export type { IAuditController } from "./controllers";

export { useAuditRecorder } from "./hooks";

export type { AuditRecord, AuditRecordDetail, IAuditFormIdentity, IAuditRecordBase } from "./models";
