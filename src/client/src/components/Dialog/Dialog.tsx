import "./style.scss";

import React, { useEffect, useRef, useState } from "react";

import { useDialog } from "../../hooks/useDialog";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { Center } from "../Center";
import { useWindowEvent } from "../../hooks/useWindowEvent";

type DialogProps = {
    title?: string,
    children: React.ReactNode,
};

export const Dialog: React.FC<DialogProps> = ({
    title, children,
}) => {
    const { hideDialog } = useDialog();

    const dialogRef = useRef<HTMLDivElement>(null);

    const [pos, setPos] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const startPos = useRef({ x: 0, y: 0 });
    const [visible, setVisible] = useState(false);

    function resize() {
        if (!dialogRef.current) return;
        const { width, height } = dialogRef.current.getBoundingClientRect();

        const x = Math.floor((window.innerWidth - width) / 4) * 2;
        const y = Math.floor((window.innerHeight - height) / 4) * 2;

        setPos({ x, y });
        setVisible(true);
    }

    function onMouseDown(event: React.MouseEvent) {
        if (!dialogRef.current) return;

        isDragging.current = true;
        startPos.current = {
            x: event.clientX - pos.x,
            y: event.clientY - pos.y
        };
    }

    function onMouseMove(event: MouseEvent) {
        if (!dialogRef.current || !isDragging.current) return;
        const { width, height } = dialogRef.current.getBoundingClientRect();

        let x = event.clientX - startPos.current.x;
        let y = event.clientY - startPos.current.y;

        if (x < 0) x = 0;
        if (y < 0) y = 0;

        if (x + width > window.innerWidth) x = window.innerWidth - width;
        if (y + height > window.innerHeight) y = window.innerHeight - height;

        setPos({ x, y });
    }

    function onMouseUp() {
        isDragging.current = false;
    }

    function onKeyDown(event: KeyboardEvent) {
        if (event.key == "Escape") hideDialog();
    }

    useWindowEvent("mousemove", onMouseMove);
    useWindowEvent("mouseup", onMouseUp);
    useWindowEvent("keydown", onKeyDown);

    useWindowEvent("resize", resize);
    useEffect(resize, [dialogRef]);

    const style = {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        visibility: visible ? "visible" : "hidden",
    } as React.CSSProperties;

    return (
        <div ref={dialogRef} className="dialog" style={style}>
            {title && <div className="dialog-title" onMouseDown={onMouseDown}>
                {title}
                <Button size="icon" onClick={hideDialog}>
                    <Icon image="icons/close@2x.png"/>
                </Button>
            </div>}
            <div className="dialog-content">
                {children}
            </div>
        </div>
    );
};