import "./style.css";

import { useEffect } from "react";

import { EditorPage } from "./pages/EditorPage";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import { MessagePage } from "./pages/MessagePage";
import { useSettingsContext } from "./stores";
import { DialogProvider } from "./context/DialogContext";

export default function App() {
    const { theme } = useSettingsContext();

    function createThemeLink(theme: string) {
        const themeName = theme == "auto" ? "dark" : theme;

        const link = document.createElement("link");
        link.id = "theme-link"
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = `/themes/${themeName}.css`;

        document.head.appendChild(link);
    }

    useEffect(() => {
        const themeName = theme == "auto" ? "dark" : theme;

        (document.getElementById("theme-link") as HTMLLinkElement).href = `/themes/${themeName}.css`;
    }, [theme]);

    createThemeLink(useSettingsContext.getState().theme);

    return (
        <DialogProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/editor" replace />} />
                    <Route path="/editor" element={<EditorPage />} />

                    <Route path="*" element={
                        <MessagePage>
                            <p><b>404</b> Page not found.</p>
                            <p>The URL was not found. <a href="/editor">Return to editor</a></p>
                        </MessagePage>
                    } />
                </Routes>
            </BrowserRouter>
        </DialogProvider>
    );
}