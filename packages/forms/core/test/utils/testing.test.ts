// @vitest-environment jsdom
import { describe, expect, it } from "vitest";

import { DefinitionFactory, defineFields } from "../../src/models/definition-factory";
import { FormModel } from "../../src/models/form";
import { HiddenFieldModel } from "../../src/models/hidden-field";
import { PageModel } from "../../src/models/page";
import { SectionModel } from "../../src/models/section";
import { StringFieldModel } from "../../src/models/string-field";
import { getRenderedHiddenFieldIds } from "../../src/utils/testing";

/**
 * The smallest tree that exercises a hidden field: one section carrying one ordinary field beside one hidden one.
 * Built once, at module scope, for the same reason every fixture in this suite is -- `Entity.set` validates a
 * child definition by reference identity, so a tree rebuilt per test would mint new definitions this section's
 * own instances no longer match.
 */
class TestForm extends FormModel<any> { }
class TestPage extends PageModel { }
class TestSection extends SectionModel { }

const formDefinition = DefinitionFactory.form("test-hidden-field-form", TestForm, {});
const pageDefinition = DefinitionFactory.page("page", formDefinition, TestPage);
const sectionDefinition = DefinitionFactory.section("section", pageDefinition, TestSection);
const fields = defineFields(sectionDefinition, {
    visible: { label: "Visible", ctor: StringFieldModel },
    hidden: { label: "Hidden", ctor: HiddenFieldModel }
});

/** A real section, with its hidden field already populated -- synchronous, since building the tree needs no await. */
function createSection(): TestSection {
    return new TestPage().get<TestSection>(sectionDefinition);
}

describe("getRenderedHiddenFieldIds", () => {
    it("reports nothing when the hidden field's id is not in the container", () => {
        const section = createSection();
        const container = document.createElement("div");

        expect(getRenderedHiddenFieldIds(container, section)).toEqual([]);
    });

    it("reports the hidden field's id when something in the container carries it", () => {
        const section = createSection();
        const id = section.get<HiddenFieldModel>(fields.hidden).id!;
        const container = document.createElement("div");
        container.innerHTML = `<input id="${id}" />`;

        expect(getRenderedHiddenFieldIds(container, section)).toEqual([id]);
    });

    it("never reports an ordinary field, even one rendered in the container", () => {
        const section = createSection();
        const id = section.get<StringFieldModel>(fields.visible).id!;
        const container = document.createElement("div");
        container.innerHTML = `<input id="${id}" />`;

        expect(getRenderedHiddenFieldIds(container, section)).toEqual([]);
    });
});
