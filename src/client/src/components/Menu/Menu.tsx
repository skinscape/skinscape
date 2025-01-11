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
    label: string,
    shortcut?: string,
    enabled?: boolean,
    onClick?: (event: React.MouseEvent) => void;
};

export const MenuItem: React.FC<MenuItemProps> = ({
    label: text, shortcut, enabled, onClick
}) => {
    if (enabled == false) onClick = undefined;

    return (
        <div className={enabled == false ? "menu-item disabled" : "menu-item"} onClick={onClick}>
            <p className="text">{text}</p>
            {shortcut && <kbd className="text">{shortcut}</kbd>}
        </div>
    );
};

type MenuItemToggleProps = {
    label: string,
    shortcut?: string,
    enabled?: boolean,

    toggled: boolean,
    setToggled(toggled: boolean): void,
};

export const MenuItemToggle: React.FC<MenuItemToggleProps> = ({
    label, shortcut, enabled, toggled, setToggled
}) => {
    return (
        <div className={enabled == false ? "menu-item disabled" : "menu-item"} onClick={() => setToggled(!toggled)}>
            <div>
                {toggled ? <div className="toggle-indicator-on"></div> : <div className="toggle-indicator-off"></div>}
                <p className="text">{label}</p>
            </div>
            {shortcut && <kbd className="text">{shortcut}</kbd>}
        </div>
    );
};

type MenuItemDropdownProps = {
    label: string,
    enabled?: boolean,
    children: React.ReactNode,
};

export const MenuItemDropdown: React.FC<MenuItemDropdownProps> = ({
    label, enabled, children
}) => {
    const [visible, setVisible] = useState<boolean>(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });

    const divRef = useRef<HTMLDivElement | null>(null);

    function onMouseOver() {
        if (!divRef.current || enabled == false) return;

        setPos({ x: divRef.current.offsetWidth, y: divRef.current.offsetTop - 4 });
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
            className={enabled == false ? "menu-item menu-item-sub disabled" : "menu-item menu-item-sub"}
            onMouseOver={onMouseOver}
            onMouseLeave={onMouseLeave}
        >
            <p className="text">{label}</p>
            <div style={style} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
                <Menu>
                    {children}
                </Menu>
            </div>
        </div>
    );
};