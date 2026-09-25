import { IActor } from "@forms/core";

/** The officer who writes a report and makes the moves an author makes. */
export const fry: IActor = { agency: "Planet Express", badgeId: "2999", id: "fry", name: "Philip J. Fry", rank: "Delivery Boy" };

/** The reviewer who comments on a report and makes the moves a reviewer makes. */
export const hermes: IActor = { agency: "Central Bureaucracy", badgeId: "36", id: "bureaucrat-conrad", name: "Hermes Conrad", rank: "Grade 36 Bureaucrat" };

/** The judge who reads the report as the court sees it. */
export const whitey: IActor = { agency: "New New York Municipal Court", id: "judge-whitey", name: "Judge Whitey" };
