import "./style.scss";

import React, {useRef, useState} from "react";

type MenuProps = {
    children: React.ReactNode
};

export const Menu: React.FC<MenuProps> = ({
    children
}) => {
    return (
        <div className="menu">
            {children}
        </div>
    );
};

type MenuItemProps = {
    text: string,
    shortcut?: string,
    onClick?: (event: React.MouseEvent) => void;
};

export const MenuItem: React.FC<MenuItemProps> = ({
    text, shortcut, onClick
}) => {
    return (
        <div className="menu-item" onClick={onClick}>
            <p className="text">{text}</p>
            {shortcut && <kbd className="text">{shortcut}</kbd>}
        </div>
    );
};

type MenuItemDropdownProps = {
    text: string,
    children: React.ReactNode,
};

export const MenuItemDropdown: React.FC<MenuItemDropdownProps> = ({
    text, children
}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const divRef = useRef<HTMLDivElement | null>(null);

    function onMouseOver() {
        if (!divRef.current) return;

        setPos({ x: divRef.current.offsetWidth + 4, y: divRef.current.offsetTop - 4 });
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
            className="menu-item menu-item-sub"
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
        >
            <p className="text">{text}</p>
            <div style={style} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                <Menu>
                    {children}
                </Menu>
            </div>
        </div>
    );
};