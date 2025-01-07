import "./style.css";

import React, {useEffect, useState} from "react";

import * as UPNG from "upng-js";
import {MutableSkin} from "../../models/skin.ts";
import {Models} from "../../models/model.ts";
import {ColorPicker} from "../ColorPicker";
import {getFaviconDataUrl, getSkinSubsection, noContextMenu} from "../../utils/helpers.ts";
import {blendData, rgbaBlendNormal} from "../../utils/blending.ts";
import {EditorScene} from "./EditorScene.tsx";
import {Palette} from "../Palette";

export const Editor: React.FC = () => {
    const [skin, setSkin] = useState<MutableSkin>()

    useEffect(() => {
        const name = "sourgummmybears"
        fetch(`/api/skin/${name}`)
            .then(res => res.arrayBuffer())
            .then(buffer => {
                const image = UPNG.decode(buffer);
                const size = [image.width, image.height];
                const data = UPNG.toRGBA8(image);

                const texture = {
                    size: size,
                    data: new Uint8ClampedArray(data[0]),
                };

                const newSkin = new MutableSkin(Models.alex64);
                newSkin.setTexture(texture);
                setSkin(newSkin);
            });
    }, []);

    useEffect(() => {
        if (!skin) return;
        const a = skin.model.texture_size[0] == 64 ? 8 : 16;
        const head = getSkinSubsection(skin, a, a, a, a);
        const overlay = getSkinSubsection(skin, a * 5, a, a, a);
        const url = getFaviconDataUrl(blendData(head, overlay, rgbaBlendNormal), a, a);

        // Find existing favicon link
        let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
        if (!link) {
            // Create a new link if not found
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        // Update the href with the new favicon
        link.href = url;
        link.type = 'image/png';
    }, [skin?.data]);

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
    )
}