import { describe, expect, it } from "vitest";

import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { PageModel } from "../../src/models/page";
import { SectionCollection } from "../../src/models/section-collection";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";

/**
 * The smallest tree that exercises a section collection: one page carrying three rows of the same section, each
 * with a name field of its own. Built once, at module scope, for the same reason every fixture in this suite is.
 */
class TestForm extends FormModel<any> { }
class TestPage extends PageModel { }
class TestRowSection extends SectionModel { }

const formDefinition = DefinitionFactory.form("test-section-collection-form", TestForm, {});
const pageDefinition = DefinitionFactory.page("page", formDefinition, TestPage);
const rowsDefinition = DefinitionFactory.sectionCollection("rows", pageDefinition, TestRowSection, 3);
const fields = defineFields(rowsDefinition, {
    name: { label: "Name", ctor: StringFieldModel }
});

/** A real page, with its three rows already populated -- synchronous, since building the tree needs no await. */
function createPage(): TestPage {
    return new TestPage();
}

function nameOf(section: TestRowSection): string | Array<string> {
    return section.get<StringFieldModel>(fields.name).getValue();
}

function named(section: TestRowSection, value: string): TestRowSection {
    return section.set(fields.name, section.get<StringFieldModel>(fields.name).setValue(value));
}

describe("SectionCollectionDefinition", () => {
    it("creates exactly `count` sections", () => {
        const rows = createPage().get<SectionCollection<TestRowSection>>(rowsDefinition);

        expect(rows.getSections()).toHaveLength(3);
    });

    it("starts every section with the field's own default value", () => {
        const rows = createPage().get<SectionCollection<TestRowSection>>(rowsDefinition);

        expect(rows.getSections().map(nameOf)).toEqual(["", "", ""]);
    });

    it("gives each of the three sections its own identity, not one instance repeated", () => {
        const [first, second, third] = createPage().get<SectionCollection<TestRowSection>>(rowsDefinition).getSections();

        expect(first).not.toBe(second);
        expect(second).not.toBe(third);
    });

    it("is never shared -- there is no cross-page sharing for a section collection to ask of", () => {
        expect(rowsDefinition.isShared).toBe(false);
    });

    it("resolves back to its own page definition", () => {
        expect(rowsDefinition.getPageDefinition()).toBe(pageDefinition);
    });

    it("reports one field value per section it repeats, not just the first", () => {
        const page = createPage();
        const rows = page.get<SectionCollection<TestRowSection>>(rowsDefinition);
        const updated = page.set(rowsDefinition, rows.replace(2, named(rows.getSections()[2], "Dana")));

        expect(updated.getFields<StringFieldModel>(fields.name).map(field => field.getValue())).toEqual(["", "", "Dana"]);
    });
});

describe("SectionCollection", () => {
    function threeRows(): SectionCollection<TestRowSection> {
        return createPage().get<SectionCollection<TestRowSection>>(rowsDefinition);
    }

    it("replaces only the section at the given index", () => {
        const updated = threeRows().replace(1, named(threeRows().getSections()[1], "Riley"));

        expect(updated.getSections().map(nameOf)).toEqual(["", "Riley", ""]);
    });

    it("leaves the collection it was called on untouched", () => {
        const rows = threeRows();
        rows.replace(0, named(rows.getSections()[0], "Changed"));

        expect(nameOf(rows.getSections()[0])).toBe("");
    });

    it("throws replacing an index outside the collection", () => {
        const rows = threeRows();

        expect(() => rows.replace(3, rows.getSections()[0])).toThrow();
        expect(() => rows.replace(-1, rows.getSections()[0])).toThrow();
    });

    it("iterates the sections in order", () => {
        const rows = threeRows();

        expect([...rows]).toEqual(rows.getSections());
    });
});
