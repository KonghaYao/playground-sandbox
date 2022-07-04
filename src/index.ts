import { customElement } from "solid-element";
import { Sandbox } from "./sandbox";

export const createSandbox = (elementName: string = "sandbox") => {
    return customElement(elementName, {}, Sandbox);
};
export { FS } from "./Helper";
