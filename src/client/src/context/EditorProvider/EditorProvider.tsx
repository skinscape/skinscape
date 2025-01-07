import React, {createContext, useEffect, useState} from "react";
import {colord, HsvaColor, RgbaColor} from "colord";
import {Pencil, Tool} from "../../models/tool.ts";

type EditorProviderContextType = {
    rgba: RgbaColor,
    setRgba: (rgba: RgbaColor) => void,
    hsva: HsvaColor,
    setHsva: (hsva: HsvaColor) => void,
    tool: Tool,
    setTool: (tool: Tool) => void,
    overlay: boolean,
    setOverlay: (gridlines: boolean) => void,
    gridlines: boolean,
    setGridlines: (gridlines: boolean) => void,
    needsUpdate: boolean,
    setNeedsUpdate: (needsUpdate: boolean) => void,
};

const defaultValue = {
    rgba: { r: 255, g: 0, b: 0, a: 1 },
    setRgba: () => {},
    hsva: { h: 0, s: 100, v: 100, a: 1 },
    setHsva: () => {},
    tool: new Pencil(),
    setTool: () => {},
    overlay: false,
    setOverlay: () => {},
    gridlines: false,
    setGridlines: () => {},
    needsUpdate: false,
    setNeedsUpdate: () => {},
} as EditorProviderContextType;

const EditorContext = createContext(defaultValue);

const EditorContextProvider: React.FC<{ children: any }> = ({ children }) => {
    const lsKey = "editorContext";

    const saved = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
    const [rgba, setRgba] = useState<RgbaColor>(saved.rgba ?? defaultValue.rgba);
    const [hsva, setHsva] = useState<HsvaColor>(colord(rgba).toHsv());
    const [tool, setTool] = useState<Tool>(new Pencil());
    const [overlay, setOverlay] = useState<boolean>(saved.overlay ?? defaultValue.overlay);
    const [gridlines, setGridlines] = useState<boolean>(saved.gridlines ?? defaultValue.gridlines);
    const [needsUpdate, setNeedsUpdate] = useState<boolean>(false);

    // load from local storage
    useEffect(() => {
        const savedObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
        console.log(savedObj);

        const setIfDifferent = (
            setFunc: any,
            key: string,
            value: any,
            defaultValue: any = false
        ) => {
            setFunc(savedObj[key] || value || defaultValue);
        };

        setIfDifferent((rgba: RgbaColor) => {
            setRgba(rgba);
            setHsva(colord(rgba).toHsv());
        }, "rgba", rgba, defaultValue.rgba);

        setIfDifferent(setOverlay, "overlay", overlay, defaultValue.overlay);
        setIfDifferent(setGridlines, "gridlines", gridlines, defaultValue.gridlines);

    }, [localStorage]);

    // save to local storage
    useEffect(() => {
        const oldObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");
        let dirty = false;

        const assignIfDiffAndNotUndefined = (key: string, value: any) => {
            if (oldObj[key] !== value && value !== undefined) {
                oldObj[key] = value;
                dirty = true;
            }
        };

        assignIfDiffAndNotUndefined("rgba", rgba);
        assignIfDiffAndNotUndefined("overlay", overlay);
        assignIfDiffAndNotUndefined("gridlines", gridlines);

        if (!dirty) return;

        const newObj = { ...oldObj };
        localStorage.setItem(lsKey, JSON.stringify(newObj));
    }, [rgba, overlay, gridlines]);

    const value = {
        rgba,
        setRgba,
        hsva,
        setHsva,
        tool,
        setTool,
        overlay,
        setOverlay,
        gridlines,
        setGridlines,
        needsUpdate,
        setNeedsUpdate,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
}

// export { EditorContext, EditorContextProvider };