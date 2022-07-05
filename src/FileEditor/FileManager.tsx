import { applyTheme } from "./initTheme";
import mitt from "mitt";
import { FileModel } from "./FileModel";

// const changeLanguage = (language: string) => {
//     const monacoEditor = getMonacoEditor();
//     if (!monacoEditor) return;
//     monaco.editor.setModelLanguage(monacoEditor.getModel()!, language);
//     console.log("语言更换为 " + language);
// };

/* 管理 Monaco Editor 的一个类 */
export class FileManager {
    fileStore = new Map<string, FileModel>();
    monacoEditor!: ReturnType<typeof monaco["editor"]["create"]>;
    /* 向外发送事件的hub */
    hub = mitt<{
        prepare: string;
        open: string;
        close: string;
        save: FileModel;
    }>();
    mount(container: HTMLElement) {
        this.monacoEditor = monaco.editor.create(container, {
            model: null,
            theme: "github-gist",
            autoIndent: "advanced",
            automaticLayout: true,
            fontFamily: "Consolas",
            fontSize: 16,
            minimap: { enabled: false },
        });
        const save = () => {
            const model = this.monacoEditor.getModel();
            if (model) {
                const file = this.findFileCache(model);
                if (file) this.saveFile(file.path);
            }
        };
        this.monacoEditor.addAction({
            id: "save",
            label: "保存",
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            contextMenuGroupId: "navigation",
            run: save, // 点击后执行的操作
        });
        this.monacoEditor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            save
        );
        applyTheme("github-gist");
    }
    /* 根据 Model 查找 FileModel */
    findFileCache(model: FileModel["model"]) {
        for (let i of this.fileStore.values()) {
            if (i.model === model) return i;
        }
        return false;
    }

    /* 提前准备文件，但是不进行展示 */
    prepareFile(path: string, code = "", language = "javascript") {
        if (!this.fileStore.has(path)) {
            const model = new FileModel();
            model.init(path, code, language);
            this.fileStore.set(path, model);
            this.hub.emit("prepare", path);
        }
    }
    /* 打开文件，如果没有则创建，如果有则直接打开 */
    openFile(path: string, code: string = "", language = "javascript") {
        if (this.fileStore.has(path)) {
            this.openExistFile(path);
        } else {
            const model = new FileModel();
            model.init(path, code, language);
            this.fileStore.set(path, model);
            this.monacoEditor.setModel(model.model);
            this.hub.emit("open", path);
        }
    }
    /* 打开存在的一个文件 */
    openExistFile(path: string) {
        const file = this.fileStore.get(path);
        if (file) {
            this.monacoEditor.setModel(file.model);
            this.hub.emit("open", path);
        }
    }
    /* 关闭一个文件 */
    closeFile(path: string) {
        const old = this.fileStore.get(path);
        if (old) {
            old.destroy();
            this.fileStore.delete(path);
            this.hub.emit("close", path);
        }
        const model = this.monacoEditor.getModel();
        if (model === null) {
            this.openFirst();
        }
    }
    /* 打开垫底的文件 */
    openFirst() {
        if (this.fileStore.size) {
            const [[path]] = this.fileStore;
            this.openExistFile(path);
        }
    }
    saveFile(path: string) {
        const file = this.fileStore.get(path);
        if (file) {
            this.hub.emit("save", file);
        }
    }
}
