import {
    FS,
    /* @ts-ignore  */
} from "../rollup-web/dist/adapter/Fetcher/FSFetcher.js";

import { Component, createResource, createSignal, For } from "solid-js";
import { IframeFactory } from "./LoadFile";
import "./index.css";
/* 用于承载 Iframe */
const Shower: Component<{
    port?: MessagePort;
    ready: (el: HTMLDivElement) => void;
}> = (props) => {
    return <div ref={(el) => props.ready(el)}></div>;
};
export { FS };
const FileSystem: Component<{
    fs: FS;
}> = (props) => {
    const [path, setPath] = createSignal("/");
    const [fileList, { refetch: reLoadFileList }] = createResource(() => {
        return props.fs.promises.readdir(path()) as string[];
    });
    const enter = (item: string) => {
        setPath(`${path()}${item}/`);
        reLoadFileList();
    };
    return (
        <div>
            <div class="file-system">
                <header>{path}</header>
                <ul>
                    <For each={fileList()}>
                        {(item) => <li onclick={() => enter(item)}>{item}</li>}
                    </For>
                </ul>
            </div>
        </div>
    );
};
import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.77/dist/components/split-panel/split-panel.js";
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
                {" "}
                <FileSystem fs={fs}></FileSystem>
            </div>
            <div slot="end">
                <Shower port={port} ready={createIframe}></Shower>
            </div>
        </sl-split-panel>
    );
};
