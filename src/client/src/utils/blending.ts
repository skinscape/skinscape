import type {RgbaColor} from "colord";

export type BlendFunc = (backdrop: RgbaColor, src: RgbaColor) => RgbaColor;

export function blendData(
    backdrop: Uint8ClampedArray,
    src: Uint8ClampedArray,
    func: BlendFunc
): Uint8ClampedArray {
    if (backdrop.length !== src.length) throw Error("Unmatched data source lengths");
    const result = new Uint8ClampedArray(backdrop.length);

    for (let i = 0; i < backdrop.length; i += 4) {
        const a = { r: backdrop[i], g: backdrop[i + 1], b: backdrop[i + 2], a: backdrop[i + 3] };
        const b = { r: src[i], g: src[i + 1], b: src[i + 2], a: src[i + 3] };
        const blended = func(a, b);
        result.set([blended.r, blended.g, blended.b, blended.a], i);
    }

    return result;
}

export function rgbaBlendNormal(backdrop: RgbaColor, src: RgbaColor): RgbaColor {
    if (backdrop.a === 0) return Object.assign({}, src);
    else if (src.a === 0) return Object.assign({}, backdrop);
    else if (src.a === 1) return Object.assign({}, src);

    const { r: r1, g: g1, b: b1, a: a1 } = backdrop;
    const { r: r2, g: g2, b: b2, a: a2 } = src;

    const a = (a2 / 255) + (a1 / 255) * (1 - (a2 / 255));

    const r = r1 + (r2 - r1) * (a2 / 255) / a;
    const g = g1 + (g2 - g1) * (a2 / 255) / a;
    const b = b1 + (b2 - b1) * (a2 / 255) / a;

    return { r: r, g: g, b: b, a: a * 255 };
}