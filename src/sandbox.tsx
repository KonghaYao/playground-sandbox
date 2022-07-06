import "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace/dist/components/split-panel/split-panel.js";
import FS from "@isomorphic-git/lightning-fs";
import { Component, createSignal, For, onCleanup } from "solid-js";
import { createFileEditor } from "./FileEditor/FileEditor";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer";
import style from "./sandbox.module.less";
import previewStyle from "./style/preview.module.less";
import { FileModel } from "./FileEditor/FileModel";
export type SandboxInput = {
    fs: FS;
    files: string[][];
};
type Expose = {
    watchingEditor: any;
};
const FileEditorList: Component<{
    files: string[][];
    fs: FS;
    expose: (data: Expose) => void;
}> = (props) => {
    const fs = props.fs;
    const [fileList, setFileList] = createSignal(props.files);
    const save = (model: FileModel) => {
        fs.promises.writeFile(model.path, model.model.getValue());
        console.log("写入 ", model.path, "成功");
    };
    const getFile = async (path: string) => {
        const code = (await fs.promises.readFile(
            path,
            "utf8"
        )) as any as string;
        return { code };
    };
    const [FileEditor, ControllerList, watchingEditor] = createFileEditor(
        (manager) => {
            manager.hub.on("save", save);
        }
    );
    props.expose({ watchingEditor });
    onCleanup(() => {
        ControllerList.forEach((manager) => manager.hub.off("save", save));
    });
    return (
        <div class={style.editor_list}>
            <header class={style.editor_header}>
                <div>File Editor</div>
                <span></span>
            </header>
            {/* 使用循环遍历构建多个 Editor */}
            <For each={fileList()}>
                {(el) => {
                    return (
                        <FileEditor
                            fileList={el}
                            getFile={getFile}
                            closeSelf={() => {
                                const newList = fileList().filter(
                                    (i) => !Object.is(i, el)
                                );
                                setFileList(newList);
                            }}
                        ></FileEditor>
                    );
                }}
            </For>
        </div>
    );
};

export const Sandbox: Component<SandboxInput> = (props) => {
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return props.fs.promises.readFile(url, "utf8") as Promise<string>;
    };
    let watchingEditor: any;
    return (
        <>
            <sl-split-panel class={style.sandbox}>
                <div class={style.file_box} slot="start">
                    <FileExplorer
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
