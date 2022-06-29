import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.77/dist/components/split-panel/split-panel.js";
import {
    FS,
    /* @ts-ignore  */
} from "../rollup-web/dist/adapter/Fetcher/FSFetcher.js";
import { Component, createSignal, For } from "solid-js";
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

import { getIconForFile } from "vscode-icons-js";
const FileSystem: Component<{
    fs: FS;
}> = (props) => {
    const [path, setPath] = createSignal("/");
    const [fileList, setFileList] = createSignal([] as string[]);
    const getFileList = async (path: string) => {
        return props.fs.promises.readdir(path, {
            withFileTypes: true,
        }) as Promise<string[]>;
    };
    const jumpTo = async (newPath: string) => {
        const stats = await props.fs.promises.stat(newPath);
        if (stats.isFile()) {
            console.log("this is a file");
        } else {
            getFileList(newPath).then((res) => {
                setFileList(res);
                setPath(newPath);
            });
        }
    };
    const enter = (item: string) => {
        const newPath = `${path()}${item}/`;
        return jumpTo(newPath);
    };
    const back = () => {
        const newPath = path().replace(/[^\/]+\/$/, "");
        if (newPath !== path()) {
            return jumpTo(newPath);
        }
        return;
    };

    jumpTo("/");
    return (
        <div>
            <nav class="file-explorer">
                <header>
                    <div class="material-icons" onclick={back}>
                        keyboard_arrow_left
                    </div>
                    <input type="text" value={path()} />
                </header>
                <div class="file-list">
                    <For each={fileList()}>
                        {(item) => {
                            const src =
                                "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/" +
                                getIconForFile(item);
                            return (
                                <span
                                    onclick={() => enter(item)}
                                    class="single-tab"
                                >
                                    <img src={src} alt="" />
                                    {item}
                                </span>
                            );
                        }}
                    </For>
                </div>
            </nav>
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
