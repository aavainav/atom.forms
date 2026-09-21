/**
 * Who did something to a report: a user, as the host identifies them. It is copied onto what the user does rather than
 * looked up later, so a report keeps who they were when they acted -- a change of rank afterwards does not rewrite it.
 */
export interface IActor {
    /** The agency the user serves, as the host names it: its name, or its identifier. */
    readonly agency?: string;
    /** The user's badge or employee number. */
    readonly badgeId?: string;
    /** The host's identifier for the user, which stays the same when their name changes. */
    readonly id: string;
    /** What the user is called, for showing beside what they did. */
    readonly name: string;
    /** The user's rank or title when they acted, such as "Sergeant". */
    readonly rank?: string;
}
