import { render } from "solid-js/web";
import { Sandbox } from "./sandbox";
import { FS } from "./Helper";
export { FS };
import { FileAPI } from "./FileAPI";

export const createSandbox = async (
    element: HTMLElement,
    props: {
        storeTag?: string;
        beforeMount?: (api: FileAPI) => void | Promise<void>;
    } = {}
) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    const api = new FileAPI(fs);
    props.beforeMount && (await props.beforeMount(api));
    render(() => Sandbox({ fs }), element);
    return api;
};
