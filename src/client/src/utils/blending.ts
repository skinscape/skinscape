import type {RgbaColor} from "colord";

export function rgbaBlendNormal(backdrop: RgbaColor, src: RgbaColor) {
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