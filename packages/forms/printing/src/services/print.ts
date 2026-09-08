import { IFormCatalogItem } from "@forms/catalog";
import { IControllerManager, IFormIdentity, PrintLayout } from "@forms/core";
import { createService, Singleton } from "@shrub/core";

import { IPrintProfile, PrintOrientation, PrintPaper } from "../models/print-profile";
import { IPrintingOptions } from "../options";

export const IPrintService = createService<IPrintService>("forms-print-service");
export const IPrintRegistrationService = createService<IPrintRegistrationService>("forms-print-registration-service");

/** The id of the copy offered for a form that has registered none of its own. */
export const allPagesProfileId = "all-pages";

/** The element the `@page` rules for the print in progress are written into. */
const pageRulesElementId = "f-print-page-rules";

/** The class the page collection renders its printable pages under. */
const printElementSelector = ".f-print";

/** The margin left around the sheet, in inches, when neither the copy nor the module options name one. */
const defaultMargin = 0.4;

/** The gap between two pages printed beside one another, in CSS pixels, matching the 0.25in the stylesheet sets. */
const pageGap = 24;

/** The number of CSS pixels an inch maps to when printing. */
const pixelsPerInch = 96;

/**
 * The share of the sheet a copy is fitted into, leaving a little of it spare.
 *
 * The pages have to be measured on screen, but they are laid out again under print media before they are printed,
 * and that second layout is not identical: bootstrap ships print rules of its own, and a form page measures a few
 * percent taller under them. Fitting a copy to the last pixel of the sheet would therefore hand the printer
 * something slightly too big for it, and a copy that was meant to be one sheet would come out as two.
 */
const fitSafetyFactor = 0.95;

/** The printable sheet sizes, as [width, height] in CSS pixels at the 96dpi a browser maps print units by. */
const paperSizes: Record<PrintPaper, [number, number]> = {
    a4: [794, 1123],
    legal: [816, 1344],
    letter: [816, 1056]
};

/** Identifies what to print: which copy of the form, and the layout to print it in when the user chose one other than the copy's own. */
export interface IPrintRequest {
    /** The id of the copy to print. */
    readonly profileId: string;
    /** The layout to print in, overriding the one the copy declares. */
    readonly layout?: PrintLayout;
}

/** Defines a service for printing a form as one of the copies it publishes. */
export interface IPrintService {
    /** Gets the copies that can be printed for the given form, falling back to a single copy of every page when the form registered none. */
    getProfiles(catalogItem: IFormCatalogItem): Array<IPrintProfile>;
    /** Puts the form into its print layout, opens the browser's print dialog, and restores the form afterwards. */
    print(controllers: IControllerManager, catalogItem: IFormCatalogItem, request: IPrintRequest): Promise<void>;
}

/** Defines a service for registering the copies a form can be printed as. */
export interface IPrintRegistrationService {
    /**
     * Registers the copies that can be printed for the identified form. Only one set may be registered per identity,
     * and a form that registers none is offered a copy of every page instead.
     */
    registerProfiles(identity: IFormIdentity, profiles: ReadonlyArray<IPrintProfile>): void;
}

@Singleton
export class PrintService implements IPrintService, IPrintRegistrationService {
    private readonly _profiles: Map<string, ReadonlyArray<IPrintProfile>> = new Map<string, ReadonlyArray<IPrintProfile>>();

    constructor(
        @IPrintingOptions private readonly options: IPrintingOptions) {
    }

    getProfiles(catalogItem: IFormCatalogItem): Array<IPrintProfile> {
        const profiles = this._profiles.get(getProfileKey(catalogItem));

        if (profiles) {
            return [...profiles];
        }

        // every form prints, whether or not it has been given copies of its own; the fallback is the whole form,
        // which is also what a form whose parts are not yet known should print
        return [{
            id: allPagesProfileId,
            name: "All pages",
            description: "Every page of the form, one to a sheet.",
            layout: "top-down",
            pages: Array.from(this.getPageNames(catalogItem))
        }];
    }

    async print(controllers: IControllerManager, catalogItem: IFormCatalogItem, request: IPrintRequest): Promise<void> {
        const profile = this.getProfile(catalogItem, request.profileId);
        const layout = request.layout ?? profile.layout ?? "top-down";

        // a pair of pages beside one another is half again as wide as a sheet is tall, so a side-by-side copy that
        // names no orientation is turned on its side rather than being scaled down to a quarter of its size
        const orientation = profile.orientation ?? this.options.orientation ?? (layout === "side-by-side" ? "landscape" : "portrait");
        const paper = profile.paper ?? this.options.paper ?? "letter";
        const margin = this.options.margin ?? defaultMargin;

        this.validateProfile(catalogItem, profile);

        const controller = controllers.getPrintController();

        this.applyPageRules(orientation, paper, margin);
        controller.begin({ layout, pageNames: profile.pages, scale: profile.scale });

        try {
            await this.waitForLayout();

            if (profile.scale === undefined) {
                // the pages have to be laid out before they can be measured, so the scale that fits them onto the
                // sheet is applied as a second pass over the layout the first one produced
                controller.begin({ layout, pageNames: profile.pages, scale: this.getScale(layout, orientation, paper, margin) });
                await this.waitForLayout();
            }

            window.print();
        }
        finally {
            // window.print() blocks until the print dialog is dismissed, so by here the sheets have been rendered
            // and the form can go back to the way it was
            controller.end();
            this.removePageRules();
        }
    }

    registerProfiles(identity: IFormIdentity, profiles: ReadonlyArray<IPrintProfile>): void {
        // copies are always looked up against a resolved catalog item, which names a concrete version, so a set
        // registered without one could never be matched and would surface as a form that silently prints whole
        if (!identity.version) {
            throw new Error(`Print profiles must be registered with the version of the form they belong to, but those for ${identity.name} named none.`);
        }

        const key = getProfileKey(identity);

        if (this._profiles.has(key)) {
            throw new Error(`Print profiles for the form with the name of ${identity.name} and version ${identity.version} have already been registered.`);
        }

        const duplicate = profiles.find((profile, index) => profiles.findIndex(other => other.id === profile.id) !== index);

        if (duplicate) {
            throw new Error(`More than one print profile for ${identity.name} carries the id ${duplicate.id}.`);
        }

        this._profiles.set(key, profiles);
    }

    /** Writes the `@page` rules the print in progress needs, which cannot be selected by a class and so are swapped at print time. */
    private applyPageRules(orientation: PrintOrientation, paper: PrintPaper, margin: number): void {
        let element = document.getElementById(pageRulesElementId);

        if (!element) {
            element = document.createElement("style");
            element.id = pageRulesElementId;
            document.head.append(element);
        }

        element.textContent = `@page { size: ${paper} ${orientation}; margin: ${margin}in; }`;
    }

    /** Gets the names of the page types the given form carries, in the order the form declares them. */
    private getPageNames(catalogItem: IFormCatalogItem): Array<string> {
        return Array.from(new catalogItem.formFactory().getPageTypes().keys());
    }

    /** Gets the copy with the given id, which the dialog offering it read from this same service. */
    private getProfile(catalogItem: IFormCatalogItem, profileId: string): IPrintProfile {
        const profile = this.getProfiles(catalogItem).find(candidate => candidate.id === profileId);

        if (!profile) {
            throw new Error(`No print profile with the id of ${profileId} is registered for ${catalogItem.name}.`);
        }

        return profile;
    }

    /**
     * Measures the pages laid out for print and gets the factor that fits them onto one sheet. Pages are measured
     * rather than computed from the stylesheet's widths, since a page's height depends on what the form holds, and
     * a wrapped side-by-side row would report the width it wrapped to rather than the width it wants.
     */
    private getScale(layout: PrintLayout, orientation: PrintOrientation, paper: PrintPaper, margin: number): number | undefined {
        const element = document.querySelector(printElementSelector);
        const pages = element ? Array.from(element.children).filter((child): child is HTMLElement => child instanceof HTMLElement) : [];

        if (!pages.length) {
            return undefined;
        }

        const [sheetWidth, sheetHeight] = paperSizes[paper];
        const inset = margin * pixelsPerInch * 2;
        const printableWidth = (orientation === "landscape" ? sheetHeight : sheetWidth) - inset;
        const printableHeight = (orientation === "landscape" ? sheetWidth : sheetHeight) - inset;

        // a top-down copy puts each page on its own sheet, so only the widest page has to fit; a side-by-side one
        // has to fit the whole row, gaps included
        const contentWidth = layout === "side-by-side"
            ? pages.reduce((total, page) => total + page.offsetWidth, 0) + pageGap * (pages.length - 1)
            : Math.max(...pages.map(page => page.offsetWidth));

        const widthScale = printableWidth / contentWidth;

        // height is only binding for a side-by-side copy, where fitting the pages onto the one sheet is the whole
        // point of asking for it. a form page is far taller than it is wide - taller than a sheet, on the longer
        // citations - so holding a top-down copy to the height of a sheet as well would shrink it to a third of its
        // size for no gain: its pages already start on a fresh sheet, and one that runs long simply continues onto
        // the next, which is what printing a long page normally does.
        const heightScale = layout === "side-by-side"
            ? printableHeight / Math.max(...pages.map(page => page.offsetHeight))
            : 1;

        // a page is only ever shrunk to fit: printing a short form blown up to fill the sheet would be a surprise.
        // the safety factor is applied before the cap, so a copy that already fits comfortably still prints at its
        // natural size rather than being shrunk for no reason.
        return Math.min(widthScale * fitSafetyFactor, heightScale * fitSafetyFactor, 1);
    }

    /** Removes the `@page` rules written for the print that has finished, so they cannot affect the next one. */
    private removePageRules(): void {
        document.getElementById(pageRulesElementId)?.remove();
    }

    /** Fails the print rather than printing a blank sheet when a copy names a page the form does not carry. */
    private validateProfile(catalogItem: IFormCatalogItem, profile: IPrintProfile): void {
        const pageNames = this.getPageNames(catalogItem);
        const unknown = profile.pages.find(pageName => !pageNames.includes(pageName));

        if (unknown) {
            throw new Error(`The print profile ${profile.id} for ${catalogItem.name} names the page ${unknown}, which the form does not carry.`);
        }
    }

    /** Waits for the browser to lay out the pages the print controller has just asked for. */
    private waitForLayout(): Promise<void> {
        // the first frame runs before the render the controller scheduled has been painted, so the measurements are
        // taken on the second
        return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    }
}

/** Keys a set of copies by the form it belongs to. Registration rejects an identity without a version, so both sides of the lookup name a concrete one. */
function getProfileKey({ name, version }: IFormIdentity): string {
    return `${name}@${version}`;
}
