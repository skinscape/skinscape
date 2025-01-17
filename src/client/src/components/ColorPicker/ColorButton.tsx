import React, {useEffect, useRef, useState} from "react";
import { colord, RgbaColor } from "colord";
import {useColorContext} from "../../stores.ts";
import {getContrastingColor, noContextMenu} from "../../utils/helpers.ts";

type ColorButtonProps = {
    rgba: RgbaColor,
    setRgba: (rgba: RgbaColor) => void,
};

export const ColorButton: React.FC<ColorButtonProps> = ({
    rgba, setRgba
}) => {
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value.replace(/[^A-Fa-f0-9]/g, "").toUpperCase();
        setInputValue(value);
        const color = colord(`#${value}`);
        if (value.length >= 6 && color.isValid()) {
            setRgba(color.toRgb());
        }
    }

    function onKeyUp(event: React.KeyboardEvent) {
        if (event.key === "Enter") {
            // Blur element on enter
            inputRef.current?.blur();
        }
    }

    function onBlur() {
        setInputValue(colord(rgba).toHex().substring(1).toUpperCase());
    }

    function onClick(event: React.MouseEvent) {
        inputRef.current?.focus();
        inputRef.current?.select();
        event.stopPropagation();
    }

    useEffect(() => {
        setInputValue(colord(rgba).toHex().substring(1).toUpperCase());
    }, [rgba]);

    const style = {
        "--color": colord(rgba).toHex(),
        "--solid": colord(rgba).alpha(1).toHex(),
        "--inverted": colord(getContrastingColor(rgba)).toHex(),
    } as React.CSSProperties;

    return (
        <div
            className="color-button border"
            onClick={onClick}
            style={style}
        >
            <span className="text">#</span><input
            className="text"
            ref={inputRef}
            value={inputValue}
            onChange={onChange}
            onKeyUp={onKeyUp}
            onBlur={onBlur}
            onClick={onClick}
            onContextMenu={noContextMenu}
            onKeyDown={e => e.stopPropagation()}
            spellCheck={false}
            maxLength={8}
        />
        </div>
    )
}