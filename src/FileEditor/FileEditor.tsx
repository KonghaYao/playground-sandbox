import { Component, lazy, onMount, Suspense } from "solid-js";
import { getMonaco } from "./getMonaco";
import style from "./FileEditor.module.less";
import { initTheme } from "./initTheme";
type Props = {
    fileList: string[];
    getFile(path: string): Promise<{ code: string; language?: string }>;
    closeSelf(): void;
};

import { FileTabs } from "../FileTab/FileTabs";
import { FileManager } from "./FileManager";
import { FileModel } from "./FileModel";

/* 文件浏览器 */
const FileEditorInstance: (
    controller: FileManager,
    onWatch: (e: Event) => void
) => Component<Props> = (controller, onWatch) => (props) => {
    onMount(() => {
        // fileList 是初始化参数，并非响应式
        const promises = props.fileList.map(async (path) => {
            const { code } = await props.getFile(path);
            return controller.prepareFile(path, code);
        });
        Promise.all(promises).then(() => {
            controller.openExistFile(props.fileList[0]);
        });
    });
    return (
        <>
            <nav class={style.file_editor}>
                <FileTabs
                    fileList={props.fileList}
                    hub={controller.hub}
                    onselect={(i) => {
                        controller.openFile(i);
                    }}
                    onclose={(i) => {
                        controller.closeFile(i);
                    }}
                    closeSelf={props.closeSelf}
                ></FileTabs>
                <div
                    data-class="editor"
                    onclick={onWatch}
                    ref={(el: HTMLDivElement) => controller.mount(el)}
                ></div>
            </nav>
        </>
    );
};

/**
 * 统一的文件编辑器的创建函数
 * */
export const createFileEditor = (
    init?: (fileManager: FileManager) => void | Promise<void>
) => {
    const fileStore = new Map<string, FileModel>();
    let controllers: FileManager[] = [];
    const info = {
        watchingIndex: 0,
        getWatching() {
            return controllers[this.watchingIndex];
        },
    };
    /* Solid 组件 */
    const FileEditor: Component<Props> = (props) => {
        /* 初始化 monaco */
        const Instance = lazy(async () => {
            const id = controllers.length;
            /* 统一的文件管理 */
            const manager = new FileManager(fileStore, id);
            info.watchingIndex = id;
            controllers.push(manager);
            init && (await init(manager));
            await getMonaco();
            await initTheme();
            return {
                default: FileEditorInstance(manager, () => {
                    info.watchingIndex = id;
                }),
            };
        });
        return (
            <Suspense
                fallback={<div>Loading</div>}
                children={[<Instance {...props}></Instance>]}
            ></Suspense>
        );
    };
    /**
     * @param FileEditor 可以复用的文件编辑器
     * @param controllers 文件系统控制器
     */
    return [FileEditor, controllers, info] as const;
};
