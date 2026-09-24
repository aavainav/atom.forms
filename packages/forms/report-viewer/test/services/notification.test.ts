import { beforeEach, describe, expect, it } from "vitest";

import type { IRuleIssue } from "@forms/core";
import type { IReportViewerNotification } from "../../src/services/notification";
import { NotificationService } from "../../src/services/notification";
import { ValidationService } from "../../src/services/validation";

describe("NotificationService", () => {
    let service: NotificationService;
    let raised: Array<IReportViewerNotification>;

    beforeEach(() => {
        service = new NotificationService();
        raised = [];
        service.onShowNotification(notification => { raised.push(notification); });
    });

    it("raises the notification it was given", () => {
        service.showNotification({ message: "Saved.", type: "success" });

        expect(raised).toEqual([{ message: "Saved.", type: "success" }]);
    });

    it("carries a title through when one is given", () => {
        service.showNotification({ message: "Could not save.", title: "Error", type: "danger" });

        expect(raised[0].title).toBe("Error");
    });

    it("raises once per notification, in order", () => {
        service.showNotification({ message: "First", type: "info" });
        service.showNotification({ message: "Second", type: "warning" });

        expect(raised.map(notification => notification.message)).toEqual(["First", "Second"]);
    });

    it("reaches every subscriber", () => {
        let second = 0;
        service.onShowNotification(() => { second += 1; });

        service.showNotification({ message: "Saved.", type: "success" });

        expect(raised).toHaveLength(1);
        expect(second).toBe(1);
    });

    it("raises nothing to a subscriber that has been removed", () => {
        let removed = 0;
        const listener = service.onShowNotification(() => { removed += 1; });

        listener.remove();
        service.showNotification({ message: "Saved.", type: "success" });

        expect(removed).toBe(0);
        expect(raised).toHaveLength(1);
    });
});

describe("ValidationService", () => {
    let service: ValidationService;
    let raised: Array<ReadonlyArray<IRuleIssue>>;

    beforeEach(() => {
        service = new ValidationService();
        raised = [];
        service.onShowIssues(issues => { raised.push(issues); });
    });

    it("raises the issues it was given", () => {
        const issues = [{ field: { name: "first-name" }, section: { name: "violator-section" }, message: "This field is required.", severity: 0 }] as Array<IRuleIssue>;

        service.showIssues(issues);

        expect(raised).toEqual([issues]);
    });

    /** Clearing the panel is showing an empty set, so it has to reach subscribers like any other result. */
    it("raises an empty set, which is how the panel is cleared", () => {
        service.showIssues([]);

        expect(raised).toEqual([[]]);
    });
});
