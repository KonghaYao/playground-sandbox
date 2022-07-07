import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/components/split-panel/split-panel.js";
import FS from "@isomorphic-git/lightning-fs";
import { Component, createSignal } from "solid-js";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer/Previewer";
import style from "./sandbox.module.less";
import previewStyle from "./style/preview.module.less";
import { WatchingEditor, FileEditorList } from "./FileEditor/FileExidtorList";
export type SandboxInput = {
    fs: FS;
    files: string[][];
};
export const Sandbox: Component<SandboxInput> = (props) => {
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return props.fs.promises.readFile(url, "utf8") as Promise<string>;
    };
    let watchingEditor: WatchingEditor;
    const [ExplorerVisible, setExplorerVisible] = createSignal(false);
    return (
        <>
            <sl-split-panel class={style.sandbox}>
                <div class={style.file_box} slot="start">
                    <FileExplorer
                        visible={ExplorerVisible}
                        fs={props.fs}
                        openFile={(path) => {
                            props.fs.promises
                                .readFile(path, "utf8")
                                .then((res) => {
                                    watchingEditor
                                        .getWatching()
                                        .openFile(path, res as any as string);
                                });
                        }}
                    ></FileExplorer>
                    <FileEditorList
                        toggleExplorer={() => {
                            setExplorerVisible(!ExplorerVisible());
                            console.log(ExplorerVisible());
                        }}
                        fs={props.fs}
                        files={props.files}
                        expose={(data) => {
                            watchingEditor = data.watchingEditor;
                        }}
                    ></FileEditorList>
                </div>
                <div class={previewStyle.previewer} slot="end">
                    <Previewer loadFile={loadFile}></Previewer>
                </div>
            </sl-split-panel>
        </>
    );
};
