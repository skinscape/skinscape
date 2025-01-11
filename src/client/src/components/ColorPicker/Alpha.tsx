import React, {useEffect, useRef, useState} from "react";

import {Indicator} from "./Indicator.tsx";
import {useWindowEvent} from "../../hooks/useWindowEvent";
import {colord} from "colord";
import {useColorContext} from "../../stores.ts";
import {noContextMenu} from "../../utils/helpers.ts";

export const Alpha: React.FC = () => {
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

        const a = Math.min(1, Math.max(0,
            (clientX - rect.left) / rect.width
        ));

        const newHsva = { h: hsva.h, s: hsva.s, v: hsva.v, a };
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

        const y = rect.height / 2;
        const x = rect.width * hsva.a;
        setPos({ x, y });
    }, [hsva]);

    const style = {
        "--color": colord({ h: hsva.h, s: hsva.s, v: hsva.v, a: 1 }).toHex(),
    } as React.CSSProperties;

    return (
        <div
            className="color-alpha"
            tabIndex={0}
            ref={divRef}
            onMouseDown={onMouseDown}
            onContextMenu={noContextMenu}
            style={style}
        >
            <Indicator pos={pos}/>
        </div>
    )
}