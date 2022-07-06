import { render } from "solid-js/web";
import { Sandbox } from "./sandbox";
import { FS } from "./Helper";
export { FS };
import _FS from "@isomorphic-git/lightning-fs";

type TreeObject = {
    [ket: string]: TreeObject | string;
};

/* 不建议用户直接使用 FS，使用我们提供的 API 接口较好 */
class FileAPI {
    constructor(public fs: _FS) {}
    /* 将 web 地址映射到 fs 中 */
    async reflect(
        webPath: string,
        fsPath: string,
        getCode?: (webPath: string) => Promise<string> | string
    ) {
        const config = await (getCode
            ? getCode(webPath)
            : fetch(webPath).then((res) => res.text()));
        await this.fs.promises.writeFile(fsPath, config);
    }
    /* 将树状结构映射到 fs 中 */
    async mergeTree(tree: TreeObject, root = "") {
        const promises = Object.entries(tree).map(async ([key, value]) => {
            if (typeof value === "string") {
                return this.reflect(root + key, value);
            } else {
                return this.mergeTree(value, root + key + "/");
            }
        });
        await Promise.all(promises);
        return;
    }
}

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
