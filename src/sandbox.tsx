import { Split } from "solid-split-component";
import { FileExplorer } from "./FileExplorer";
import { Previewer } from "./Previewer/Previewer";
import style from "./sandbox.module.less";
import previewStyle from "./style/preview.module.less";
import { WatchingEditor, FileEditorList } from "monaco-editor-solid";
import { atom } from "@cn-ui/reactive";
import { Show } from "solid-js";
import { SandboxContext } from "./context/sandbox";

export interface SandboxInput {
    files: string[][];
    onMount?: (context: typeof SandboxContext.defaultValue) => Promise<void>
}
export const Sandbox = (props: SandboxInput) => {
    let watchingEditor: WatchingEditor;
    const ExplorerVisible = atom(false);
    const context = SandboxContext.use()
    return (
        <Split
            class={[style.sandbox, "monaco-editor"].join(" ")}
            direction="horizontal"
        >
            <div class={style.file_box}>
                <Show when={context.fs()}>
                    <FileExplorer
                        visible={ExplorerVisible}
                        openFile={(path) => {
                            context.fs().readFile(path, "utf8").then((res) => {
                                watchingEditor
                                    .getWatching()
                                    .openFile(path, res as unknown as string);
                            });
                        }}
                    ></FileExplorer>
                    <FileEditorList
                        toggleExplorer={(bool?: boolean) => {
                            if (bool === undefined) bool = !ExplorerVisible();
                            ExplorerVisible(bool);
                        }}
                        fs={{ promises: context.fs() }}
                        files={props.files}
                        expose={(data) => {
                            watchingEditor = data.watchingEditor;
                        }}
                    ></FileEditorList>
                </Show>
            </div>
            <div class={previewStyle.previewer}>
                <Previewer></Previewer>
            </div>
        </Split>
    );
};
