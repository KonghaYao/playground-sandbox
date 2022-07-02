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
        <>
            <header>
                <div class="material-icons">replay</div>
                <input type="text"></input>
            </header>
            <main class="iframe-container" ref={(el) => props.ready(el)}></main>
        </>
    );
};
import { createFileEditor } from "./FileEditor";
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
    const [FileEditor, controller] = createFileEditor();
    return (
        <sl-split-panel class="forsee-sandbox">
            <div class="file-box" slot="start">
                <FileExplorer
                    fs={fs}
                    openFile={(path) => {
                        console.log(path);
                        fs.promises.readFile(path, "utf8").then((res) => {
                            controller.openFile(path, res as any as string);
                        });
                    }}
                ></FileExplorer>
                <FileEditor
                    fileList={["/index.html", "/rollup.config.web.js"]}
                    getFile={async (path) => {
                        const code = (await fs.promises.readFile(
                            path,
                            "utf8"
                        )) as any as string;
                        return { code };
                    }}
                ></FileEditor>
            </div>
            <div class="previewer" slot="end">
                <Previewer port={port} ready={createIframe}></Previewer>
            </div>
        </sl-split-panel>
    );
};
