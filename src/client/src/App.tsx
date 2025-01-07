import "./style.css";

import React, {useContext, useEffect} from "react";

import {SettingsContext, SettingsContextProvider} from "./context/SettingsProvider";
import {EditorPage} from "./pages/EditorPage";
import {BrowserRouter, Route, Routes, Navigate} from "react-router";
import {MessagePage} from "./pages/MessagePage";

export default function App() {
    const { theme } = useContext(SettingsContext);

    useEffect(() => {
        const themeName = theme == "auto" ? "dark" : theme;

        const link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = `/themes/${themeName}.css`;

        document.head.appendChild(link);
        return () => { document.head.removeChild(link); }
    }, [theme]);

    return (
        <SettingsContextProvider>
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
        </SettingsContextProvider>
    );
}