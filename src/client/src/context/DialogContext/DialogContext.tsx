import React, { createContext, useState, useRef } from "react";
import ReactDOM from "react-dom";

export const DialogContext = createContext({
    showDialog: (dialog: React.ReactNode) => {},
    hideDialog: () => {},
});

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeDialog, setActiveDialog] = useState<React.ReactNode>();
    const dialogRef = useRef<HTMLDivElement>(null);

    function showDialog(dialog: React.ReactNode) {
        setActiveDialog(dialog);
    }
    function hideDialog() {
        setActiveDialog(undefined);
    }

    return (
        <DialogContext.Provider value={{ showDialog, hideDialog }}>
        {children}
        {activeDialog && ReactDOM.createPortal(
            <div className="dialog-container" onClick={hideDialog}>
                <div 
                    ref={dialogRef}
                    className="dialog"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.stopPropagation()}
                >
                    {activeDialog}
                </div>
            </div>,
            document.body,
        )}
        </DialogContext.Provider>
    );
};