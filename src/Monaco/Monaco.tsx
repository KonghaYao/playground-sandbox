import {
    Component,
    createContext,
    createEffect,
    onMount,
    useContext,
} from "solid-js";
import type FS from "@isomorphic-git/lightning-fs";
import { Monaco } from "./cdn";
import { getMonaco } from "./getMonaco";
function createAPI(
    getMonacoEditor: () => ReturnType<Monaco["editor"]["create"]>
) {
    /** 保存代码 */
    const saveValue = () => {
        const monacoEditor = getMonacoEditor();
        if (!monacoEditor) return;
        const code = monacoEditor.getValue();
        console.log("MonacoEditor 保存成功");
        return code;
    };
    /** 必须要通过这种方式改变编辑来保证贯标处于正确位置 */
    const setValue = (code: string) => {
        const monacoEditor = getMonacoEditor();
        if (!monacoEditor) return;
        let range = monacoEditor.getModel()!.getFullModelRange();
        let op = {
            identifier: { major: 1, minor: 1 },
            range,
            text: code,
            forceMoveMarkers: true,
        };
        monacoEditor.executeEdits(code, [op]);
        monacoEditor.focus();
    };

    const changeLanguage = (language: string) => {
        const monacoEditor = getMonacoEditor();
        if (!monacoEditor) return;
        monaco.editor.setModelLanguage(monacoEditor.getModel()!, language);
        console.log("语言更换为 " + language);
    };
    return { saveValue, changeLanguage, setValue };
}

export function createEditor() {
    const EditorContext = createContext<ReturnType<typeof createAPI>>();
    /* 单个文件编辑器 */
    const SingleEditor: Component<{
        path: string;
        fs: FS;
        onSave: (path: string, code: string) => void;
    }> = (props) => {
        let monacoEditor: ReturnType<Monaco["editor"]["create"]>;
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
                id: "save", // 菜单项 id
                label: "保存", // 菜单项名称
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], // 绑定快捷键，是 monacoEditor 自定义的对应关系
                contextMenuGroupId: "navigation", // 所属菜单的分组
                run: save, // 点击后执行的操作
            });
        });
        createEffect(async () => {
            if (monacoEditor) {
                const code = await getSourceCode();
                monacoEditor.setValue(code);
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
    return [SingleEditor, useContext(EditorContext)];
}
