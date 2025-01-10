import "./style.scss";

import React, { useRef, useState } from "react";
import { Menu } from "../Menu";

type MenubarProps = {
    children: React.ReactNode,
};

export const Menubar: React.FC<MenubarProps> = ({
    children,
}) => {


    return (
        <div className="menubar">
            {children}
        </div>
    );
};

type MenubarItemProps = {
    label: string,
    children: React.ReactNode,
}

export const MenubarItem: React.FC<MenubarItemProps> = ({
    label, children
}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const divRef = useRef<HTMLDivElement | null>(null);

    function onMouseOver() {
        if (!divRef.current) return;

        setPos({ x: divRef.current.offsetLeft - 4, y: divRef.current.offsetTop + divRef.current.offsetHeight });
        setVisible(true);
    }

    function onMouseLeave() {
        setVisible(false);
    }

    const style = {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        display: visible ? "block" : "none",
    } as React.CSSProperties;

    return (
        <div
            ref={divRef}
            className="menubar-item"
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
        >
            {label}
            <div style={style} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                <Menu>
                    {children}
                </Menu>
            </div>
        </div>
    );
};