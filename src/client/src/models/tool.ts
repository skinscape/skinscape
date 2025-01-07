import {MutableSkin} from "./skin.ts";
import {colord, extend, RgbaColor} from "colord";
import labPlugin from "colord/plugins/lab";
import {Models} from "./model.ts";
import {useColorContext, useToolContext} from "../stores.ts";

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

    private visited: Set<string>;
    size: number;

    constructor() {
        super();
        this.visited = new Set();
        this.size = 1;
    }

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        const layer = skin.tempLayer;
        layer.setPixel(x, y, color);
    }

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        if (this.visited.has([x, y].toString())) return;
        const layer = skin.activeLayer;
        layer.setPixel(x, y, color);
        this.visited.add([x, y].toString());
    }

    drag(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        if (this.visited.has([x, y].toString())) return;
        const layer = skin.activeLayer;
        layer.setPixel(x, y, color);
        this.visited.add([x, y].toString());
    }

    up(skin: MutableSkin, color: RgbaColor) {
        this.visited.clear();
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

    tolerance: number;

    constructor() {
        super();
        this.tolerance = 0.01;
    }

    hover(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        let layer = skin.activeLayer;
        let visited = new Set([[x, y].toString()]);
        let queue = [[x, y]];

        let base: RgbaColor = layer.getPixel(x, y);
        let bounds = Models.getFaceUV(skin.model, [x, y]);

        // dfs
        while (queue.length > 0) {
            const pos = queue.pop()!;

            const col = layer.getPixel(pos[0], pos[1]);
            // console.log(pos, base, col);
            if (colord(base).delta(col) <= this.tolerance) {
                skin.tempLayer.setPixel(pos[0], pos[1], { r: color.r, g: color.g, b: color.b, a: 0.2 });
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

    down(skin: MutableSkin, x: number, y: number, color: RgbaColor) {
        let layer = skin.activeLayer;
        let visited = new Set([[x, y].toString()]);
        let queue = [[x, y]];

        let base: RgbaColor = layer.getPixel(x, y);
        let bounds = Models.getFaceUV(skin.model, [x, y]);

        // dfs
        while (queue.length > 0) {
            const pos = queue.pop()!;

            const col = layer.getPixel(pos[0], pos[1]);
            // console.log(pos, base, col);
            if (colord(base).delta(col) <= this.tolerance) {
                layer.setPixel(pos[0], pos[1], color);
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