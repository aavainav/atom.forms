import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";

import { FTooltip } from "../tooltip";
import { buildClasses } from "../../utils/class-names";
import { IFilterable, IFilterRef, Filter } from "../../utils/filterable";
import { getMarginClasses, getPaddingClasses, FMarginSize, FPaddingSize, IFMargin, IFPadding } from "../../utils/spacing";

export type FIconColor = "primary" | "secondary" | "success" | "info" | "warning" | "danger" | "light" | "dark";
export type FInputAutocomplete = "off" | "on";
export type FInputFontWeight = "normal" | "bold";
export type FInputType = "text" | "number" | "email" | "date";

export interface IAsyncCallback<TResult = any> {
    /** The minimum number of characters before the input callback is invoked. */
    readonly minChars?: number;
    /** An optional callback that will be invoked on a successful callback operation. */
    readonly result?: (value: TResult) => void;
    input(input: string, value: any): Promise<TResult>;
}

export interface IFieldInputFilterTarget<TData> {
    /** The minimum number of characters before the filter is applied to the target. */
    readonly minChars?: number;
    /** Allows preparing the input value before the filter is applied; the value returned is the input that will be passed to the current filter. */
    readonly prepare?: (input: string) => string;
    readonly target: IFilterable<TData>;
    readonly filter: (input: string, value: any, data: TData) => boolean;
}

export interface IFieldInputComponent {
    focus(): void;
}

export interface IFormatOptions {
    readonly partial: boolean;
}

export interface IInputFormatter {
    (value: string, options: IFormatOptions): string | undefined;
}

export interface IValueConverter {
    readonly toPropertyValue?: (value: string) => any;
    readonly fromPropertyValue?: (value: any) => string;
}

const defaultMinChars = 3;

function isSymbol(char: string, symbols: string[]): boolean {
    return symbols.indexOf(char) > -1;
}

function isAlphanumericKey(key: string): boolean {
    const value = key.length === 1 ? key.charCodeAt(0) : 0;
    return (value >= 65 && value <= 90) || (value >= 97 && value <= 122);
}

function isNumericKey(key: string): boolean {
    const value = key.length === 1 ? key.charCodeAt(0) : 0;
    return value >= 48 && value <= 57;
}

function isValidKey(key: string, alphanumeric: boolean, number: boolean, symbols: string[]): boolean {
    if (number && alphanumeric && !symbols.length) {
        return true;
    }

    return isSymbol(key, symbols) || (number && isNumericKey(key)) || (alphanumeric && isAlphanumericKey(key));
}

function advanceCaret(target: HTMLInputElement, symbols: string[]): void {
    if (target.selectionStart === target.selectionEnd) {
        let index = target.selectionStart || 0;
        while (index < target.value.length - 1 && isSymbol(target.value[index + 1], symbols)) {
            index++;
        }

        target.setSelectionRange(index, index);
    }
}

function formatValue(value: string, partial: boolean, formatter: IInputFormatter | undefined): string {
    return formatter ? formatter(value, { partial }) || value : value;
}

function getInputValue(value: any, converter: IValueConverter | undefined, formatter: IInputFormatter | undefined): string {
    let input = "";

    if (value !== undefined && value !== null) {
        if (converter?.fromPropertyValue) {
            input = converter.fromPropertyValue(value);
        }
        else if (typeof value.toString === "function") {
            input = value.toString();
        }
        else {
            throw new Error(`Invalid value type (${typeof value}), a value converter is expected.`);
        }
    }

    return formatValue(input, /* partial */ true, formatter);
}

interface IFFieldInputProps {
    /** Whether alphanumeric letters are accepted as input. Defaults to true. */
    readonly alphanumeric?: boolean;
    /** Configuration for invoking an async callback (e.g. a lookup) once the input reaches the minimum number of characters. */
    readonly async?: IAsyncCallback;
    /** The browser autocomplete behavior for the input. Forced to "off" while `async` is set. Defaults to "on". */
    readonly autocomplete?: FInputAutocomplete;
    /** Whether the input receives focus automatically when it mounts. */
    readonly autofocus?: boolean;
    /** Additional CSS class(es) applied to the input element. */
    readonly className?: string;
    /** Whether the input value is cleared when the input loses focus. */
    readonly clearOnBlur?: boolean;
    /** Converts between the displayed input string and the bound property value. */
    readonly converter?: IValueConverter;
    /** Whether the input is disabled. */
    readonly disabled?: boolean;
    /** Whether a clear affordance (icon and Escape key) is enabled while the input has a value. */
    readonly enableClear?: boolean;
    /** A filterable target that is filtered using the current input value as the user types. */
    readonly filterFor?: IFieldInputFilterTarget<any>;
    /** The font weight applied to the input text. Defaults to "bold". */
    readonly fontWeight?: FInputFontWeight;
    /** Formats the input value as the user types and again, non-partially, on blur. */
    readonly formatter?: IInputFormatter;
    /** An icon class name displayed alongside the input. */
    readonly icon?: string;
    /** The color applied to the icon. */
    readonly iconColor?: FIconColor;
    /** Tooltip text displayed for the icon. */
    readonly iconTooltip?: string;
    /** The id attribute applied to the input element. */
    readonly id?: string;
    /** Whether the input is marked as invalid. */
    readonly invalid?: boolean;
    /** The margin applied to the input. A bare size applies to all four sides. */
    readonly margin?: FMarginSize | IFMargin;
    /** The maximum value accepted by the input. */
    readonly max?: number | string;
    /** The maximum number of characters accepted by the input. */
    readonly maxlength?: number | string;
    /** Whether numeric digits are accepted as input. Defaults to true. */
    readonly number?: boolean;
    /** The padding applied to the input. A bare size applies to all four sides. Defaults to `ps-2 pt-3 pe-2 pb-1`. */
    readonly padding?: FPaddingSize | IFPadding;
    /** Placeholder text displayed when the input is empty. */
    readonly placeholder?: string;
    /** Whether the placeholder text is styled in italics. */
    readonly placeholderItalic?: boolean;
    /** Additional characters, beyond letters and digits, accepted as input. */
    readonly symbols?: string[];
    /** The input type attribute. Defaults to "text". */
    readonly type?: FInputType;
    /** Whether the input is marked as valid. */
    readonly valid?: boolean;
    /** The bound property value displayed in the input. */
    readonly value?: any;

    /** Invoked with the converted property value whenever the input value changes. */
    onChange?: (value: any) => void;
    /** Invoked when the input value is cleared. */
    onClear?: () => void;
    /** Invoked with the raw input string whenever the input value changes. */
    onInput?: (input: string) => void;
    /** Invoked on key down, after the Escape-to-clear behavior is handled. */
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Invoked on key press, after keys disallowed by `alphanumeric`/`number`/`symbols` are rejected. */
    onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Invoked on key up. */
    onKeyUp?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    /** Invoked with the result of the `async` callback. */
    onResult?: (result: any) => void;
}

const FFieldInput = forwardRef<IFieldInputComponent, IFFieldInputProps>(function FFieldInput({
    alphanumeric = true,
    async,
    autocomplete = "on",
    autofocus = false,
    className,
    clearOnBlur = false,
    converter,
    disabled = false,
    enableClear = false,
    filterFor,
    fontWeight = "bold",
    formatter,
    icon,
    iconColor,
    iconTooltip,
    id,
    invalid = false,
    margin,
    max,
    maxlength,
    number = true,
    padding,
    placeholder,
    placeholderItalic = false,
    symbols = [],
    type = "text",
    valid = false,
    value,
    onChange,
    onClear,
    onInput,
    onKeyDown,
    onKeyPress,
    onKeyUp,
    onResult,
}, ref) {
    const [displayValue, setDisplayValue] = useState<string>(() => getInputValue(value, converter, formatter));
    const displayValueRef = useRef(displayValue);
    displayValueRef.current = displayValue;

    const inputRef = useRef<HTMLInputElement>(null);
    const formatStateRef = useRef({ oldInput: "", oldSelectionStart: null as number | null, oldSelectionEnd: null as number | null });
    const cancelAsyncRef = useRef<() => void>(() => {});
    const filterRef = useRef<IFilterRef<any> | undefined>(undefined);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus()
    }), []);

    // keep the displayed value in sync whenever the bound value changes externally
    useEffect(() => {
        setDisplayValue(getInputValue(value, converter, formatter));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // remove any filter applied to the filter target when unmounting or when the target itself changes
    useEffect(() => {
        return () => {
            filterRef.current?.remove();
            filterRef.current = undefined;
        };
    }, [filterFor]);

    const applyFilter = useCallback((input: string, propertyValue: any): void => {
        if (!filterFor) {
            return;
        }

        const removeFilter = () => {
            if (filterRef.current) {
                filterRef.current.remove();
                filterRef.current = undefined;
            }
        };

        if (input && (!filterFor.minChars || input.length >= filterFor.minChars)) {
            const preparedInput = filterFor.prepare?.(input) || input;

            setTimeout(() => {
                if (!preparedInput) {
                    removeFilter();
                    return;
                }

                const predicate: Filter<any> = (data) => filterFor.filter(preparedInput, propertyValue, data);

                if (filterRef.current) {
                    filterRef.current.replace(predicate);
                }
                else {
                    filterRef.current = filterFor.target.applyFilter(predicate);
                }
            }, 0);
        }
        else {
            removeFilter();
        }
    }, [filterFor]);

    const commitInput = useCallback((input: string): void => {
        if (displayValueRef.current === input) {
            return;
        }

        displayValueRef.current = input;
        setDisplayValue(input);

        // convert the input value to the expected property value -- this is useful when converting to a different type or when formatting needs to be removed
        const propertyValue = converter?.toPropertyValue ? converter.toPropertyValue(input) : input;

        onChange?.(propertyValue);
        onInput?.(input);

        cancelAsyncRef.current();
        applyFilter(input, propertyValue);

        if (!input) {
            onClear?.();
            return;
        }

        if (!async || input.length < (async.minChars ?? defaultMinChars)) {
            return;
        }

        const cancelPromise = new Promise<void>((resolve) => { cancelAsyncRef.current = resolve; });

        Promise.race([cancelPromise, async.input(input, propertyValue)]).then((result) => {
            if (result) {
                async.result?.(result);
                onResult?.(result);
            }
        });
    }, [converter, onChange, onInput, applyFilter, async, onResult, onClear]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const target = event.target;

        if (formatter) {
            if (!target.value) {
                formatStateRef.current = { oldInput: target.value, oldSelectionStart: target.selectionStart, oldSelectionEnd: target.selectionEnd };
            }
            else {
                const result = formatter(target.value, { partial: true });

                if (result !== undefined) {
                    target.value = result;
                    advanceCaret(target, symbols);
                    formatStateRef.current = { oldInput: target.value, oldSelectionStart: target.selectionStart, oldSelectionEnd: target.selectionEnd };
                }
                else {
                    target.value = formatStateRef.current.oldInput || "";
                    target.setSelectionRange(formatStateRef.current.oldSelectionStart || 0, formatStateRef.current.oldSelectionEnd || 0);
                }
            }
        }

        commitInput(target.value);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>): void => {
        if (clearOnBlur) {
            commitInput("");
            return;
        }

        if (formatter) {
            // perform a non-partial formatting check on lost focus
            const result = formatter(event.target.value, { partial: false });

            if (result !== undefined) {
                event.target.value = result;
                commitInput(result);
            }
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Escape" && enableClear) {
            commitInput("");
        }

        onKeyDown?.(event);
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (!isValidKey(event.key, alphanumeric, number, symbols)) {
            event.preventDefault();
        }

        onKeyPress?.(event);
    };

    const showClear = enableClear && !!displayValue;

    const inputElement = (
        <input
            id={id}
            ref={inputRef}
            type={type}
            disabled={disabled}
            // turn autocomplete off when async
            autoComplete={async ? "off" : autocomplete}
            autoFocus={autofocus}
            placeholder={placeholder}
            max={typeof max === "string" ? parseInt(max, 10) : max}
            maxLength={typeof maxlength === "string" ? parseInt(maxlength, 10) : maxlength}
            value={displayValue}
            className={buildClasses(
                "f-field-input", "form-control", "border-0", "bg-transparent", "rounded-0",
                getMarginClasses(undefined, margin),
                getPaddingClasses({ start: "2", top: "3", end: "2", bottom: "1" }, padding),
                fontWeight === "bold" ? "fw-bold" : "",
                fontWeight === "normal" ? "fw-normal" : "",
                invalid ? "is-invalid" : "",
                valid ? "is-valid" : "",
                placeholderItalic ? "italic" : "",
                className
            )}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onKeyPress={handleKeyPress}
            onKeyUp={onKeyUp}
        />
    );

    if (!icon) {
        return inputElement;
    }

    const iconElement = showClear
        ? <i className="bi-x" style={{ cursor: "pointer" }} onClick={() => commitInput("")} />
        : <i className={buildClasses(icon, iconColor ? `text-${iconColor}` : "")} />;

    return (
        <div className="input-group form-input-group">
            {inputElement}
            <div className="input-group-append">
                <span className="input-group-text bg-transparent">
                    {iconTooltip && !showClear ? <FTooltip title={iconTooltip}>{iconElement}</FTooltip> : iconElement}
                </span>
            </div>
        </div>
    );
});

export default FFieldInput;
