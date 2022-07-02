import { Component, lazy, onMount, Suspense } from "solid-js";
import { getMonaco } from "./Monaco/getMonaco";
import "./Monaco/index.css";
import { applyTheme, initTheme } from "./Monaco/initTheme";
type Props = {
    fileList: string[];
    getFile(path: string): Promise<{ code: string; language?: string }>;
};

class FileModel {
    path!: string;
    model!: ReturnType<typeof monaco["editor"]["createModel"]>;
    init(path: string, code: string, language = "javascript") {
        this.path = path;
        this.model = monaco.editor.createModel(code, language);
    }
    destroy() {
        this.model.dispose();
    }
}
import mitt from "mitt";
import { FileTabs } from "./FileTab/FileTabs";
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
            id: "save", // 菜单项 id
            label: "保存", // 菜单项名称
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], // 绑定快捷键，是 monacoEditor 自定义的对应关系
            contextMenuGroupId: "navigation", // 所属菜单的分组
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
/* 文件浏览器 */
const FileEditorInstance: (controller: FileManager) => Component<Props> =
    (controller) => (props) => {
        onMount(() => {
            // fileList 是初始化参数，并非响应式
            const promises = props.fileList.map(async (path) => {
                const { code, language } = await props.getFile(path);
                return controller.prepareFile(path, code, language);
            });
            Promise.all(promises).then(() => {
                controller.openExistFile(props.fileList[0]);
            });
        });
        return (
            <nav class="file-editor">
                <FileTabs
                    fileList={props.fileList}
                    hub={controller.hub}
                    onselect={(i) => controller.openFile(i)}
                    onclose={(i) => {
                        controller.closeFile(i);
                    }}
                ></FileTabs>
                <div
                    class="editor"
                    ref={(el: HTMLDivElement) => controller.mount(el)}
                ></div>
            </nav>
        );
    };

export const createFileEditor = () => {
    const controller = new FileManager();
    const FileEditor: Component<Props> = (props) => {
        const Instance = lazy(async () => {
            /* 初始化 monaco */
            await getMonaco();
            await initTheme();
            return { default: FileEditorInstance(controller) };
        });
        return (
            <Suspense
                fallback={<div>Loading</div>}
                children={[<Instance {...props}></Instance>]}
            ></Suspense>
        );
    };
    return [FileEditor, controller] as const;
};
