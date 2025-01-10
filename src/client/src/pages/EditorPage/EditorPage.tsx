import "./style.scss";

import React from "react";

import * as UPNG from "upng-js";
import { Editor } from "../../components/Editor";
import { Toolbar } from "../../components/Toolbar";
import { ToolConfig } from "../../components/ToolConfig";
import { MenuItem, MenuItemDropdown, MenuItemToggle } from "../../components/Menu";
import { Menubar, MenubarItem } from "../../components/Menubar";
import { useEditorContext, useSkinContext } from "../../stores";
import { Models } from "../../models/model";
import { MutableSkin } from "../../models/skin";
import { InputDialog } from "./InputDialog";
import { useDialog } from "../../hooks/useDialog/useDialog";
import { rgbaArrayToDataUrl } from "../../utils/helpers";
import { useDocumentEvent } from "../../hooks/useDocumentEvent/useDocumentEvent";

export const EditorPage: React.FC = () => {
    const { skins, setSkins } = useSkinContext();

    return (
        <React.Fragment>
            <div className="editor-page">
                <EditorPageMenubar />
                <div className="editor-page-content">
                    <ToolConfig />
                    <div className="editor-page-editors">
                        <Toolbar />
                        {skins.map((skin, index) => {
                            return (<Editor key={index} skin={skin} />);
                        })}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

const EditorPageMenubar: React.FC = () => {
    const { skins, setSkins } = useSkinContext();
    const { 
        gridlines, setGridlines,
        overlay, setOverlay,
        elementToggles, setElementToggles
    } = useEditorContext();
    const { showDialog } = useDialog();

    function newSkin() {
        skins[0] = new MutableSkin(Models.alex64);
        setSkins(skins);
    }

    function setSkinFromUsername(username: string) {
        fetch(`/api/skin/${username}`)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const image = UPNG.decode(buffer);
                const size = [image.width, image.height];
                const data = UPNG.toRGBA8(image);

                const texture = {
                    size: size,
                    data: new Uint8ClampedArray(data[0]),
                };

                skins[0] = new MutableSkin(Models.alex64);
                skins[0].setTexture(texture);

                setSkins(skins);
            });
    }

    function downloadSkin() {
        const data = skins[0].data;
        const [width, height] = skins[0].model.texture_size;
        const dataUrl = rgbaArrayToDataUrl(data, width, height);

        const element = document.createElement("a");
        element.href = dataUrl;
        element.download = `${skins[0].name}.png`;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    function getSkinElements(skin: MutableSkin): Array<string> {
        return Array.from(new Set(skin.model.elements.map(element => {
            const name = element.name!;
            if (name.startsWith("overlay:")) return name.substring(8);
            return name;
        })));
    }

    useDocumentEvent("visibilitychange", () => {
        setSkins(skins);
    }, [skins]);
    
    return (
        <div className="editor-page-menubar">
            <Menubar>
                <MenubarItem label="File">
                    <MenuItem label="New Skin..." onClick={newSkin} />
                    <MenuItemDropdown label="Import Skin">
                        <MenuItem label="From File..." />
                        <MenuItem label="From Username..." onClick={() => showDialog(
                            <InputDialog label="Username" maxLength={16} onEnter={setSkinFromUsername} />
                        )} />
                    </MenuItemDropdown>
                    <hr />
                    <MenuItem label="Export Skin" onClick={downloadSkin} />
                    <MenuItem label="Publish Skin" enabled={false} />
                    <hr />
                    <MenuItem label="Settings..." />
                </MenubarItem>
                <MenubarItem label="Edit">
                    <MenuItem label="Undo" shortcut="Ctrl+Z" onClick={() => skins[0].history.undo()} />
                    <MenuItem label="Redo" shortcut="Ctrl+Y" onClick={() => skins[0].history.redo()} />
                    <hr />
                    <MenuItem label="Cut" shortcut="Ctrl+X" />
                    <MenuItem label="Copy" shortcut="Ctrl+C" />
                    <MenuItem label="Paste" shortcut="Ctrl+V" />
                    <hr />
                    <MenuItem label="Replace Color" />
                    <MenuItem label="Hue/Saturation" />
                    <MenuItem label="Brightness/Contrast" />
                </MenubarItem>
                <MenubarItem label="Layer">
                    <MenuItem label="New Layer" />
                </MenubarItem>
                <MenubarItem label="View">
                    <MenuItemToggle label="Show Overlay" shortcut="O" toggled={overlay} setToggled={setOverlay} />
                    <MenuItemToggle label="Show Gridlines" shortcut="G" toggled={gridlines} setToggled={setGridlines} />
                    <MenuItemDropdown label="Element Toggles">
                        {getSkinElements(skins[0]).map(element => {
                            const toggled = !elementToggles.includes(element);
                            const setToggled = () => {
                                const index = elementToggles.indexOf(element);
                                if (index > -1) {
                                    elementToggles.splice(index, 1);
                                } else {
                                    elementToggles.push(element);
                                }
                                setElementToggles(elementToggles);
                            }

                            return <MenuItemToggle label={`Show ${element}`} toggled={toggled} setToggled={setToggled} />;
                        })}
                    </MenuItemDropdown>
                    <hr />
                    <MenuItem label="Reset Model Position" />
                </MenubarItem>
            </Menubar>
        </div>
    );
};