import React, { createContext, useState } from "react";
import ReactDOM from "react-dom";
import { useWindowEvent } from "../../hooks/useWindowEvent";

export const DialogContext = createContext({
    showDialog: (dialog: React.ReactNode) => {},
    hideDialog: () => {},
});

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeDialog, setActiveDialog] = useState<React.ReactNode>();

    function showDialog(dialog: React.ReactNode) {
        setActiveDialog(dialog);
    }

    function hideDialog() {
        setActiveDialog(undefined);
    }

    useWindowEvent("resize", () => {
        hideDialog();
    })

    return (
        <DialogContext.Provider value={{ showDialog, hideDialog }}>
        {children}
        {activeDialog && ReactDOM.createPortal(
            activeDialog, document.body,
        )}
        </DialogContext.Provider>
    );
};