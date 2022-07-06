import { render } from "solid-js/web";
import { Sandbox } from "./sandbox";
import { FS } from "./Helper";
export { FS };
import _FS from "@isomorphic-git/lightning-fs";
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
}

export const createSandbox = (
    element: HTMLElement,
    props: {
        storeTag?: string;
    } = {}
) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    render(() => Sandbox({ fs }), element);
    return new FileAPI(fs);
};
