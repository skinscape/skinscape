import { Editor } from "../models/editor";
import { useEditorContext } from "../stores";

/** 
 * @returns most recently interacted editor
 */
export function getActiveEditor(): Editor {
    const { editors, activeEditor } = useEditorContext.getState();

    return editors[activeEditor];
}