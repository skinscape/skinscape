import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

import {useWindowEvent} from "../../hooks/useWindowEvent";

type CenterProps = {
    axis?: CenterAxis,
    children: React.ReactNode,
} & React.ComponentProps<"div">;

type CenterAxis = "x" | "y" | "xy";

/**
 * Center aligns `children` along the `axis` provided. Ensures that `children` are aligned to the 2px grid.
 */
export const Center = forwardRef<
    HTMLDivElement, CenterProps
>(({ axis, children, ...props }, ref) => {
    const divRef = useRef<HTMLDivElement>(null);
    const innerDivRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => innerDivRef.current as HTMLDivElement);

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 0, height: 0 });
    const [visible, setVisible] = useState(false);

    const _axis = axis ?? "x";

    function resize() {
        if (!divRef.current || !innerDivRef.current) return;
        const outerRect = divRef.current.getBoundingClientRect();
        const innerRect = innerDivRef.current.getBoundingClientRect();

        let x = 0;
        let y = 0;
        const style = window.getComputedStyle(innerDivRef.current);

        if (_axis.includes("x")) {
            const margin = parseInt(style.marginLeft, 10) + parseInt(style.marginRight, 10);
            x = Math.floor((outerRect.width - (innerRect.width + margin)) / 4) * 2;
        }
        if (_axis.includes("y")) {
            const margin = parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
            y = Math.floor((outerRect.height - (innerRect.height + margin)) / 4) * 2;
        }

        setPos({ x, y });
        setSize({ width: innerRect.width, height: innerRect.height });
        setVisible(true);
    }

    useWindowEvent("resize", resize);
    useEffect(resize, [innerDivRef]);

    const outerStyle = {
        width: _axis.includes("x") ? "100%" : `${size.width}px`,
        height: _axis.includes("y") ? "100%" : `${size.height}px`,
    } as React.CSSProperties;

    const innerStyle = {
        position: "absolute",
        left: _axis.includes("x") ? `${pos.x}px` : "auto",
        top: _axis.includes("y") ? `${pos.y}px` : "auto",
        visibility: visible ? "visible" : "hidden",
    } as React.CSSProperties;

    return (
        <div ref={divRef} className="center" style={outerStyle}>
            <div ref={innerDivRef} style={innerStyle} {...props}>
                {children}
            </div>
        </div>
    );
});