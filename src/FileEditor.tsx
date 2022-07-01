import { Component, createSignal, lazy, onMount, Suspense } from "solid-js";
import { For } from "solid-js/web";
import { getIconForFile, getIconForFolder } from "vscode-icons-js";
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
class FileManager {
    fileStore = new Map<string, FileModel>();
    monacoEditor!: ReturnType<typeof monaco["editor"]["create"]>;

    mount(container: HTMLElement) {
        this.monacoEditor = monaco.editor.create(container, {
            model: null,
            theme: "github-gist",
            autoIndent: "advanced",
            automaticLayout: true,
            fontFamily: "Consolas",
            fontSize: 16,
        });
        applyTheme("github-gist");
    }
    prepareFile(path: string, code = "", language = "javascript") {
        if (!this.fileStore.has(path)) {
            const model = new FileModel();
            model.init(path, code, language);
            this.fileStore.set(path, model);
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
        }
    }
    /* 打开存在的一个文件 */
    openExistFile(path: string) {
        const file = this.fileStore.get(path);
        file ? this.monacoEditor.setModel(file.model) : null;
    }
    closeFile(path: string) {
        const old = this.fileStore.get(path);
        if (old) {
            old.destroy();
            this.fileStore.delete(path);
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
}

/* 文件浏览器 */
const FileEditorInstance: (controller: FileManager) => Component<Props> =
    (controller) => (props) => {
        const [fileList] = createSignal(props.fileList);
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
                <div class="file-tabs">
                    <For each={fileList()}>
                        {(i) => {
                            const tabName = i.replace(/^.*?([^\/]+)$/, "$1");
                            return (
                                <div class="file-tab">
                                    <span
                                        onclick={() => controller.openFile(i)}
                                    >
                                        {tabName}
                                    </span>
                                    <span
                                        class="material-icons"
                                        onclick={() => {
                                            controller.closeFile(i);
                                        }}
                                    >
                                        close
                                    </span>
                                </div>
                            );
                        }}
                    </For>
                </div>
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
