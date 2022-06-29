import {
    FS,
    /* @ts-ignore  */
} from "../rollup-web/dist/adapter/Fetcher/FSFetcher.js";

import { Component } from "solid-js";
import { IframeFactory } from "./LoadFile";

const Shower: Component<{
    port?: MessagePort;
    ready: (el: HTMLDivElement) => void;
}> = (props) => {
    return <div ref={(el) => props.ready(el)}></div>;
};

export const Sandbox: Component<{
    storeTag?: string;
}> = (props) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");
    let port: MessagePort | undefined = undefined;
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return fs.promises.readFile(url, "utf8");
    };

    /* 用于创建 Iframe 对象 */
    const createIframe = IframeFactory(loadFile);

    return (
        <div>
            <Shower port={port} ready={createIframe}></Shower>
        </div>
    );
};
