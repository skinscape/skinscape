import "./style.css";

import React, {useEffect, useRef, useState} from "react";
import {useWindowEvent} from "../../hooks/useWindowEvent";

type SliderProps = {
    value: number,
    min: number,
    max: number,
    onChange: (value: number) => void,
}

export const Slider: React.FC<SliderProps> = ({
    value, min, max, onChange
}) => {
    const button = useRef(-1);
    const divRef = useRef<HTMLDivElement>(null);
    const [x, setX] = useState<number>(0);

    function updateValue(clientX: number) {
        if (!divRef.current) return;
        const { left, width } = divRef.current.getBoundingClientRect();
        const pos = (clientX - left) / width;

        const value = pos * (max - min) + min + 0.5;
        const coerced = Math.min(max, Math.max(min, value));
        onChange(Math.floor(coerced));
    }

    function onMouseDown(event: React.MouseEvent) {
        button.current = event.button;
        updateValue(event.clientX);
    }

    useWindowEvent("mouseup", (event: MouseEvent) => {
        if (button.current === event.button) {
            document.getElementById("cursor-overlay")!.style.display = "none";
            button.current = -1;
        }
    });

    useWindowEvent("mousemove", (event: MouseEvent) => {
        if (button.current !== -1) updateValue(event.clientX);
    }, [value]);

    useEffect(() => {
        if (!divRef.current) return;
        const { width } = divRef.current.getBoundingClientRect();
        const pos = (value - min) / (max - min);

        setX(pos * width);
    }, [divRef, value]);

    const style = {
        width: `${x}px`
    } as React.CSSProperties;

    return (
        <div ref={divRef} className="slider border-small" onMouseDown={onMouseDown}>
            <span className="slider-text text">{value}</span>

            <div className="slider-fill" style={style} />
        </div>
    )
}