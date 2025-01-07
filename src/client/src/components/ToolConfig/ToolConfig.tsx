import "./style.css";

import React from "react";

import {useToolContext} from "../../stores.ts";
import {getTool} from "../../models/tool.ts";
import {Slider} from "../Slider";

export const ToolConfig: React.FC = () => {
    const { activeTool, toolProps, setToolProps } = useToolContext();

    const schema = getTool(activeTool).schema;
    // @ts-ignore
    const values = toolProps[activeTool];

    function setProp(key: string, value: any) {
        values[key] = value;
        setToolProps(toolProps);
    }

    return (
        <ul className="tool-config">
            {Object.entries(schema).map((
                [key, { name, type }]
            ) => (
                <li key={key}>
                    <label className="text">{name}</label>
                    {type.type === "value" ? (
                        <Slider
                            min={type.min}
                            max={type.max}
                            value={values[key] as number}
                            onChange={(value) => setProp(key, value)}
                        />
                    ) : type.type === "option" ? (
                        <OptionInput
                            options={type.options}
                            value={values[key] as string}
                            onChange={(value) => setProp(key, value)}
                        />
                    ) : null}
                </li>
            ))}
        </ul>
    );
}

type ValueInputProps = {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
};

const ValueInput: React.FC<ValueInputProps> = ({
    value, min, max, onChange
}) => (
    <div>
        <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
        />
        <span>{value}</span>
    </div>
);

type OptionInputProps = {
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

const OptionInput: React.FC<OptionInputProps> = ({
    value, options, onChange
}) => (
    <div>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
            {options.map((option) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    </div>
);