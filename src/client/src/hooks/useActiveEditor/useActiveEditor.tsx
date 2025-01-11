import { useShallow } from "zustand/shallow";
import { useEditorContext } from "../../stores";

export const useActiveEditor = () => {
    const { editors, activeEditor } = useEditorContext(useShallow(({ editors, activeEditor }) => {
        return { editors, activeEditor };
    }));

    return { editor: editors[activeEditor] };
}