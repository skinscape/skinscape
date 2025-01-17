import "./style.scss";

import React, { useEffect, useRef, useState } from "react";

import { useWindowEvent } from "../../hooks/useWindowEvent";
import { noContextMenu } from "../../utils/helpers.ts";
import { Indicator } from "../Indicator";
import { HsvaColor } from "colord";

type ColorValueSliderProps = {
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => void
};

export const ColorValueSlider: React.FC<ColorValueSliderProps> = ({
    hsva, setHsva
}) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const button = useRef(-1);
    const divRef = useRef<HTMLDivElement>(null);

    function onMouseDown(event: React.MouseEvent) {
        button.current = event.button;
        if (button.current !== -1) {
            document.getElementById("color-cursor-overlay")!.style.display = "block";
            updateValue(event.clientX);
        }
    }

    function updateValue(clientX: number) {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const v = Math.min(100, Math.max(0,
            (clientX - rect.left) / rect.width * 100
        ));

        const newHsva = { h: hsva.h, s: hsva.s, v, a: hsva.a };
        setHsva(newHsva);
    }

    function updatePos() {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const x = Math.floor(rect.width * hsva.v / 200) * 2;
        const y = rect.height / 2;
        setPos({ x, y });
    }

    useWindowEvent("mouseup", (event: MouseEvent) => {
        if (button.current === event.button) {
            document.getElementById("color-cursor-overlay")!.style.display = "none";
            button.current = -1;
        }
    });

    useWindowEvent("mousemove", (event: MouseEvent) => {
        if (button.current !== -1) updateValue(event.clientX);
    }, [hsva]);

    useWindowEvent("resize", updatePos);
    useEffect(() => updatePos, [hsva]);

    return (
        <div
            className="color-value-slider"
            tabIndex={0}
            ref={divRef}
            onMouseDown={onMouseDown}
            onContextMenu={noContextMenu}
        >
            <Indicator pos={pos}/>
        </div>
    )
}