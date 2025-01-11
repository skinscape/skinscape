import React, {useEffect, useRef, useState} from "react";

import {Indicator} from "./Indicator.tsx";
import {useWindowEvent} from "../../hooks/useWindowEvent";
import {useColorContext} from "../../stores.ts";
import {noContextMenu} from "../../utils/helpers.ts";

export const Slider: React.FC = () => {
    const { hsva, setHsva } = useColorContext();
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

    useWindowEvent("mouseup", (event: MouseEvent) => {
        if (button.current === event.button) {
            document.getElementById("color-cursor-overlay")!.style.display = "none";
            button.current = -1;
        }
    });

    useWindowEvent("mousemove", (event: MouseEvent) => {
        if (button.current !== -1) updateHue(event.clientX);
    }, [hsva]);

    useEffect(() => {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const x = rect.width * hsva.h / 360;
        const y = rect.height / 2;
        setPos({ x, y });
    }, [hsva]);

    return (
        <div
            className="color-slider"
            tabIndex={0}
            ref={divRef}
            onMouseDown={onMouseDown}
            onContextMenu={noContextMenu}
        >
            <Indicator pos={pos}/>
        </div>
    )
}