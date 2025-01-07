import "./style.css";

import React from "react";

import {Editor} from "../../components/Editor";
import {Toolbar} from "../../components/Toolbar";
import {ToolConfig} from "../../components/ToolConfig";
import {ContextMenu} from "../../components/ContextMenu/ContextMenu.tsx";
import {MenuItem, MenuItemDropdown} from "../../components/Menu";
import {Dialog} from "../../components/Dialog";
import {Input} from "../../components/Input";

export const EditorPage: React.FC = () => {
    return (
        <React.Fragment>
            <div className="editor-page">
                <ToolConfig />
                <div className="editor-page-center">
                    <Toolbar />
                    <div className="editors">
                        <Editor/>
                    </div>
                </div>
            </div>

            <ContextMenu>
                <MenuItem text="New Skin" />
                <MenuItemDropdown text="Import Skin">
                    <MenuItem text="From File" />
                    <MenuItem text="From Username" />
                </MenuItemDropdown>
            </ContextMenu>
        </React.Fragment>
    );
}