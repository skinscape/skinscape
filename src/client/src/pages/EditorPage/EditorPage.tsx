import "./style.scss";

import React from "react";

import * as UPNG from "upng-js";
import { Editor } from "../../components/Editor";
import { Toolbar } from "../../components/Toolbar";
import { MenuItem, MenuItemDropdown, MenuItemToggle } from "../../components/Menu";
import { Menubar, MenubarItem } from "../../components/Menubar";
import { useEditorViewContext, useEditorContext } from "../../stores";
import { Models } from "../../models/model";
import { MutableSkin } from "../../models/skin";
import { InputDialog } from "./InputDialog";
import { useDialog } from "../../hooks/useDialog/useDialog";
import { DISCORD_URL, GITHUB_URL, rgbaArrayToDataUrl } from "../../utils/helpers";
import { useDocumentEvent } from "../../hooks/useDocumentEvent/useDocumentEvent";

import logo from "../../assets/icons/logo.png";
import { useEditorKeybinds } from "./keybinds";
import { useActiveEditor } from "../../hooks/useActiveEditor";
import { useShallow } from "zustand/shallow";

export const EditorPage: React.FC = () => {
    useEditorKeybinds();
    const { editors } = useEditorContext(useShallow(({ editors }) => { return { editors }; }));

    return (
        <React.Fragment>
            <div className="editor-page">
                <EditorPageMenubar />
                <div className="editor-page-content">
                    <div className="editor-page-editors">
                        <Toolbar />
                        {editors.map((editor, index) => {
                            return <Editor key={index} editor={editor} index={index} />
                        })}
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}

const EditorPageMenubar: React.FC = () => {
    const { editor } = useActiveEditor();
    const { 
        gridlines, setGridlines,
        overlay, setOverlay,
        elementToggles, setElementToggles
    } = useEditorViewContext();
    const { showDialog } = useDialog();

    function newSkin() {
        editor.addSkin(new MutableSkin(Models.alex64));
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

                const skin = new MutableSkin(Models.alex64);
                skin.name = username;
                skin.setTexture(texture);
                editor.addSkin(skin);
            });
    }

    function downloadSkin() {
        const skin = editor.activeSkin!;
        const data = skin.data;
        const [width, height] = skin.model.texture_size;
        const dataUrl = rgbaArrayToDataUrl(data, width, height);

        const element = document.createElement("a");
        element.href = dataUrl;
        element.download = `${skin.name}.png`;
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
        editor.update();
    }, [editor]);
    
    return (
        <div className="editor-page-menubar">
            <Menubar>
                <MenubarItem label={<img src={logo} alt="Logo" width={76} height={18} />}>
                    <MenuItem label="Profile..." enabled={false} />
                    <MenuItem label="Browser..." enabled={false} />
                    <MenuItem label="About..." />
                    <MenuItemDropdown label="Community">
                        <MenuItem label="Discord..." onClick={() => window.open(DISCORD_URL, "_blank")?.focus()} />
                        <MenuItem label="Github..." onClick={() => window.open(GITHUB_URL, "_blank")?.focus()} />
                    </MenuItemDropdown>
                    <hr />
                    <MenuItem label="Version 0.1.5-beta" enabled={false} />
                </MenubarItem>
                <MenubarItem label="File">
                    <MenuItem label="New Skin..." onClick={newSkin} />
                    <MenuItemDropdown label="Import Skin">
                        <MenuItem label="From File..." />
                        <MenuItem label="From Username..." onClick={() => showDialog(
                            <InputDialog label="Username" maxLength={16} onEnter={setSkinFromUsername} />
                        )} />
                    </MenuItemDropdown>
                    <hr />
                    <MenuItem label="Export Skin" onClick={downloadSkin} enabled={editor.isSkinOpen} />
                    <MenuItem label="Publish Skin" enabled={false && editor.isSkinOpen} />
                    <hr />
                    <MenuItem label="Settings..." />
                </MenubarItem>
                <MenubarItem label="Edit">
                    <MenuItem label="Undo" shortcut="Ctrl+Z" onClick={() => editor.activeSkin!.history.undo()} enabled={editor.isSkinOpen} />
                    <MenuItem label="Redo" shortcut="Ctrl+Y" onClick={() => editor.activeSkin!.history.redo()} enabled={editor.isSkinOpen} />
                    <hr />
                    <MenuItem label="Cut" shortcut="Ctrl+X" enabled={editor.isSkinOpen} />
                    <MenuItem label="Copy" shortcut="Ctrl+C" enabled={editor.isSkinOpen} />
                    <MenuItem label="Paste" shortcut="Ctrl+V" enabled={editor.isSkinOpen} />
                    <hr />
                    <MenuItem label="Replace Color..." enabled={false && editor.isSkinOpen} />
                    <MenuItem label="Hue/Saturation..." enabled={false && editor.isSkinOpen} />
                    <MenuItem label="Brightness/Contrast..." enabled={false && editor.isSkinOpen} />
                    <hr />
                    <MenuItemToggle label="Enable Symmetry" toggled={false} setToggled={() => {}} enabled={false} />
                </MenubarItem>
                <MenubarItem label="Layer">
                    <MenuItem label="New Layer" enabled={false && editor.isSkinOpen} />
                </MenubarItem>
                <MenubarItem label="View">
                    <MenuItemToggle label="Show Overlay" shortcut="O" toggled={overlay} setToggled={setOverlay} enabled={editor.isSkinOpen} />
                    <MenuItemToggle label="Show Gridlines" shortcut="G" toggled={gridlines} setToggled={setGridlines} enabled={editor.isSkinOpen} />
                    <MenuItemDropdown label="Element Toggles" enabled={editor.isSkinOpen}>
                        {editor.activeSkin && getSkinElements(editor.activeSkin!).map(element => {
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

                            return <MenuItemToggle key={element} label={`Show ${element}`} toggled={toggled} setToggled={setToggled} />;
                        })}
                    </MenuItemDropdown>
                    <hr />
                    <MenuItem label="Reset Model Position" enabled={false && editor.isSkinOpen} />
                </MenubarItem>
            </Menubar>
        </div>
    );
};