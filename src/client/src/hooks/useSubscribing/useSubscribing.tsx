import {useEffect} from "react";
import {StoreApi} from "zustand";

type SubscribeHook = {
    <K extends object>(
        type: StoreApi<K>,
        listener: (state: K) => any,
        dependencies?: any[],
    ): void;
};

export const useSubscribing: SubscribeHook = (
    store,
    listener,
    dependencies = [],
) => {
    useEffect(() => {
        listener(store.getState()); // Provide initial value

        const unsubscribe = store.subscribe(listener);
        return () => {
            unsubscribe();
        }
    }, [...dependencies]);
};
