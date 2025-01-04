import {createContext, useEffect, useState} from "react";

export type Metric = "RV" | "CV";

type SettingsProviderContextType = {
    metric?: Metric;
    setMetric: (metric: Metric) => void;
};

const defaultValue = {
    metric: "RV",
    setMetric: () => {},
} as SettingsProviderContextType;

const SettingsContext = createContext(defaultValue);

const SettingsContextProvider: React.FC<{ children: any }> = ({ children }) => {
    const [metric, setMetric] = useState<Metric>();

    const lsKey = "settings";

    // load from local storage
    useEffect(() => {
        const savedObj = JSON.parse(localStorage.getItem(lsKey) ?? "{}");

        const setIfDifferent = (
            setFunc: any,
            key: string,
            value: any,
            defaultValue: any = false
        ) => {
            setFunc(savedObj[key] || value || defaultValue);
        };

        setIfDifferent(setMetric, "metric", metric, "RV");
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

        assignIfDiffAndNotUndefined("metric", metric);

        if (!dirty) return;

        const newObj = { ...oldObj };
        localStorage.setItem(lsKey, JSON.stringify(newObj));
    }, [metric]);

    const value = {
        metric,
        setMetric,
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export { SettingsContext, SettingsContextProvider };