import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.77/dist/components/split-panel/split-panel.js";
import { FS } from "./Helper";
export { FS };
import { Component } from "solid-js";
import { IframeFactory } from "./IframeFactory";
import "./index.css";

/* 用于承载 Iframe */
const Previewer: Component<{
    port?: MessagePort;
    ready: (el: HTMLElement) => void;
}> = (props) => {
    return (
        <div class="previewer">
            <header>
                <div class="material-icons">replay</div>
                <input type="text"></input>
            </header>
            <main ref={(el) => props.ready(el)}></main>
        </div>
    );
};

import { FileExplorer } from "./FileExplorer";
export const Sandbox: Component<{
    storeTag?: string;
}> = (props = {}) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    let port: MessagePort | undefined = undefined;
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return fs.promises.readFile(url, "utf8") as Promise<string>;
    };

    /* 用于创建 Iframe 对象 */
    const createIframe = IframeFactory(loadFile);
    return (
        <sl-split-panel class="forsee-sandbox">
            <div slot="start">
                <FileExplorer fs={fs} openFile={(path) => {}}></FileExplorer>
                <nav class="file-editor"></nav>
            </div>
            <div slot="end">
                <Previewer port={port} ready={createIframe}></Previewer>
            </div>
        </sl-split-panel>
    );
};
