import { EyedropperHandler, getTool } from "../../models/tool";
import { useEditorViewContext, useToolContext } from "../../stores";
import { getActiveEditor } from "../../utils/stores";
import { useDocumentEvent } from "../../hooks/useDocumentEvent";

let previousTool: string;

const keybinds: {
    [key: string]: () => void, 
} = {
    "G": () => {
        const { gridlines, setGridlines } = useEditorViewContext.getState();
        setGridlines(!gridlines);
    },
    "O": () => {
        const { overlay, setOverlay } = useEditorViewContext.getState();
        setOverlay(!overlay);
    },
    "B": () => {
        useToolContext.getState().setActiveTool("pencil");
    },
    "I": () => {
        useToolContext.getState().setActiveTool("eyedropper");
    },
    "SHIFT": () => {
        const { activeTool, setActiveTool } = useToolContext.getState();
        previousTool = activeTool;
        setActiveTool("eyedropper");
        (getTool("eyedropper").handler as EyedropperHandler).previous = "eyedropper";
    },
    "CTRL+Z": () => {
        getActiveEditor().activeSkin?.history.undo();
    },
    "CTRL+Y": () => {
        getActiveEditor().activeSkin?.history.redo();
    }
}

export const useEditorKeybinds = () => {
    useDocumentEvent("keydown", (event: KeyboardEvent) => {
        if (event.repeat) return;

        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const isAltPressed = event.altKey;

        for (const combination of Object.keys(keybinds)) {
            let ctrl = isCtrlPressed;
            let shift = isShiftPressed;
            let alt = isAltPressed;

            if (combination.split("+").every(key => {
                if (key == "CTRL") {
                    ctrl = !ctrl;
                    return true;
                }
                if (key == "SHIFT") {
                    shift = !shift;
                    return true;
                }
                if (key == "ALT") {
                    alt = !alt;
                    return true;
                }
                return event.key.toUpperCase() == key;
            })) {
                if (!ctrl && !shift && !alt) {
                    keybinds[combination]();
                    event.stopPropagation();
                    return;
                }
            }
        }
    });
    useDocumentEvent("keyup", (event: KeyboardEvent) => {
        // for SHIFT keybind...
        if (event.key === "Shift" && previousTool != undefined) {
            useToolContext.getState().setActiveTool(previousTool);
        }
    });
};