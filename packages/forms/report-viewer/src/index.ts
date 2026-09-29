export * from "./module";
export * from "./services";
export * from "./components";

// so a host can subscribe without depending on @forms/audit
export { IAuditService } from "@forms/audit";
export type { AuditRecord, IAuditFormIdentity } from "@forms/audit";

// so a host can keep comments beside a record without depending on @forms/review
export type { IReviewComment, ReviewTarget } from "@forms/review";

// so a host can say who is using a report, or read what onPreferencesChanged raises, without reaching into core
export type { IActor, IUserPreferences } from "@forms/core";
