import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.0.0-beta.77/dist/components/split-panel/split-panel.js";
import { FS } from "./Helper";
export { FS };
import { Component } from "solid-js";
import "./index.css";

import { createFileEditor } from "./FileEditor";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer";
export const Sandbox: Component<{
    storeTag?: string;
}> = (props = {}) => {
    const fs = new FS(props.storeTag || "_rollup_web_store_");

    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return fs.promises.readFile(url, "utf8") as Promise<string>;
    };

    const [FileEditor, controller] = createFileEditor();
    controller.hub.on("save", (model) => {
        fs.promises.writeFile(model.path, model.model.getValue());
        console.log("写入 ", model.path, "成功");
    });
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
                <Previewer loadFile={loadFile}></Previewer>
            </div>
        </sl-split-panel>
    );
};
