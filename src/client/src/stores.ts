import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { colord, HsvaColor, RgbaColor } from "colord";
import { EyedropperHandler, getTool, ToolProps } from "./models/tool.ts";
import { Editor } from "./models/editor.ts";

type ColorState = {
    rgba: RgbaColor,
    setRgba: (rgba: RgbaColor) => any,
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => any,
};

export const useColorContext = create<ColorState>()(
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
            name: "colorContext",
        },
    ),
);

type ToolState = {
    activeTool: string,
    setActiveTool: (activeTool: string) => void,
    toolProps: ToolProps,
    setToolProps: (toolProps: ToolProps) => void,
};

export const useToolContext = create<ToolState>()(
    persist(
        (set, get) => ({
            activeTool: "pencil",
            setActiveTool: (activeTool: string) => {
                if (activeTool == "eyedropper") {
                    (getTool("eyedropper").handler as EyedropperHandler).previous = get().activeTool;
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
            name: "toolContext",
        },
    ),
);

type EditorViewState = {
    overlay: boolean,
    setOverlay: (overlay: boolean) => void,
    gridlines: boolean,
    setGridlines: (gridlines: boolean) => void,
    elementToggles: Array<string>,
    setElementToggles: (elementToggles: Array<string>) => void,
};

export const useEditorViewContext = create<EditorViewState>()(
    persist(
        (set, get) => ({
            overlay: false,
            setOverlay: (overlay: boolean) => set({ overlay }),
            gridlines: false,
            setGridlines: (gridlines: boolean) => set({ gridlines }),
            elementToggles: [],
            setElementToggles: (elementToggles: Array<string>) => set({ elementToggles }),
        }),
        {
            name: "editorViewContext",
        },
    ),
);

type SettingsState = {
    theme: string,
    setTheme: (theme: string) => void,
};

export const useSettingsContext = create<SettingsState>()(
    persist(
        (set, get) => ({
            theme: "dark",
            setTheme: (theme: string) => set({ theme }),
        }),
        {
            name: "settingsContext",
        },
    ),
);

type EditorState = {
    editors: Array<Editor>,
    setEditors: (editors: Array<Editor>) => void,
    activeEditor: number,
    setActiveEditor: (activeEditor: number) => void,
};

const editorStorage = createJSONStorage(() => localStorage, {
    reviver: (key: string, value: any) => {
        if (key == "editors") {
            return value.map((it: any) => Editor.fromJSON(it));
        }
        return value;
    }
});

export const useEditorContext = create<EditorState>()(
    persist(
        (set, get) => ({
            editors: [new Editor()],
            setEditors: (editors: Array<Editor>) => {
                let { activeEditor } = get();
                const filtered = editors.filter(editor => editor.skins.length > 0);
                
                if (filtered.length == 0) {
                    filtered.push(new Editor());
                }
                if (activeEditor >= filtered.length) activeEditor = 0;

                set({ editors: filtered, activeEditor });
            },
            activeEditor: 0,
            setActiveEditor: (activeEditor: number) => set({ activeEditor }),
        }),
        {
            name: "editorContext",
            storage: editorStorage,
        },
    ),
);