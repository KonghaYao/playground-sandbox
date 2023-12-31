import { Split } from "solid-split-component";
import FS from "@isomorphic-git/lightning-fs";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer/Previewer";
import style from "./sandbox.module.less";
import previewStyle from "./style/preview.module.less";
import { WatchingEditor, FileEditorList } from "monaco-editor-solid";
import { atom } from "@cn-ui/reactive";


export const Sandbox = (props: {
    fs: FS;
    files: string[][];
}) => {
    /* 加载文件的方式 */
    const loadFile = async (url: string) => {
        return props.fs.promises.readFile(url, "utf8") as Promise<string>;
    };
    let watchingEditor: WatchingEditor;
    const ExplorerVisible = atom(false);
    return (
        <Split
            class={[style.sandbox, "monaco-editor"].join(" ")}
            direction="horizontal"
        >
            <div class={style.file_box}>
                <FileExplorer
                    visible={ExplorerVisible}
                    fs={props.fs}
                    openFile={(path) => {
                        props.fs.promises.readFile(path, "utf8").then((res) => {
                            watchingEditor
                                .getWatching()
                                .openFile(path, res as any as string);
                        });
                    }}
                ></FileExplorer>
                <FileEditorList
                    toggleExplorer={(bool?: boolean) => {
                        if (bool === undefined) bool = !ExplorerVisible();
                        ExplorerVisible(bool);
                    }}
                    fs={props.fs}
                    files={props.files}
                    expose={(data) => {
                        watchingEditor = data.watchingEditor;
                    }}
                ></FileEditorList>
            </div>
            <div class={previewStyle.previewer}>
                <Previewer loadFile={loadFile}></Previewer>
            </div>
        </Split>
    );
};
