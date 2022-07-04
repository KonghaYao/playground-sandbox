import { render } from "solid-js/web";
import { Sandbox } from "./sandbox";
export const createSandbox = (element: HTMLElement) => {
    render(Sandbox, element);
};
export { FS } from "./Helper";
