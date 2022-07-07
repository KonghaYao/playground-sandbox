import { render } from "solid-js/web";
import { Sandbox, SandboxInput } from "./sandbox";
import { FS } from "./Helpers/Helper";
export { FS };
import { FileAPI } from "./FileAPI";

export const createSandbox = async (
    element: HTMLElement,
    sandboxOptions: Omit<SandboxInput, "fs">,
    props: {
        storeTag?: string;
        beforeMount?: (api: FileAPI) => void | Promise<void>;
    } = {}
) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    const api = new FileAPI(fs);
    props.beforeMount && (await props.beforeMount(api));
    render(() => Sandbox({ ...sandboxOptions, fs }), element);
    return api;
};
