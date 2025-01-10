import { RgbaColor } from "colord";
import { Layer, MutableSkin } from "./skin";

export class History {

    private skin: MutableSkin;
    stack: Array<Edit>;
    offset: number;

    constructor(skin: MutableSkin) {
        this.skin = skin;
        this.stack = [];
        this.offset = 0;
    }
    
    static fromJSON(json: any, skin: MutableSkin): History {
        const history = new History(skin);
        history.stack = json.stack.map((it: any) => {
            switch (it.type) {
                case "edit-change-pixels":
                    return EditChangePixels.fromJSON(it);
                case "edit-change-layer":
                    return EditChangeLayer.fromJSON(it);
                case "edit-delete-layer":
                    return EditDeleteLayer.fromJSON(it, skin);
            }
        });
        return history;
    }

    toJSON(): any {
        return {
            stack: this.stack.map(it => it.toJson())
        };
    }

    push(edit: Edit) {
        if (this.offset > 0) {
            this.stack.splice(this.stack.length - this.offset, this.offset);
        }
        this.stack.push(edit);
        this.offset = 0;

        if (this.stack.length > 200) {
            this.stack.shift();
        }
    }

    undo() {
        const index = (this.stack.length - 1) - this.offset;
        if (index < 0) return;
        this.stack[index].undo(this.skin);
        this.offset++;
    }

    redo() {
        if (this.offset == 0) return;
        const index = this.stack.length - this.offset;
        this.stack[index].do(this.skin);
        this.offset--;
    }

}

export interface Edit {

    type: string;

    toJson(): any;

    do(skin: MutableSkin): void;

    undo(skin: MutableSkin): void;

}

export type PixelChange = {
    x: number,
    y: number,
    from: RgbaColor,
    to: RgbaColor,
};

export class EditChangePixels implements Edit {

    type: string = "edit-change-pixels";
    changes: Array<PixelChange>;

    constructor(changes: Array<PixelChange>) {
        this.changes = changes;
    }

    static fromJSON(json: any): EditChangePixels {
        return new EditChangePixels(json.changes);
    }

    toJson(): any {
        return {
            type: this.type,
            changes: this.changes,
        };
    }

    do(skin: MutableSkin): void {
        this.changes.forEach(change => {
            skin.activeLayer.setPixel(change.x, change.y, change.to);
        });
    }

    undo(skin: MutableSkin): void {
        this.changes.forEach(change => {
            skin.activeLayer.setPixel(change.x, change.y, change.from, false);
        });
    }

}

export class EditChangeLayer implements Edit {

    type: string = "edit-change-layer";
    fromId: string;
    toId: string;

    constructor(fromId: string, toId: string) {
        this.fromId = fromId;
        this.toId = toId;
    }

    static fromJSON(json: any): EditChangeLayer {
        return new EditChangeLayer(json.fromId, json.toId);
    }

    toJson(): any {
        return {
            type: this.type,
            fromId: this.fromId,
            toId: this.toId,
        };
    }

    do(skin: MutableSkin): void {
        skin.activeLayerId = this.toId;
    }

    undo(skin: MutableSkin): void {
        skin.activeLayerId = this.fromId;
    }

}

export class EditDeleteLayer implements Edit {

    type: string = "edit-delete-layer";
    layer: Layer;
    layerIndex: number = 0;
    wasActiveLayer: boolean = false;

    constructor(layer: Layer) {
        this.layer = layer;
    }

    static fromJSON(json: any, skin: MutableSkin): EditDeleteLayer {
        const layer = Layer.fromJSON(json.layer, skin);
        const edit = new EditDeleteLayer(layer);
        edit.layerIndex = json.layerIndex;
        edit.wasActiveLayer = json.wasActiveLayer;
        return edit;
    }

    toJson(): any {
        return {
            type: this.type,
            layer: this.layer.toJSON(),
            layerIndex: this.layerIndex,
            wasActiveLayer: this.wasActiveLayer,
        };
    }

    do(skin: MutableSkin): void {
        this.layerIndex = skin.layers.indexOf(this.layer);
        skin.layers.splice(this.layerIndex, 1);

        if (skin.activeLayerId == this.layer.uuid) {
            this.wasActiveLayer = true;
            skin.activeLayerId = skin.layers[0].uuid;
        }
    }

    undo(skin: MutableSkin): void {
        skin.layers.splice(this.layerIndex, 0, this.layer);

        if (this.wasActiveLayer) {
            skin.activeLayerId = this.layer.uuid;
        }
    }

}