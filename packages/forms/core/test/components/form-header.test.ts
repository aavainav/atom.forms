import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FFormHeader from "../../src/components/form-header/form-header";

type Props = Parameters<typeof FFormHeader>[0];

const render = (props: Props): string => renderToStaticMarkup(createElement(FFormHeader, props, createElement("button", undefined, "Submit for review")));

describe("FFormHeader", () => {
    it("shows its title", () => {
        expect(render({ title: "S438 Citation Form" })).toContain("S438 Citation Form");
    });

    it("shows no subtitle when it is given none", () => {
        expect(render({ title: "S438 Citation Form" })).not.toContain("f-form-header__subtitle");
    });

    it("shows its subtitle when it is given one", () => {
        expect(render({ title: "S438 Citation Form", subtitle: "in review" })).toContain("in review");
    });

    it("shows its actions", () => {
        expect(render({ title: "S438 Citation Form" })).toContain("<button>Submit for review</button>");
    });

    it("has no border under it by default, and has one when told to", () => {
        expect(render({ title: "S438 Citation Form" })).not.toContain("border-bottom");
        expect(render({ title: "S438 Citation Form", borderVisibility: "visible" })).toContain("border-bottom");
    });
});
