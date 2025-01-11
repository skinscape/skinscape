import { useWindowEvent } from "../../hooks/useWindowEvent";
import { useEditorViewContext, useToolContext } from "../../stores";
import { getActiveEditor } from "../../utils/stores";

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
    "CTRL+Z": () => {
        getActiveEditor().activeSkin?.history.undo();
    },
    "CTRL+Y": () => {
        getActiveEditor().activeSkin?.history.redo();
    }
}

export const useEditorKeybinds = () => {
    useWindowEvent("keydown", (event: KeyboardEvent) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        for (const combination of Object.keys(keybinds)) {
            let ctrl = isCtrlPressed;
            let shift = isShiftPressed;

            if (combination.split("+").every(key => {
                if (key == "CTRL") {
                    ctrl = !ctrl;
                    return true;
                }
                if (key == "SHIFT") {
                    shift = !shift;
                    return true;
                }
                return event.key.toUpperCase() == key;
            })) {
                if (!ctrl && !shift) {
                    keybinds[combination]();
                    return;
                }
            }
        }
    });
};