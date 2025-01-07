import "./style.css";

import React, {useRef, useState} from "react";
import {useWindowEvent} from "../../hooks/useWindowEvent";
import {noContextMenu} from "../../utils/helpers.ts";
import {Menu} from "../Menu";

type ContextMenuProps = {
    children: React.ReactNode,
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
    children
}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const divRef = useRef<HTMLDivElement | null>(null);

    function onClick(event: React.MouseEvent) {
        event.stopPropagation();
    }

    useWindowEvent("contextmenu", (event: MouseEvent) => {
        event.preventDefault();
        setVisible(true);
        const x = Math.floor(event.clientX / 2) * 2;
        const y = Math.floor(event.clientY / 2) * 2;
        setPos({ x, y });
    });

    useWindowEvent("click", () => {
        setVisible(false);
    });

    const style = {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        display: visible ? "block" : "none",
    } as React.CSSProperties;

    return (
        <div
            ref={divRef}
            className="context-menu"
            style={style}
            onClick={onClick}
            onContextMenu={noContextMenu}
        >
            <Menu>
                {children}
            </Menu>
        </div>
    )
};