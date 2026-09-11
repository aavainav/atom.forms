import { beforeEach, describe, expect, it } from "vitest";

import type { Theme } from "../../src/services/theme";
import { ThemeService } from "../../src/services/theme";

describe("ThemeService", () => {
    let service: ThemeService;
    let raised: Array<Theme>;

    beforeEach(() => {
        document.documentElement.removeAttribute("data-bs-theme");

        service = new ThemeService();
        raised = [];
        service.onThemeChanged(theme => { raised.push(theme); });
    });

    it("starts in the light theme", () => {
        expect(service.theme).toBe("light");
    });

    describe("setTheme", () => {
        it("changes the theme and raises onThemeChanged", () => {
            service.setTheme("dark");

            expect(service.theme).toBe("dark");
            expect(raised).toEqual(["dark"]);
        });

        /**
         * Bootstrap resolves its color mode from this attribute on the document root, so the host's own chrome
         * follows the theme along with the viewer.
         */
        it("stamps the theme onto the document root", () => {
            service.setTheme("dark");

            expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
        });

        it("does nothing when set to the theme already in use", () => {
            service.setTheme("light");

            expect(raised).toHaveLength(0);
            expect(document.documentElement.getAttribute("data-bs-theme")).toBeNull();
        });

        it("raises once per actual change", () => {
            service.setTheme("dark");
            service.setTheme("dark");
            service.setTheme("light");

            expect(raised).toEqual(["dark", "light"]);
        });
    });

    describe("toggleTheme", () => {
        it("switches from light to dark and back", () => {
            service.toggleTheme();
            expect(service.theme).toBe("dark");

            service.toggleTheme();
            expect(service.theme).toBe("light");
        });

        it("raises for each switch and stamps the document root", () => {
            service.toggleTheme();

            expect(raised).toEqual(["dark"]);
            expect(document.documentElement.getAttribute("data-bs-theme")).toBe("dark");
        });
    });
});
