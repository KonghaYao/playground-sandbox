import { Component, lazy, onMount, Suspense } from "solid-js";
import { getMonaco } from "./getMonaco";
import style from "./FileEditor.module.less";
import { initTheme } from "./initTheme";
type Props = {
    fileList: string[];
    getFile(path: string): Promise<{ code: string; language?: string }>;
};

import { FileTabs } from "../FileTab/FileTabs";
import { FileManager } from "./FileManager";

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
            <>
                <nav class={style.file_editor}>
                    <FileTabs
                        fileList={props.fileList}
                        hub={controller.hub}
                        onselect={(i) => controller.openFile(i)}
                        onclose={(i) => {
                            controller.closeFile(i);
                        }}
                    ></FileTabs>
                    <div
                        data-class="editor"
                        ref={(el: HTMLDivElement) => controller.mount(el)}
                    ></div>
                </nav>
            </>
        );
    };

/**
 * 统一的文件编辑器的创建函数
 * */
export const createFileEditor = () => {
    /* 统一的文件管理 */
    const controller = new FileManager();
    /* 初始化 monaco */
    const Instance = lazy(async () => {
        await getMonaco();
        await initTheme();
        return { default: FileEditorInstance(controller) };
    });
    /* Solid 组件 */
    const FileEditor: Component<Props> = (props) => {
        return (
            <Suspense
                fallback={<div>Loading</div>}
                children={[<Instance {...props}></Instance>]}
            ></Suspense>
        );
    };
    /**
     * @param FileEditor 可以复用的文件编辑器
     * @param controller 文件系统控制器
     */
    return [FileEditor, controller] as const;
};
