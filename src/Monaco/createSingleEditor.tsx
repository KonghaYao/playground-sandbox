import { Component, Context, createEffect, onMount } from "solid-js";
import FS from "@isomorphic-git/lightning-fs";
import { Monaco } from "./cdn";
import { getMonaco } from "./getMonaco";
import { createAPI } from "./createAPI";

/* 单个文件编辑器 */
export const createSingleEditor: (
    context: Context<ReturnType<typeof createAPI> | undefined>
) => Component<{
    path: string;
    fs: FS;

    onSave: (path: string, code: string) => void;
}> = (EditorContext) => (props) => {
    let monacoEditor: ReturnType<Monaco["editor"]["create"]>;

    /* 获取源代码 */
    const getSourceCode = async () => {
        return props.fs.promises.readFile(
            props.path,
            "utf8"
        ) as Promise<string>;
    };

    const API = createAPI(() => monacoEditor);
    onMount(() => {
        const save = () => {
            const code = API.saveValue();
            if (code) props.onSave(props.path, code);
        };
        monacoEditor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            save
        );
        // input 事件，不准备使用
        // monacoEditor.onDidChangeModelContent(() => {
        //     const code = monacoEditor!.getValue();
        // });
        monacoEditor.addAction({
            id: "save",
            label: "保存",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            contextMenuGroupId: "navigation",
            run: save, // 点击后执行的操作
        });
    });
    // 当 path 转变时才需要进行操作
    createEffect(async () => {
        if (monacoEditor) {
            const code = await getSourceCode();
            monacoEditor.setValue(code);
            console.log("createEffect setValue ");
        }
    });

    return (
        <EditorContext.Provider
            value={API}
            children={[
                <nav
                    class="single-editor"
                    ref={(el) => {
                        getMonaco().then((monaco) => {
                            monacoEditor = monaco.editor.create(el, {
                                value: "",
                                language: "javascript",
                            });
                        });
                    }}
                ></nav>,
            ]}
        ></EditorContext.Provider>
    );
};
