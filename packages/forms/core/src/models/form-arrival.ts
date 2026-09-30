/** How a form came to be shown, as whoever loaded it said. `formId` is the form it is about, so a form that arrives some other way is not taken for this one. */
export type FormArrival =
    /** Read from a record the host held; the counts are what came with it. */
    | { readonly kind: "loaded"; readonly formId: string; readonly auditRecords: number; readonly comments: number; readonly transitions: number }
    /** Begun without one: `open` when there was nothing to load, `new` when the user started a new form, from `template` and as `variant` when they picked them. */
    | { readonly kind: "started"; readonly formId: string; readonly reason: "new" | "open"; readonly template?: string; readonly variant?: string };
