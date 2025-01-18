import "./style.scss";

import React, { useEffect, useRef, useState } from "react";

import { useWindowEvent } from "../../hooks/useWindowEvent";
import { noContextMenu } from "../../utils/helpers.ts";
import { Indicator } from "../Indicator";
import { HsvaColor } from "colord";

type ColorHueSliderProps = {
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => void
};

export const ColorHueSlider: React.FC<ColorHueSliderProps> = ({
    hsva, setHsva
}) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const button = useRef(-1);
    const divRef = useRef<HTMLDivElement>(null);

    function onMouseDown(event: React.MouseEvent) {
        button.current = event.button;
        if (button.current !== -1) {
            document.getElementById("color-cursor-overlay")!.style.display = "block";
            updateHue(event.clientX);
        }
    }

    function updateHue(clientX: number) {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const h = Math.min(360, Math.max(0,
            (clientX - rect.left) / rect.width * 360
        ));

        const newHsva = { h, s: hsva.s, v: hsva.v, a: hsva.a };
        setHsva(newHsva);
    }

    function updatePos() {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const x = Math.floor(rect.width * hsva.h / 720) * 2;
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
        if (button.current !== -1) updateHue(event.clientX);
    }, [hsva]);

    useWindowEvent("resize", updatePos);
    useEffect(updatePos, [hsva]);

    return (
        <div
            className="color-hue-slider"
            tabIndex={0}
            ref={divRef}
            onMouseDown={onMouseDown}
            onContextMenu={noContextMenu}
        >
            <Indicator pos={pos}/>
        </div>
    )
}