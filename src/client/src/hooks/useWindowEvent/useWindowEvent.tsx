import {useEffect} from "react";

type WindowEventHook = {
    <K extends keyof WindowEventMap>(
        type: K,
        listener: (this: Window, ev: WindowEventMap[K]) => any,
        dependencies?: any[],
    ): void;
};

function unpackValue<K extends keyof WindowEventMap>(
    event: K | [K, AddEventListenerOptions],
): [K, AddEventListenerOptions] {
    if (typeof event === "string") {
        return [event, {}];
    }
    return event;
}

export const useWindowEvent: WindowEventHook = (
    type,
    listener,
    dependencies = [],
) => {
    useEffect(() => {
        const [name, options] = unpackValue(type);
        const windowOptions = typeof options === "object" ? options : {};

        window.addEventListener(name, listener, windowOptions);

        return () => {
            window.removeEventListener(name, listener, windowOptions);
        }
    }, [JSON.stringify(type), ...dependencies]);
};
