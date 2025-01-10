import {Layer, MutableSkin} from "./skin.ts";
import {colord, extend, RgbaColor} from "colord";
import labPlugin from "colord/plugins/lab";
import {Models} from "./model.ts";
import {useColorContext, useToolContext} from "../stores.ts";
import { getToolProp } from "../utils/helpers.ts";
import { EditChangePixels, PixelChange } from "./history.ts";

extend([labPlugin]);

export type Tool = {
    id: string,
    schema: ToolSchema,
    handler: ToolHandler,
};

export type ToolSchema = {
    [key: string]: {
        name: string,
        type: ToolSchemaPropType,
    }
};

export type ToolProps = {
    [key: string]: {
        [key: string]: any
    }
};

type ToolSchemaPropType = ValueType | OptionType;

type ValueType = {
    type: "value",
    min: number,
    max: number,
};

type OptionType = {
    type: "option",
    options: Array<string>,
};

abstract class ToolHandler {

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor): void {};

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor): void {};

    drag(skin: MutableSkin, x: number, y: number, color: RgbaColor): void {};

    up(skin: MutableSkin, color: RgbaColor): void {};

}

export class PencilHandler extends ToolHandler {

    private changes: Array<PixelChange>;

    constructor() {
        super();
        this.changes = [];
    }

    hasVisited(x: number, y: number): boolean {
        return this.changes.find(change => change.x == x && change.y == y) != undefined;
    }

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        const layer = skin.tempLayer;
        layer.setPixel(x, y, color);
    }

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        if (this.hasVisited(x, y)) return;
        const layer = skin.activeLayer;

        const change = { x, y, from: layer.getPixel(x, y), to: color };
        layer.setPixel(x, y, color);
        this.changes.push(change);
    }

    drag(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        if (this.hasVisited(x, y)) return;
        const layer = skin.activeLayer;

        const change = { x, y, from: layer.getPixel(x, y), to: color };
        layer.setPixel(x, y, color);
        this.changes.push(change);
    }

    up(skin: MutableSkin, color: RgbaColor) {
        if (this.changes.length < 1) return;
        skin.history.push(new EditChangePixels(this.changes));
        this.changes = [];
    }

}

export class EraserHandler extends ToolHandler {

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        const layer = skin.tempLayer;
        layer.setPixel(x, y, { r: 0, g: 0, b: 0, a: 0.5 });
    }

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        const layer = skin.activeLayer;
        layer.setPixel(x, y, { r: 0, g: 0, b: 0, a: 0 }, false);
    }

    drag(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        const layer = skin.activeLayer;
        layer.setPixel(x, y, { r: 0, g: 0, b: 0, a: 0 }, false);
    }

}

export class EyedropperHandler extends ToolHandler {

    previous: string | undefined;

    down(skin: MutableSkin, x: number, y: number, _: RgbaColor) {
        const { setActiveTool } = useToolContext.getState();
        const { setRgba } = useColorContext.getState();

        let c = skin.activeLayer.getPixel(x, y);
        c.a /= 255;
        setRgba(c);
        if (this.previous) setActiveTool(this.previous)
    }

}

export class FillHandler extends ToolHandler {

    fill(
        skin: MutableSkin, x: number, y: number, color: RgbaColor, temp: boolean
    ) {
        const tolerance = getToolProp("fill", "tolerance");

        const sampleLayer = skin.activeLayer;
        const visited = new Set([[x, y].toString()]);
        const queue = [[x, y]];

        const base: RgbaColor = sampleLayer.getPixel(x, y);
        const bounds = Models.getFaceUV(skin.model, [x, y]);

        // dfs
        while (queue.length > 0) {
            const pos = queue.pop()!;

            const col = sampleLayer.getPixel(pos[0], pos[1]);
            // console.log(pos, base, col);
            if (colord(base).delta(col) <= tolerance / 100) {
                if (temp) {
                    skin.tempLayer.setPixel(pos[0], pos[1], { r: color.r, g: color.g, b: color.b, a: 0.2 });
                } else {
                    sampleLayer.setPixel(pos[0], pos[1], { r: color.r, g: color.g, b: color.b, a: color.a });
                }
                const neighbors = [];
                for (let i = -1; i < 2; i += 2) neighbors.push([pos[0] + i, pos[1]]);
                for (let i = -1; i < 2; i += 2) neighbors.push([pos[0], pos[1] + i]);

                // console.log(neighbors);

                for (let i = 0; i < 4; i++) {
                    const n = neighbors[i];
                    if (visited.has(n.toString())) continue;
                    if (n[0] >= bounds[0] + 1 && n[0] <= bounds[2] && n[1] >= bounds[1] && n[1] < bounds[3]) {
                        visited.add(n.toString());
                        queue.push(n);
                    }
                }
            }
        }
    }

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        this.fill(skin, x, y, color, true);
    }

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        this.fill(skin, x, y, color, false);
    }

}

const tools: Array<Tool> = [{
    id: "pencil",
    schema: {
        size: {
            name: "Size",
            type: { type: "value", min: 1, max: 10 },
        }
    },
    handler: new PencilHandler()
}, {
    id: "eraser",
    schema: {
        size: {
            name: "Size",
            type: { type: "value", min: 1, max: 10 }
        }
    },
    handler: new EraserHandler()
}, {
    id: "eyedropper",
    schema: {},
    handler: new EyedropperHandler()
}, {
    id: "fill",
    schema: {
        tolerance: {
            name: "Tolerance",
            type: { type: "value", min: 0, max: 100 }
        }
    },
    handler: new FillHandler()
}];

export function getTool(id: string): Tool {
    return tools.find(it => it.id == id)!;
}

export function getActiveTool(): Tool {
    return getTool(useToolContext.getState().activeTool);
}