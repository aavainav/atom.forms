/**
 * The current user's own settings, carried on the controller manager rather than the form -- they follow the
 * officer across every report they open, not just the one on screen. `@forms/core` never persists this itself
 * (it has no shrub dependency); a host or `@forms/report-viewer`'s own default resolves it and hands it to
 * `IControllerManager.setPreferences`.
 */
export interface IUserPreferences {
    /** The violation codes an officer has starred, per violation list id, for quicker reach in a long list. */
    readonly violationFavorites: Readonly<Record<string, ReadonlyArray<string>>>;
}
