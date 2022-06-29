import {
    fs,
    /* @ts-ignore  */
} from "../rollup-web/dist/adapter/Fetcher/FSFetcher.js";
import {
    IframeEnv,
    /* @ts-ignore  */
} from "../rollup-web/dist/Iframe.js";

import {
    Evaluator,
    /* @ts-ignore  */
} from "../rollup-web/dist/index.js";
import { Component } from "solid-js";
export { fs };
/* 从 fs 加载文件 */
const loadFile = async (url: string) => {
    return fs.promises.readFile(url, "utf8");
};
async function createCompilerPort(): Promise<MessagePort> {
    const code = await loadFile("/rollup.config.web.js");
    const file = new File([code], "index.js", {
        type: "text/javascript",
    });
    const url = URL.createObjectURL(file);
    const Eval = new Evaluator();
    await Eval.useWorker(url);
    return Eval.createCompilerPort();
}

type Config = { target?: string };
async function createIframe(container: HTMLElement) {
    // 构建 Compiler 线程
    if (!port) port = await createCompilerPort();
    // 构建 json 配置文件
    const config: Config = await loadFile("/rollup.setting.json").then(
        (res) => {
            return JSON.parse(res);
        },
        () => ({})
    );
    // 构建 Iframe
    const iframe = new IframeEnv();
    const initHTML = config.target || "/index.html";
    fs.promises.readFile(initHTML).then(() => {
        const root = new URL("/index.html", location.href).toString();
        console.log(root);
        return iframe.mount({
            port,
            container,
            getFile(src: string) {
                return fs.promises.readFile(src, "utf8");
            },
            src: initHTML,
            root,
        });
    });
}

let port: MessagePort;
export const Sandbox: Component<{}> = (props) => {
    return (
        <div>
            <div
                ref={(el) => {
                    createIframe(el);
                }}
            ></div>
        </div>
    );
};
