import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.77/dist/components/split-panel/split-panel.js";
import { FS } from "./Helper";
import { Component } from "solid-js";
import { IframeFactory } from "./IframeFactory";
import "./index.css";
/* 用于承载 Iframe */
const Shower: Component<{
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
export { FS };

import { FileExplorer } from "./FileExplorer";
const FileSystem: Component<{
    fs: FS;
}> = (props) => {
    return (
        <div>
            <FileExplorer fs={props.fs}></FileExplorer>
            <nav class="file-editor"></nav>
        </div>
    );
};

export const Sandbox: Component<{
    storeTag?: string;
}> = (props = {}) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    let port: MessagePort | undefined = undefined;
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return fs.promises.readFile(url, "utf8");
    };

    /* 用于创建 Iframe 对象 */
    const createIframe = IframeFactory(loadFile);
    return (
        <sl-split-panel class="forsee-sandbox">
            <div slot="start">
                <FileSystem fs={fs}></FileSystem>
            </div>
            <div slot="end">
                <Shower port={port} ready={createIframe}></Shower>
            </div>
        </sl-split-panel>
    );
};
