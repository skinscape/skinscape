import {rgbaBlendNormal} from "../utils/blending";
import type {RgbaColor} from "colord";
import type {Model} from "./model";
import {History} from "./history";
import {DataTexture} from "three";

export type Texture = {
    size: number[];
    data: Uint8ClampedArray;
}

/**
 * Represents a textured model.
 */
export class Skin {

    protected data: Uint8ClampedArray;

    model: Model;
    texture: DataTexture;

    /**
     * Creates a new `Skin` with the given `Model` and `data`.
     *
     * @param model model to use
     * @param texture clamped i8 array matching model dimensions
     */
    constructor(model: Model, texture: Texture) {
        this.model = model;
        this.data = Skin.possiblyResize(model, Skin.flipY(texture)).data;
        this.texture = new DataTexture(this.data, this.model.texture_size[0], this.model.texture_size[1]);
        this.texture.flipY = false;
        this.texture.needsUpdate = true;
    }

    getTexture(): Texture {
        return Skin.flipY({
            data: this.data,
            size: this.model.texture_size
        });
    }

    protected static possiblyResize(model: Model, texture: Texture): Texture {
        let tex = texture;
        if (texture.size[0] == 64 && texture.size[1] == 32 && model.texture_size !== texture.size) { // Probably old 64x32 texture
            tex = this.resizeClamped(tex.data, [64, 64]);
        }

        if (model.texture_size !== texture.size) { // Texture sizes do not align
            tex = this.resizeNearestNeighbor(tex.data, tex.size, model.texture_size);
        }

        return tex;
    }

    private static resizeClamped(texture: Uint8ClampedArray, newSize: number[]): Texture {
        const length = newSize[0] * newSize[1];
        const newTexture = new Uint8ClampedArray(length * 4);

        for (let pos = 0; pos < Math.min(length, texture.length); pos++) {
            newTexture[pos] = texture[pos];
        }

        return {
            size: newSize,
            data: newTexture,
        };
    }

    private static resizeNearestNeighbor(texture: Uint8ClampedArray, oldSize: number[], newSize: number[]): Texture {
        if (oldSize === newSize) return { size: newSize, data: texture };
        const length = newSize[0] * newSize[1];
        const newTexture = new Uint8ClampedArray(length * 4);
        for (let pos = 0; pos < length; pos++) {
            const x = pos % newSize[0];
            const y = Math.floor(pos / newSize[1]);

            const sampleX = Math.floor(x / newSize[0] * oldSize[0]);
            const sampleY = Math.floor(y / newSize[1] * oldSize[1]);

            const samplePos = (sampleX * 4) + ((sampleY * oldSize[1]) * 4);

            for (let i = 0; i < 4; i++) {
                newTexture[pos * 4 + i] = texture[samplePos + i];
            }
        }
        return {
            size: newSize,
            data: newTexture,
        };
    }

    protected static flipY(texture: Texture): Texture {
        const [width, height] = texture.size;
        const newTexture = new Uint8ClampedArray(texture.data.length);
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const flipY = height - y;

                const srcPos = (y * width + x) * 4;
                const destPos = (flipY * width + x) * 4;
                for (let i = 0; i < 4; i++) {
                    newTexture[destPos * 4 + i] = texture.data[srcPos + i];
                }
            }
        }
        return {
            data: newTexture,
            size: texture.size
        };
    }

    dataLength(): number {
        return this.data.length;
    }

}

/**
 * Represents a textured model for editing.
 */
export class MutableSkin extends Skin {

    name: string;
    layers: Array<Layer>;
    tempLayers: Array<TempLayer>;
    activeLayerId: string;
    history: History;

    /**
     * Creates a new `MutableSkin` with the given `Model`.
     */
    constructor(model: Model) {
        const texture = {
            size: model.texture_size,
            data: new Uint8ClampedArray(model.texture_size[0] * model.texture_size[1] * 4)
        }
        super(model, texture);
        this.name = "Untitled Skin";
        this.layers = [new Layer(this, "default")];
        this.layers[0].data = this.data.slice();
        this.tempLayers = [
            new TempLayer(this, "effect"), // the order here is important, we don't want the hover to be visibly
            new TempLayer(this, "hover"),  // messed up when an effect is applied.
        ]
        this.activeLayerId = this.layers[0].uuid;
        this.history = new History(this);
    }

    static fromJSON(json: any): MutableSkin {
        // @ts-ignore
        const skin = new MutableSkin(json.model);
        skin.layers = json.layers.map((layer: any) => Layer.fromJSON(layer, skin));
        skin.activeLayerId = json.activeLayerId;
        skin.name = json.name;
        skin.history = History.fromJSON(json.history, skin);

        for (let pos = 0; pos < skin.data.length; pos += 4) {
            skin.updatePixel(pos);
        }

        return skin;
    }

    toJSON(): any {
        return {
            name: this.name,
            layers: this.layers,
            activeLayerId: this.activeLayerId,
            model: this.model,
            history: this.history,
        }
    }

    copy(): MutableSkin {
        // doesn't actually stringify/parse so this isn't even hacky
        return MutableSkin.fromJSON(this.toJSON());
    }

    getLayerByName(name: string): Layer {
        const layer = this.layers.find(layer => layer.name == name);
        if (!layer) throw Error(`Cannot find layer ${layer}.`);
        return layer;
    }

    getTempLayerByName(name: string): TempLayer {
        const layer = this.tempLayers.find(layer => layer.name == name);
        if (!layer) throw Error(`Cannot find temp layer ${layer}.`);
        return layer;
    }

    setTexture(texture: Texture) {
        this.data.set(Skin.possiblyResize(this.model, Skin.flipY(texture)).data); // Will keep shape
        this.layers = [new Layer(this, "default")];
        this.layers[0].data = new Uint8ClampedArray(this.data);
        this.activeLayerId = this.layers[0].uuid;
    }

    setModel(model: Model) {
        const oldModel = this.model;
        this.model = model;

        // Update texture
        for (const layer of this.layers) {
            const texture = {
                size: oldModel.texture_size,
                data: layer.data,
            }
            layer.data = Skin.possiblyResize(model, texture).data;
        }

        // Model could change texture size, recreate data!
        const texSize = model.texture_size[0] * model.texture_size[1] * 4;
        this.data = new Uint8ClampedArray(texSize);
        for (const tempLayer of this.tempLayers) {
            tempLayer.data = new Uint8ClampedArray(texSize);
        }
        for (let pos = 0; pos < this.data.length; pos += 4) {
            this.updatePixel(pos);
        }
    }

    /**
     * Updates the pixel at the given texture position pos. The updated value
     * will not be factored into the `Skin`'s texture until this function is
     * called.
     *
     * @param pos offset in texture buffer
     */
    updatePixel(pos: number) {
        const color = this.getPixelByPos(pos);
        const [width, height] = this.model.texture_size;
        const x = (pos / 4) % width;
        const y = Math.floor((pos / 4) / width);
        const flipY = (height - 1) - y;

        const newPos = (flipY * width + x) * 4;
        this.data.set([color.r, color.g, color.b, Math.floor(color.a * 255)], newPos);
        this.texture.needsUpdate = true;
    }

    /**
     * Gets the pixel at coords `(x, y)`.
     */
    getPixel(x: number, y: number): RgbaColor {
        return this.getPixelByPos(this.getPos(x, y));
    }

    /**
     * Gets the pixel at the given texture position `pos`.
     *
     * @param pos offset in texture buffer
     */
    getPixelByPos(pos: number): RgbaColor {
        let color = { r: 0, g: 0, b: 0, a: 0 };
        for (let i = 0; i < this.layers.length + this.tempLayers.length; i++) {
            let layer: Layer;
            if (i >= this.layers.length) {
                layer = this.tempLayers[i - this.layers.length]; // Finally, temp layers
            } else {
                layer = this.layers[i];
            }
            if (!layer.isActive) continue; // Skip hidden layers
            const layerColor = layer.getPixelByPos(pos);
            if (layerColor.a === 1) { // Alpha already transformed to 0-255 by layer
                color = layerColor;
            } else {
                color = rgbaBlendNormal(color, layerColor);
            }
        }
        return { r: color.r, g: color.g, b: color.b, a: color.a };
    }

    /**
     * Gets the offset in texture buffer of coords `(x, y)`.
     */
    getPos(x: number, y: number) {
        return (x + y * this.model.texture_size[0]) * 4;
    }

    get activeLayer(): Layer {
        const layer = this.layers.find(it => it.uuid == this.activeLayerId);
        if (layer == undefined) {
            throw new Error("Active layer UUID does not point to a valid layer");
        }
        return layer;
    }

}

/**
 * A `MutableSkin` layer.
 */
export class Layer {

    skin: MutableSkin;
    data: Uint8ClampedArray;
    name: string;
    isActive: boolean;

    uuid: string;

    constructor(skin: MutableSkin, name: string) {
        this.skin = skin;
        this.data = new Uint8ClampedArray(skin.model.texture_size[0] * skin.model.texture_size[1] * 4);
        this.name = name;
        this.isActive = true;
        this.uuid = crypto.randomUUID();
    }

    static fromJSON(json: any, skin: MutableSkin): Layer {
        const layer = new Layer(skin, json.name);
        layer.data.set(json.data);
        layer.isActive = json.isActive;
        layer.uuid = json.uuid;
        return layer;
    }

    toJSON(): any {
        return {
            data: Array.from(this.data),
            name: this.name,
            isActive: this.isActive,
            uuid: this.uuid,
        }
    }

    /**
     * Gets the pixel at coords `(x, y)`.
     */
    getPixel(x: number, y: number): RgbaColor {
        const c = this.getPixelByPos(this.skin.getPos(x, y));
        return { r: c.r, g: c.g, b: c.b, a: c.a };
    }

    /**
     * Gets the pixel at the given texture position `pos`.
     *
     * @param pos offset in texture buffer
     */
    getPixelByPos(pos: number): RgbaColor {
        return {
            r: this.data[pos], g: this.data[pos + 1],
            b: this.data[pos + 2], a: this.data[pos + 3],
        };
    }

    /**
     * Sets the pixel at coords `(x, y)`.
     *
     * @param x
     * @param y
     * @param color color to set
     * @param blend should color be blended (only affects colors with alpha)
     */
    setPixel(
        x: number, y: number,
        color: RgbaColor,
        blend: boolean = true,
    ) {
        this.setPixelByPos(this.skin.getPos(x, y), color, blend);
    }

    /**
     * Sets the pixel at the given texture position `pos`.
     *
     * @param pos offset in texture buffer
     * @param color color to set
     * @param blend should color be blended (only affects colors with alpha)
     */
    setPixelByPos(
        pos: number, color: RgbaColor, blend: boolean = true
    ) {
        if (blend) {
            if (color.a !== 1) { // Mix colors if color is transparent
                const current = this.getPixelByPos(pos);
                color = rgbaBlendNormal(current, color);
            }
        }
        this.data.set([color.r, color.g, color.b, color.a], pos);
        this.skin.updatePixel(pos);
    }

}

/**
 * A temporary `MutableSkin` layer.
 */
export class TempLayer extends Layer {

    set: Set<number>;

    constructor(skin: MutableSkin, name: string) {
        super(skin, name);
        this.set = new Set();
    }

    override setPixelByPos(
        pos: number, color: RgbaColor, blend: boolean = true
    ) {
        this.set.add(pos);
        super.setPixelByPos(pos, color, blend);
    }

    /**
     * Clears this layer.
     */
    clear() {
        this.set.forEach((pos) => {
            super.setPixelByPos(pos, { r: 0, g: 0, b: 0, a: 0 }, false);
        });
        this.set.clear();
    }

}