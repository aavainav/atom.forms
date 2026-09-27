import { describe, expect, it } from "vitest";

import { CitationForm } from "../../src/models/citation-form";
import { DefinitionFactory } from "../../src/models/definition-factory";
import { withChanges } from "../../src/utils/clone";

/** A citation over no pages, whose setters only note that they were called, in order. */
class StampingCitationForm extends CitationForm<any> {
    public readonly stamped: ReadonlyArray<string> = [];

    public setDateOfViolation(): this { return this.note("date"); }
    public setIssuedDate(): this { return this.note("issued date"); }
    public setIssuedTime(): this { return this.note("issued time"); }
    public setTicketNumber(): this { return this.note("ticket number"); }
    public setTimeOfViolation(): this { return this.note("time"); }

    private note(stamp: string): this {
        return withChanges(this, { stamped: [...this.stamped, stamp] });
    }
}

// registers the form's definition once, at module scope -- Entity.set validates by reference identity
DefinitionFactory.form("test-stamping-citation", StampingCitationForm, {});

describe("CitationForm", () => {
    describe("initialize", () => {
        it("stamps the date and time of violation and the ticket number, in that order", async () => {
            const form = await new StampingCitationForm().initialize();

            expect(form.stamped).toEqual(["date", "time", "ticket number"]);
        });

        it("leaves the date and time of issue for the form to be issued", async () => {
            const form = await new StampingCitationForm().initialize();

            expect(form.stamped).not.toContain("issued date");
            expect(form.stamped).not.toContain("issued time");
        });
    });
});
