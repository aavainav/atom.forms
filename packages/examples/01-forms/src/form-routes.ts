import { IFormIdentity } from "@forms/core";

/** Where one catalog form is reachable in this app. */
export interface IFormRoute {
    /** The form the route renders. The version is pinned so the route cannot drift onto a newer one the catalog picks up. */
    readonly identity: Required<IFormIdentity>;
    /** The route's path, relative to the app's root route. */
    readonly path: string;
}

/**
 * Every catalog form this app routes to.
 *
 * Routing belongs to the host now -- a form package registers nothing but its catalog item -- so this table is the
 * one place the app decides where a form lives. It is read twice: once to register the routes, and once by the home
 * page to build its menu. A form registered with the catalog but missing from here is still listed on the home
 * page, marked as having no route, so a form added without a route shows as a visible gap rather than vanishing --
 * unless it's listed in `disabledForms` below, which marks the gap as deliberate.
 */
export const formRoutes: ReadonlyArray<IFormRoute> = [
    { identity: { name: "SC Form 432 - Public Contact / Warning", version: "1.0" }, path: "sc/432" },
    { identity: { name: "S438 Citation Form", version: "1.0" }, path: "sc/s438" },
    { identity: { name: "SC TR-310 - Traffic Collision Report", version: "1.0" }, path: "sc/tr310" }
];

/** A catalog form deliberately left off `formRoutes`, with why -- so the home page can say so instead of treating it as a gap. */
export interface IDisabledForm {
    readonly name: string;
    readonly reason: string;
}

/** Forms with no route on purpose, not because a route was forgotten. */
export const disabledForms: ReadonlyArray<IDisabledForm> = [
    { name: "GA Uniform Traffic Citation", reason: "Under construction" },
    { name: "OKC Parking Violation", reason: "Under construction" },
    { name: "OKC Traffic Citation", reason: "Under construction" }
];

/** Returns the route for the given pathname, which is how the one route component resolves which form it is rendering. */
export function findFormRouteByPath(pathname: string): IFormRoute | undefined {
    const path = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
    return formRoutes.find(route => route.path === path);
}

/** Returns the absolute url for a catalog form's route, if this app routes to it. */
export function getFormRoutePath(name: string): string | undefined {
    const route = formRoutes.find(formRoute => formRoute.identity.name === name);
    return route && `/${route.path}`;
}

/** Returns why a catalog form has no route, if it's deliberately disabled rather than just missing an entry. */
export function getFormDisabledReason(name: string): string | undefined {
    return disabledForms.find(form => form.name === name)?.reason;
}
