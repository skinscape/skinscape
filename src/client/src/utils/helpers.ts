import React from "react";

import { colord, extend, RgbaColor } from "colord";
import labPlugin from "colord/plugins/mix";

import { Skin } from "../models/skin.ts";
import { useToolContext } from "../stores.ts";

extend([labPlugin]);

export const GITHUB_URL = "https://github.com/skinscape/skinscape";
export const DISCORD_URL = "https://discord.gg/HdVWtK7m3w";

/**
 * Returns an RGBA array subsection of width `w` and height `h` at (`x`, `y`) from source `skin`.
 * 
 * @param skin source skin
 * @param x subsection offset x
 * @param y subsection offset y
 * @param w subsection width
 * @param h subsection height
 * @returns 
 */
export function getSkinSubsection(
    skin: Skin,
    x: number, y: number,
    w: number, h: number
): Uint8ClampedArray {
    const w1 = skin.model.texture_size[0];

    const subsection = new Uint8ClampedArray(w * h * 4);

    for (let row = 0; row < w; row++) {
        for (let col = 0; col < h; col++) {
            const srcX = x + col;
            const srcY = y + row;

            // Check if the source coordinates are within bounds
            if (srcX >= 0 && srcX < w1 && srcY >= 0) {
                const srcIndex = (srcY * w1 + srcX) * 4;
                const destIndex = (row * w + col) * 4;

                subsection[destIndex] = skin.data[srcIndex];
                subsection[destIndex + 1] = skin.data[srcIndex + 1];
                subsection[destIndex + 2] = skin.data[srcIndex + 2];
                subsection[destIndex + 3] = skin.data[srcIndex + 3];
            }
        }
    }

    return subsection;
}

/**
 * Returns a data URL of an image defined in `rgbaArray` of width `width` and height `height`.
 * 
 * @param rgbaArray array of 8 bit RGBA values
 * @param width source width
 * @param height source height
 * @returns 
 */
export function rgbaArrayToDataUrl(
    rgbaArray: Uint8ClampedArray,
    width: number, height: number,
): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;

    const imageData = ctx.createImageData(width, height);
    imageData.data.set(rgbaArray);
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL("image/png");
}

/**
 * Finds a highly contrasting color to the initial color `rgba`.
 * 
 * @param rgba initial color
 * @returns a color optimized for visibility on the initial color
 */
export function getContrastingColor(rgba: RgbaColor) {
    const color = colord(rgba).alpha(1).invert();
    const { s, v } = color.toHsv();

    let light = Math.pow(100 - v, (100 - s) / 2);
    let dark = Math.pow(v, (100 - s) / 2);
    const sum = light + dark;
    light /= sum;
    dark /= sum;

    return color
        .mix({ r: 255, g: 255, b: 255, a: 1 }, dark * (100 - s) / 100)
        .mix({ r: 0, g: 0, b: 0, a: 1 }, light * (100 - s) / 100)
        .darken(1 - rgba.a)
        .toRgb();
}

export function noContextMenu(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const rightClickEvent = new MouseEvent("click", {
        cancelable: true,
        view: window,
        button: 2,
        clientX: event.clientX,
        clientY: event.clientY,
    });

    event.target?.dispatchEvent(rightClickEvent);
}

/**
 * Gets the value of a tool's property.
 * 
 * @param tool tool id
 * @param prop property id
 * @returns property value
 */
export function getToolProp(tool: string, prop: string): any {
    return useToolContext.getState().toolProps[tool][prop];
}

export function isMacOS(): boolean {
    return /mac/i.test(navigator.userAgent);
}

export function getCtrlPrefix(): string {
    return isMacOS() ? "⌘" : "Ctrl+";
}

export function classNames(names: {
    [key: string]: boolean
}): string {
    return Object.keys(names).map(key => {
        if (names[key]) return key;
    }).filter(it => it != undefined).join(" ");
}