import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/components/split-panel/split-panel.js";
import { FS } from "./Helper";
import { Component } from "solid-js";
import { createFileEditor } from "./FileEditor/FileEditor";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer";

import style from "./sandbox.less";
import editorStyle from "./style/editor.less";
import previewStyle from "./style/preview.less";

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
        <>
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
                    <style>{editorStyle}</style>
                </div>
                <div class="previewer" slot="end">
                    <Previewer loadFile={loadFile}></Previewer>
                    <style>{previewStyle}</style>
                </div>
            </sl-split-panel>
            <style>{style}</style>
        </>
    );
};
