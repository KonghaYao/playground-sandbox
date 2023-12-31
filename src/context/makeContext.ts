import { createContext, useContext } from "solid-js";

export const makeContext = <T>(defaultContext: () => T) => {
    const c = createContext<T>(defaultContext());
    return {
        ...c,
        use: () => useContext(c)!
    }
};
