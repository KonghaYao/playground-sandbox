import { Monaco } from "./cdn";

export function createAPI(
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
