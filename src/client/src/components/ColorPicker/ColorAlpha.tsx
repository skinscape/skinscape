import React, { useEffect, useRef, useState } from "react";

import { useWindowEvent } from "../../hooks/useWindowEvent";
import { colord, HsvaColor } from "colord";
import { noContextMenu } from "../../utils/helpers.ts";
import { Indicator } from "../Indicator";

type ColorAlphaProps = {
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => void
};

export const ColorAlpha: React.FC<ColorAlphaProps> = ({
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

        const a = Math.min(1, Math.max(0,
            (clientX - rect.left) / rect.width
        ));

        const newHsva = { h: hsva.h, s: hsva.s, v: hsva.v, a };
        setHsva(newHsva);
    }

    function updatePos() {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const y = rect.height / 2;
        const x = rect.width * hsva.a;
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
    useEffect(() => updatePos, [hsva]);

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