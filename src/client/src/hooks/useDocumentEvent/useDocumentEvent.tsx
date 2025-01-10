import {useEffect} from "react";

type DocumentEventHook = {
    <K extends keyof DocumentEventMap>(
        type: K,
        listener: (this: Document, ev: DocumentEventMap[K]) => any,
        dependencies?: any[],
    ): void;
};

function unpackValue<K extends keyof DocumentEventMap>(
    event: K | [K, AddEventListenerOptions],
): [K, AddEventListenerOptions] {
    if (typeof event === "string") {
        return [event, {}];
    }
    return event;
}

export const useDocumentEvent: DocumentEventHook = (
    type,
    listener,
    dependencies = [],
) => {
    useEffect(() => {
        const [name, options] = unpackValue(type);
        const documentOptions = typeof options === "object" ? options : {};

        document.addEventListener(name, listener, documentOptions);

        return () => {
            document.removeEventListener(name, listener, documentOptions);
        }
    }, [JSON.stringify(type), ...dependencies]);
};
