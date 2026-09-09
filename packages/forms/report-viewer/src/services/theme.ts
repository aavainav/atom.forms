import { EventEmitter, IEvent } from "@common/event-emitter";
import { createService, Singleton } from "@shrub/core";

export const IThemeService = createService<IThemeService>("report-viewer-theme-service");

/** The theme, or color mode, the application is rendered in. */
export type Theme = "dark" | "light";

/** Defines a service for broadcasting the theme the application is rendered in. */
export interface IThemeService {
    /** An event that is raised when the theme has changed. */
    readonly onThemeChanged: IEvent<Theme>;
    /** The theme the application is currently rendered in. */
    readonly theme: Theme;

    /** Sets the theme to render the application in. */
    setTheme(theme: Theme): void;
    /** Switches between the day and night themes. */
    toggleTheme(): void;
}

@Singleton
export class ThemeService implements IThemeService {
    private readonly _themeChanged = new EventEmitter<Theme>("theme-changed");
    private _theme: Theme = "light";

    get onThemeChanged(): IEvent<Theme> {
        return this._themeChanged.event;
    }

    get theme(): Theme {
        return this._theme;
    }

    setTheme(theme: Theme): void {
        if (theme === this._theme) {
            return;
        }

        this._theme = theme;

        // bootstrap resolves its color mode from this attribute, and the whole app is rendered beneath the
        // document root, so the host's own chrome follows the theme along with the report viewer. the viewer
        // never owns the document, which is why this is stamped rather than rendered onto an element of its own.
        document.documentElement.setAttribute("data-bs-theme", theme);

        this._themeChanged.emit(theme);
    }

    toggleTheme(): void {
        this.setTheme(this._theme === "dark" ? "light" : "dark");
    }
}
