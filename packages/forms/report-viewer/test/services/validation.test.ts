import { describe, expect, it, vi } from "vitest";
import { RuleIssueCollection } from "@forms/core";
import type { IControllerManager, IRuleIssue } from "@forms/core";

import { ValidationService } from "../../src/services/validation";

const issue = { field: { name: "firstName" }, message: "Required.", section: {}, severity: 0 } as IRuleIssue;

/** Controllers that answer only what validating asks of them, with the rules finding the given issues. */
function stubControllers(issues: RuleIssueCollection) {
    const validate = vi.fn();
    const update = vi.fn();
    const controllers = {
        getFormController: () => ({ update }),
        getRulesController: () => ({ getIssueCollection: () => issues, validate })
    } as unknown as IControllerManager;

    return { controllers, update, validate };
}

describe("ValidationService", () => {
    describe("showIssues", () => {
        it("raises the issues for whoever is listening", () => {
            const service = new ValidationService();
            const shown: Array<ReadonlyArray<IRuleIssue>> = [];
            service.onShowIssues(issues => shown.push(issues));

            service.showIssues([issue]);

            expect(shown).toEqual([[issue]]);
        });
    });

    describe("validate", () => {
        it("runs the rules and answers with what they found", () => {
            const issues = new RuleIssueCollection([issue]);
            const { controllers, validate } = stubControllers(issues);

            expect(new ValidationService().validate(controllers)).toBe(issues);
            expect(validate).toHaveBeenCalledTimes(1);
        });

        it("shows what the rules found, after running them", () => {
            const { controllers, validate } = stubControllers(new RuleIssueCollection([issue]));
            const service = new ValidationService();
            const shown = vi.fn();
            service.onShowIssues(shown);

            service.validate(controllers);

            expect(shown).toHaveBeenCalledWith([issue]);
            expect(validate.mock.invocationCallOrder[0]).toBeLessThan(shown.mock.invocationCallOrder[0]);
        });

        it("shows a clean result too, so a panel showing the last one is cleared", () => {
            const { controllers } = stubControllers(new RuleIssueCollection());
            const service = new ValidationService();
            const shown = vi.fn();
            service.onShowIssues(shown);

            service.validate(controllers);

            expect(shown).toHaveBeenCalledWith([]);
        });

        it("marks the failing fields on the form through the form controller", () => {
            const issues = new RuleIssueCollection([issue]);
            const { controllers, update } = stubControllers(issues);

            new ValidationService().validate(controllers);

            const form = { validate: vi.fn(() => "validated") };
            expect(update.mock.calls[0][0].update(form)).toBe("validated");
            expect(form.validate).toHaveBeenCalledWith(issues);
        });
    });
});
