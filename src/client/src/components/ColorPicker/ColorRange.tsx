import React, { useEffect, useRef, useState } from "react";

import { colord, HsvaColor } from "colord";
import { useWindowEvent } from "../../hooks/useWindowEvent";
import { noContextMenu } from "../../utils/helpers.ts";
import { Indicator } from "../Indicator";

type ColorRangeProps = {
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => void
};

export const ColorRange: React.FC<ColorRangeProps> = ({
    hsva, setHsva
}) => {
    const [pos, setPos] = useState({ x: 0, y: 0 });

    let button = useRef(-1);
    let divRef = useRef<HTMLDivElement>(null);

    function onMouseDown(event: React.MouseEvent) {
        button.current = event.button;
        document.getElementById("color-cursor-overlay")!.style.display = "block";
        updateHue(event.clientX, event.clientY);
    }

    function updateHue(clientX: number, clientY: number) {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const s = Math.min(100, Math.max(0,
            (clientX - rect.left) / rect.width * 100
        ));
        const v = Math.min(100, Math.max(0,
            100 - (clientY - rect.top) / rect.height * 100
        ));

        const newHsva = { h: hsva.h, s, v, a: hsva.a };
        setHsva(newHsva);
    }

    function updatePos() {
        if (!divRef.current) return;
        const rect = divRef.current.getBoundingClientRect();

        const x = Math.floor(hsva.s / 100 * rect.width);
        const y = Math.floor(rect.height - hsva.v / 100 * rect.height);
        setPos({ x, y });
    }

    useWindowEvent("mouseup", (event: MouseEvent) => {
        if (button.current === event.button) {
            document.getElementById("color-cursor-overlay")!.style.display = "none";
            button.current = -1;
        }
    });

    useWindowEvent("mousemove", (event: MouseEvent) => {
        if (button.current !== -1) updateHue(event.clientX, event.clientY);
    }, [hsva]);

    useWindowEvent("resize", updatePos);
    useEffect(updatePos, [hsva]);

    const style = {
        "--color": colord({ h: hsva.h, s: 100, v: 100, a: 1 }).toHex(),
    } as React.CSSProperties;

    return (
        <div
            className="color-range"
            tabIndex={0}
            ref={divRef}
            onMouseDown={onMouseDown}
            onContextMenu={noContextMenu}
            style={style}
        >
            <Indicator pos={pos} />
        </div>
    )
}