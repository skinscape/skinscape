import {Skin} from "./skin.ts";

export function getSkinSubsection(
    skin: Skin,
    x: number, y: number,
    w: number, h: number): Uint8ClampedArray {
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

export function generateFaviconDataUrl(rgbaArray: Uint8ClampedArray, size: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Create ImageData
    const imageData = ctx.createImageData(size, size);
    imageData.data.set(rgbaArray);

    ctx.putImageData(imageData, 0, 0);

    // Scale up for better visibility
    const scaledCanvas = document.createElement('canvas');
    const scale = 16; // Scale factor
    scaledCanvas.width = size * scale;
    scaledCanvas.height = size * scale;
    const scaledCtx = scaledCanvas.getContext('2d')!;
    scaledCtx.imageSmoothingEnabled = false; // Prevent blurring
    scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);

    return scaledCanvas.toDataURL('image/png');
}