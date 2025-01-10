import { useContext } from "react";
import { DialogContext } from "../../context/DialogContext";

export function useDialog() {
    return useContext(DialogContext);
}