import { customElement } from "solid-element";
import { Sandbox } from "./sandbox";
export const createSandbox = (elementName: string = "forsee-sandbox") => {
    const comp = customElement(elementName, {}, Sandbox);

    return comp;
};
export { FS } from "./Helper";
