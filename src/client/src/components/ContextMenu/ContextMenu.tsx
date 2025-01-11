import "./style.scss";

import React from "react";

import { noContextMenu } from "../../utils/helpers.ts";
import { Menu } from "../Menu";
import { useDialog } from "../../hooks/useDialog/useDialog.tsx";
import { useWindowEvent } from "../../hooks/useWindowEvent/useWindowEvent.tsx";

type ContextMenuProps = {
    menu: React.ReactNode,
    children: React.ReactNode,
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
    menu, children
}) => {
    const { showDialog } = useDialog();

    function onContextMenu(event: React.MouseEvent) {
        event.preventDefault();
        const x = Math.floor(event.clientX / 2) * 2;
        const y = Math.floor(event.clientY / 2) * 2;

        showDialog(
            <ContextMenuDialog menu={menu} x={x} y={y} />
        );
    };

    return (
        <React.Fragment>
            <div onContextMenu={onContextMenu} style={{display: "contents"}}>
                {children}
            </div>
        </React.Fragment>
    )
};

type ContextMenuDialogProps = {
    menu: React.ReactNode,
    x: number,
    y: number,
}

const ContextMenuDialog: React.FC<ContextMenuDialogProps> = ({ menu, x, y }) => {
    const { hideDialog } = useDialog();

    function onClick(event: React.MouseEvent) {
        event.stopPropagation();
    }

    useWindowEvent("click", () => {
        hideDialog();
    });

    const style = {
        left: `${x}px`,
        top: `${y}px`,
    } as React.CSSProperties;

    return (
        <div
            className="context-menu"
            style={style}
            onClick={onClick}
            onContextMenu={noContextMenu}
        >
            <Menu>
                {menu}
            </Menu>
        </div>
    );
};