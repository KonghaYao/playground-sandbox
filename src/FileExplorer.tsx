import { Accessor, Component, createSignal, For, Setter } from "solid-js";
import { getIconForFile, getIconForFolder } from "vscode-icons-js";
import { Left } from "./Helpers/Icon";
import { IFileStats } from "@codesandbox/nodebox/build/modules/fs";
import { SandboxContext } from "./context/sandbox";
type Props = {
    openFile: (path: string) => void;
    initPath?: string;
    visible: Accessor<boolean>;
};

/* 文件浏览器组件 */
export const FileExplorer: Component<Props> = (props) => {
    const initPath = props.initPath || "/";
    const [path, setPath] = createSignal(initPath);
    const [fileList, setFileList] = createSignal(
        [] as (IFileStats & { name: string })[]
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
                        item.type
                        return (
                            <FileTab
                                name={name}
                                isFile={item.type === 'file'}
                                onclick={() => enter(name, item.type === 'file')}
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
    setFileList: Setter<(IFileStats & { name: string })[]>,
    setPath: Setter<string>,
    path: Accessor<string>
) {
    const context = SandboxContext.use()
    /* 获取文件列表，其中的元素为 Stats 并扩充 name 属性 */
    const getFileList = async (path: string) => {
        const list: string[] = await context.fs().readdir(path);
        return Promise.all(
            list.map((name) =>
                context.fs().stat(path + "/" + name).then((res) => {
                    return Object.assign(res, { name })
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
