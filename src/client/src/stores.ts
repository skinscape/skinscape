import create from 'zustand';
import {persist} from "zustand/middleware";
import {colord, HsvaColor, RgbaColor} from "colord";
import {getTool, ToolProps} from "./models/tool.ts";

export const useColorContext = create(
    persist(
        (set, get) => ({
            rgba: { r: 255, g: 0, b: 0, a: 1 },
            setRgba: (rgba: RgbaColor) => set({
                rgba: rgba,
                hsva: colord(rgba).toHsv(),
            }),
            hsva: { h: 0, s: 100, v: 100, a: 1 },
            setHsva: (hsva: HsvaColor) => set({
                hsva: hsva,
                rgba: colord(hsva).toRgb(),
            }),
        }),
        {
            name: 'colorContext',
        },
    ),
);

export const useToolContext = create(
    persist(
        (set, get) => ({
            activeTool: "pencil",
            setActiveTool: (activeTool: string) => {
                if (activeTool === "eyedropper") { // @ts-ignore
                    getTool("eyedropper").handler.previous = get().activeTool;
                }
                set({ activeTool });
            },
            toolProps: {
                pencil: { size: 1 },
                eraser: { size: 1 },
                fill: { tolerance: 0 },
            },
            setToolProps: (toolProps: ToolProps) => set({ toolProps }),
        }),
        {
            name: 'toolContext',
        },
    ),
);

export const useEditorContext = create(
    persist(
        (set, get) => ({
            overlay: false,
            setOverlay: (overlay: boolean) => set({ overlay }),
            gridlines: false,
            setGridlines: (gridlines: boolean) => set({ gridlines }),
        }),
        {
            name: 'editorContext',
        },
    ),
);
