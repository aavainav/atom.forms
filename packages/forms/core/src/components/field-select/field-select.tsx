import { createPopper, Instance, Options, Placement } from "@popperjs/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FButton } from "../button";
import FFieldControl from "../field-control/field-control";
import FFieldInput, { IFieldInputComponent } from "../field-input/field-input";
import { IOptionValue } from "../../models/field";

import { buildClasses } from "../../utils/class-names";
import { getMarginStyle, getPaddingStyle, FMarginSize, FPaddingSize, IFMargin, IFPadding } from "../../utils/spacing";

export type { Placement };

/** Specifies how a selected value/description option is displayed: just the value, the value and description concatenated, or just the description. */
export type FSelectFormat = "valueOnly" | "valueAndDescription" | "descriptionOnly";

const eventListenerOptions = { passive: true, capture: true };

/** The number of matching options rendered at once when a select does not ask for another; the rest are reached by searching. */
const defaultMaxVisibleItems = 50;

/** Resolves the display text for the current selection according to the given format. */
function formatSelectedText(option: IOptionValue, format: FSelectFormat): string {
    if (format === "descriptionOnly") {
        return option.description;
    }

    return format === "valueOnly" ? option.value : getOptionText(option);
}

/** Resolves the text for an option in the dropdown menu, which always shows both the value and description. */
function getOptionText(option: IOptionValue): string {
    return `${option.value} - ${option.description}`;
}

/** An option field always holds a value/description pair, so a pair with neither half filled in is no selection at all. */
function hasSelection(option: IOptionValue): boolean {
    return !!option.value || !!option.description;
}

function isSelected(option: IOptionValue, value: IOptionValue | IOptionValue[] | undefined): boolean {
    if (!value) {
        return false;
    }

    return Array.isArray(value) ? value.some(selected => selected.value === option.value) : value.value === option.value;
}

interface IFFieldSelectProps {
    /** Disables the toggle button, preventing the menu from being opened. Default false. */
    readonly disabled?: boolean;
    /** Controls how the selected option's text is displayed; the dropdown menu always shows the value and description. The default is `"valueAndDescription"`. */
    readonly format?: FSelectFormat;
    /** The `id` attribute applied to the toggle button. */
    readonly id?: string;
    /** Applies invalid styling to the toggle button. Default false. */
    readonly invalid?: boolean;
    /** The margin applied to the toggle button. A bare size applies to all four sides. */
    readonly margin?: FMarginSize | IFMargin;
    /** The number of matching options shown at once, the rest being reached by searching; default 50. */
    readonly maxVisibleItems?: number;
    /** Popper.js placement of the dropdown menu relative to the toggle button; default `"bottom-start"`. */
    readonly menuPlacement?: Placement;
    /** Whether more than one option can be selected at a time; when true, `value`/`onChange` deal in arrays. Default false. */
    readonly multiple?: boolean;
    /** The selectable options, or a function that asynchronously loads them for `parentValue` when the menu is opened. */
    readonly options: IOptionValue[] | ((parentValue?: string) => Promise<IOptionValue[]>);
    /** The padding applied to the toggle button. A bare size applies to all four sides. */
    readonly padding?: FPaddingSize | IFPadding;
    /**
     * The value of the parent option this select's list hangs off, for a list that depends on another field.
     *
     * Passed straight to the loader, and included in the load effect's own dependencies -- a changed parent value
     * is what makes this select reload, without the loader itself needing to be rebuilt.
     */
    readonly parentValue?: string;
    /** Text shown when nothing is selected; default "Select...". */
    readonly placeholder?: string;
    /** Shows a search box to filter options by value/description; recommended for long option lists. Default false. */
    readonly searchable?: boolean;
    /** The currently selected option, or options when `multiple` is true. */
    readonly value?: IOptionValue | IOptionValue[];

    /** Called with the updated selection whenever the user selects or deselects an option. */
    onChange?: (value: IOptionValue | IOptionValue[]) => void;
}

/** A field control for selecting one or more value/description options, bound directly to a field model's value via `value`/`onChange`. */
export default function FFieldSelect({
    disabled = false,
    format = "valueAndDescription",
    id,
    invalid = false,
    margin,
    maxVisibleItems = defaultMaxVisibleItems,
    menuPlacement = "bottom-start",
    multiple = false,
    options,
    padding,
    parentValue,
    placeholder = "Select...",
    searchable = false,
    value,
    onChange
}: IFFieldSelectProps): React.JSX.Element {
    if (Array.isArray(value) && !multiple) {
        throw new Error("multiple must be true if value is an array.");
    }

    const [isOpen, setIsOpen] = useState(false);
    const [hasOpened, setHasOpened] = useState(false);
    const [loadedOptions, setLoadedOptions] = useState<Array<IOptionValue>>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const toggleRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const popperRef = useRef<Instance | undefined>(undefined);
    const searchInputRef = useRef<IFieldInputComponent>(null);

    // options load only once the menu has opened, so a select backed by a large lazy value list costs nothing on
    // a form nobody opens it on. The toggle's text reads off `value` directly, so an existing selection still
    // shows before that first load. The flag stays sticky rather than tracking `isOpen`, since a parent value
    // change must still reload while the menu is closed.
    useEffect(() => {
        if (!hasOpened) {
            return;
        }

        let isMounted = true;
        setIsLoading(true);

        const loadOptions = Array.isArray(options) ? Promise.resolve(options) : options(parentValue);

        loadOptions.then(resolved => {
            if (isMounted) {
                setLoadedOptions(resolved);
                setIsLoading(false);
            }
        });

        return () => { isMounted = false; };
    }, [hasOpened, options, parentValue]);

    const destroyPopper = useCallback((): void => {
        if (popperRef.current) {
            popperRef.current.destroy();
            popperRef.current = undefined;
        }
    }, []);

    const closeMenu = useCallback((): void => {
        setIsOpen(current => {
            if (!current) {
                return current;
            }

            destroyPopper();
            setSearchTerm("");
            return false;
        });
    }, [destroyPopper]);

    const toggleMenu = useCallback((): void => {
        setHasOpened(true);
        setIsOpen(current => !current);
    }, []);

    // create the popper instance once the menu is open and its elements exist
    useEffect(() => {
        if (!isOpen || !toggleRef.current || !menuRef.current) {
            return;
        }

        const popperOptions: Partial<Options> = { placement: menuPlacement };
        popperRef.current = createPopper(toggleRef.current, menuRef.current, popperOptions);
        popperRef.current.update();

        if (searchable) {
            requestAnimationFrame(() => searchInputRef.current?.focus());
        }

        return destroyPopper;
    }, [isOpen]);

    // close the menu on an outside click/focus
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const processEventTarget = (target: EventTarget): void => {
            if (menuRef.current && toggleRef.current && !menuRef.current.contains(target as Node) && !toggleRef.current.contains(target as Node)) {
                closeMenu();
            }
        };

        const onDocumentClick = (event: MouseEvent): void => { if (event.target) { processEventTarget(event.target); } };
        const onFocusIn = (event: FocusEvent): void => { if (event.target) { processEventTarget(event.target); } };

        document.addEventListener("click", onDocumentClick, eventListenerOptions);
        document.addEventListener("focusin", onFocusIn, eventListenerOptions);

        return () => {
            document.removeEventListener("click", onDocumentClick, eventListenerOptions);
            document.removeEventListener("focusin", onFocusIn, eventListenerOptions);
        };
    }, [isOpen, closeMenu]);

    const filteredOptions = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        if (!searchable || !query) {
            return loadedOptions;
        }

        return loadedOptions.filter(option =>
            option.value.toLowerCase().includes(query) || option.description.toLowerCase().includes(query));
    }, [loadedOptions, searchable, searchTerm]);

    // a long list is trimmed rather than rendered whole: a value list can run to thousands of options, and the
    // menu is meant to be narrowed by searching rather than scrolled end to end
    const visibleOptions = useMemo(() => filteredOptions.slice(0, maxVisibleItems), [filteredOptions, maxVisibleItems]);

    // the selection is read straight off `value` rather than looked up in the loaded list, so the toggle reads
    // correctly before the list loads, and a code the list no longer carries still shows instead of reading as unset
    const selectedOptions = useMemo(
        () => (value ? (Array.isArray(value) ? value : [value]) : []).filter(hasSelection),
        [value]);

    const title = selectedOptions.length === 0
        ? placeholder
        : selectedOptions.length === 1
            ? formatSelectedText(selectedOptions[0], format)
            : `${selectedOptions.length} selected`;

    const handleSelect = (option: IOptionValue): void => {
        if (multiple) {
            const current = Array.isArray(value) ? value : [];
            const updated = isSelected(option, value) ? current.filter(selected => selected.value !== option.value) : [...current, option];
            onChange?.(updated);
        } else {
            onChange?.(option);
            closeMenu();
        }
    };

    const toggleStyle: React.CSSProperties = {
        ...getMarginStyle(undefined, margin),
        ...getPaddingStyle(undefined, padding)
    };

    return (
        <div className="f-field-select">
            <div ref={toggleRef} className={isOpen ? "show" : ""} style={toggleStyle}>
                <FButton
                    id={id}
                    type="button"
                    className={buildClasses("f-field-select__toggle form-select", invalid ? "is-invalid" : "", "rounded-0")}
                    disabled={disabled}
                    variant="none"
                    onClick={toggleMenu}
                >
                    <span className={buildClasses("fw-bold", selectedOptions.length === 0 ? "text-muted" : "")}>{title}</span>
                </FButton>
            </div>
            <div
                ref={menuRef}
                className={buildClasses("f-field-select__dropdown-menu dropdown-menu dropdown-menu-stretch p-0", isOpen ? "show" : "")}
                style={{ margin: 0 }}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
            >
                {searchable && (
                    <div className="f-field-select__search">
                        <FFieldControl margin={10}>
                            <FFieldInput
                                ref={searchInputRef}
                                id={id ? `${id}-search` : undefined}
                                autocomplete="off"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={setSearchTerm}
                            />
                        </FFieldControl>
                    </div>
                )}
                <div className="f-field-select__options">
                    {isLoading ? (
                        <small className="text-muted fst-italic px-2">Loading...</small>
                    ) : visibleOptions.length > 0 ? (
                        visibleOptions.map((option, index) => (
                            <a
                                // the key carries the index since a caller's list may repeat a code; the items hold
                                // no state of their own and the list is replaced wholesale on every filter change,
                                // so there's nothing for an index key to tear
                                key={`${index}-${option.value}`}
                                href="#"
                                className="f-field-select__dropdown-item dropdown-item d-flex align-items-center justify-content-between"
                                onClick={(event) => { event.preventDefault(); handleSelect(option); }}
                            >
                                <span>{getOptionText(option)}</span>
                                {isSelected(option, value) && <i className="bi-check-circle-fill" />}
                            </a>
                        ))
                    ) : (
                        <small className="text-muted fst-italic px-2">No results found</small>
                    )}
                </div>
                {!isLoading && filteredOptions.length > visibleOptions.length && (
                    <small className="f-field-select__more d-block border-top text-muted fst-italic px-2 py-1">
                        Showing {visibleOptions.length} of {filteredOptions.length} &mdash; refine your search to see more.
                    </small>
                )}
            </div>
        </div>
    );
}
