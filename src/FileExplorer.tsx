import { Accessor, Component, createSignal, For, Setter } from "solid-js";
import { getIconForFile, getIconForFolder } from "vscode-icons-js";
import type FS from "@isomorphic-git/lightning-fs";
import { Left } from "./Helpers/Icon";
type Props = {
    fs: FS;
    openFile: (path: string) => void;
    initPath?: string;
    visible: Accessor<boolean>;
};

/* 文件浏览器组件 */
export const FileExplorer: Component<Props> = (props) => {
    const initPath = props.initPath || "/";
    const [path, setPath] = createSignal(initPath);
    const [fileList, setFileList] = createSignal(
        [] as (FS.Stats & { name: string })[]
    );

    const { jumpTo, back, enter } = createControl(
        props,
        setFileList,
        setPath,
        path
    );
    jumpTo(initPath);
    return (
        <nav
            class='select-none h-full text-sm flex-grow flex flex-col'
            style={{ display: props.visible() ? "block" : "none" }}
        >
            <header class="flex items-center">
                <div onclick={back} data-icon>
                    {Left()}
                </div>
                <input type="text" class="w-full m-2" value={path()} />
            </header>
            <section class='flex flex-col overflow-auto overflow-x-hidden h-full'>
                <For each={fileList()}>
                    {(item) => {
                        const name = item.name;
                        return (
                            <FileTab
                                name={name}
                                isFile={item.isFile()}
                                onclick={() => enter(name, item.isFile())}
                            ></FileTab>
                        );
                    }}
                </For>
            </section>
        </nav>
    );
};

/* 单个的文件的选项卡 */
export const FileTab: Component<{
    name: string;
    isFile: boolean;
    onclick: Function;
}> = (props) => {
    const src =
        "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/" +
        (props.isFile
            ? getIconForFile(props.name)
            : getIconForFolder(props.name));
    return (
        <span class="single-tab flex items-center w-full cursor-pointer hover:bg-gray-700" onclick={props.onclick as any}>
            <img class="w-4 h-4 mx-2" src={src} alt="" />
            {props.name}
        </span>
    );
};

/* 创建文件浏览器的控制器 */
function createControl(
    props: Props,
    setFileList: Setter<(FS.Stats & { name: string })[]>,
    setPath: Setter<string>,
    path: Accessor<string>
) {
    /* 获取文件列表，其中的元素为 Stats 并扩充 name 属性 */
    const getFileList = async (path: string) => {
        const list: string[] = await props.fs.promises.readdir(path);
        return Promise.all(
            list.map((name) =>
                props.fs.promises.stat(path + "/" + name).then((res) => {
                    return Object.assign(res, { name }) as FS.Stats & {
                        name: string;
                    };
                })
            )
        );
    };
    // 必定是文件夹
    const jumpTo = async (newPath: string) => {
        getFileList(newPath).then((res) => {
            setFileList(res);
            setPath(newPath);
        });
    };
    const enter = (subPath: string, isFile: boolean) => {
        if (isFile) {
            const newPath = `${path()}${subPath}`;
            props.openFile(newPath);
            return;
        }
        const newPath = `${path()}${subPath}/`;
        return jumpTo(newPath);
    };
    const back = () => {
        const newPath = path().replace(/[^\/]+\/$/, "");
        if (newPath !== path()) {
            return jumpTo(newPath);
        }
        return;
    };
    return { jumpTo, back, enter };
}
