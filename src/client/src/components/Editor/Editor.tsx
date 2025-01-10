import "./style.scss";

import React from "react";

import {MutableSkin} from "../../models/skin.ts";
import {ColorPicker} from "../ColorPicker";
import {noContextMenu} from "../../utils/helpers.ts";
import {EditorScene} from "./EditorScene.tsx";
import {Palette} from "../Palette";

type EditorProps = {
    skin: MutableSkin,
}

export const Editor: React.FC<EditorProps> = ({ skin }) => {
    return (
        <React.Fragment>
            <div className="editor-sidebar">
                <div className="picker-container">
                    <ColorPicker />
                </div>
                <div className="palette-container">
                    <Palette />
                </div>
            </div>

            <div className="editor-center">
                <div className="editor-scene border" onContextMenu={noContextMenu}>
                    {skin && <EditorScene skin={skin} />}
                </div>
            </div>
        </React.Fragment>
    );
}