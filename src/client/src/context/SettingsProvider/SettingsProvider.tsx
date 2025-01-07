import React, {createContext, useEffect, useState} from "react";

export type Theme = "auto" | "light" | "dark" | "aseprite" | "modern-dark";

type SettingsProviderContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
};

const defaultValue = {
    theme: "dark",
    setTheme: () => {},
} as SettingsProviderContextType;

const SettingsContext = createContext(defaultValue);

const SettingsContextProvider: React.FC<{ children: any }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(defaultValue.theme);

    const lsKey = "settings";

    // load from local storage
    useEffect(() => {
        const savedObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");

        const setIfDifferent = (
            setFunc: any,
            key: string,
            value: any,
            defaultValue: any = false,
        ) => {
            setFunc(savedObj[key] || value || defaultValue);
        };

        setIfDifferent(setTheme, "theme", theme, "auto");
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

        assignIfDiffAndNotUndefined("theme", theme);

        if (!dirty) return;

        const newObj = { ...oldObj };
        localStorage.setItem(lsKey, JSON.stringify(newObj));
    }, [theme]);

    const value = {
        theme,
        setTheme,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsContextProvider };