import React, { useEffect, useState } from "react";
import {
    FieldModel,
    FControlBorderEdges,
    IOptionValue,
    OptionFieldModel,
    TValueType,
    FBorder,
    FFieldControl,
    FFieldInput,
    FFieldSelect,
    FFormStackPanel,
    FLabel
} from "@forms/core";

/** The width of a code box, sized for the two-digit codes the report's legends are numbered with. */
const codeBoxWidth = 44;

/**
 * Loads a value list, answering with an empty list until it resolves.
 *
 * The legend a box is printed beside is the list itself, so it is rendered from the same options the box chooses
 * from rather than restated as text - one place for the codes, and a legend that cannot drift from what the box
 * will accept.
 */
export function useOptions(load: () => Promise<Array<IOptionValue>>): Array<IOptionValue> {
    const [options, setOptions] = useState<Array<IOptionValue>>([]);

    useEffect(() => {
        let isCurrent = true;

        load().then(
            resolved => { if (isCurrent) { setOptions(resolved); } },
            () => { /* a list that will not load leaves the legend empty rather than failing the page */ });

        return () => { isCurrent = false; };
    }, [load]);

    return options;
}

interface ICodeBoxProps {
    /** The option field the box holds. */
    readonly field: OptionFieldModel;
    /** Loads the list's options. */
    readonly load: () => Promise<Array<IOptionValue>>;
    /** The label printed above the box, for a box that carries one of its own. */
    readonly label?: string;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** Closes the box on top of whatever the field itself says, for a box another answer on the form has made moot. */
    readonly disabled?: boolean;
    /** Exact width in pixels; wide enough for a two-digit code by default. */
    readonly width?: number;

    onChange: (value: IOptionValue) => void;
}

/**
 * One of the report's code boxes.
 *
 * The box shows the code alone, as the printed form does, while the menu it opens shows each code with its
 * description so the officer need not read the legend to choose.
 */
export const CodeBox = ({ disabled, field, load, label, borderEdges, width = codeBoxWidth, onChange }: ICodeBoxProps): React.JSX.Element => (
    <FFieldControl width={width} label={label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldSelect
            id={field.id}
            disabled={disabled || !field.getIsEnabled()}
            format="valueOnly"
            invalid={field.getHasError()}
            options={load}
            searchable
            value={field.getValue()}
            onChange={(value) => onChange(value as IOptionValue)}
        />
    </FFieldControl>
);

interface ICodeLegendProps {
    /** The options to print, in the order the list carries them. */
    readonly options: ReadonlyArray<IOptionValue>;
    /** How many columns the codes are laid out in; two by default, as most of the form's legends are. */
    readonly columns?: number;
}

/**
 * The list of codes the form prints beside a code box, laid out in columns the way the paper form lays them out.
 *
 * A long description wraps rather than pushing the block wider: the page is a fixed 1024px, and the longest of
 * these lists is fifty-seven codes, so a legend that refused to wrap would run off the page it is printed on.
 */
export const CodeLegend = ({ options, columns = 2 }: ICodeLegendProps): React.JSX.Element => (
    <div className="f-code-legend flex-fill px-2 py-1" style={{ columnCount: columns, columnGap: "1rem", minWidth: 0 }}>
        {options.map(option => (
            <div key={option.value} className="fs-6 text-secondary">
                <span className="fw-bold">{option.value}</span> {option.description}
            </div>
        ))}
    </div>
);

interface ICodedFieldProps extends ICodeBoxProps {
    /** How many columns the legend is laid out in; two by default. */
    readonly columns?: number;
    /** The heading printed above the box and its legend, as the form prints it. */
    readonly title: string;
}

/** A code box with its heading and the legend printed beside it, which is how the report presents most of its coded fields. */
export const CodedField = ({ columns, disabled, field, load, title, borderEdges, width, onChange }: ICodedFieldProps): React.JSX.Element => {
    const options = useOptions(load);

    return (
        <FBorder borderEdges={borderEdges}>
            <FLabel fontSize="6" textAlignment="center"><span className="fw-bold">{title}</span></FLabel>
            <FFormStackPanel direction="horizontal">
                <CodeBox
                    disabled={disabled}
                    field={field}
                    load={load}
                    width={width}
                    borderEdges={["top", "right"]}
                    onChange={onChange}
                />
                <CodeLegend options={options} columns={columns} />
            </FFormStackPanel>
        </FBorder>
    );
};

interface ITextFieldProps {
    /** The field the box holds; a number field's value is written back as a number. */
    readonly field: FieldModel<TValueType>;
    /** Which edges of the border are drawn; the whole border by default. */
    readonly borderEdges?: FControlBorderEdges;
    /** Exact height in pixels. */
    readonly height?: number;
    /** The label printed above the box; the field's own label by default. */
    readonly label?: string;
    /** The maximum number of characters the box accepts. */
    readonly maxlength?: number;
    /** Exact width in pixels. */
    readonly width?: number;

    onChange: (value: string) => void;
}

/** One of the report's write-in boxes, labelled the way the form labels it. */
export const TextField = ({ field, borderEdges, height, label, maxlength, width, onChange }: ITextFieldProps): React.JSX.Element => (
    <FFieldControl width={width} height={height} label={label ?? field.label} labelFor={field.id} borderEdges={borderEdges}>
        <FFieldInput
            id={field.id}
            disabled={!field.getIsEnabled()}
            invalid={field.getHasError()}
            maxlength={maxlength}
            value={field.getValue()}
            onChange={onChange}
        />
    </FFieldControl>
);
