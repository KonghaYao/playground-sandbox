import { createContext, useContext } from "solid-js";
import { createAPI } from "./createAPI";
import { createSingleEditor } from "./createSingleEditor";
export function createEditor() {
    const EditorContext = createContext<ReturnType<typeof createAPI>>();
    return [createSingleEditor(EditorContext), useContext(EditorContext)];
}
