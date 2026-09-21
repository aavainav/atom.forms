/** Who did something to a report: a user, as the host identifies them. */
export interface IActor {
    /** The host's identifier for the user, which stays the same when their name changes. */
    readonly id: string;
    /** What the user is called, for showing beside what they did. */
    readonly name: string;
}
