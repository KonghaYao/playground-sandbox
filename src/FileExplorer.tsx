import { FS } from "./Helper";
import { Component, createSignal, For } from "solid-js";
import { getIconForFile } from "vscode-icons-js";

export const FileExplorer: Component<{ fs: FS }> = (props) => {
    const [path, setPath] = createSignal("/");
    const [fileList, setFileList] = createSignal([] as string[]);
    const getFileList = async (path: string) => {
        return props.fs.promises.readdir(path, {
            withFileTypes: true,
        }) as Promise<string[]>;
    };
    const jumpTo = async (newPath: string) => {
        const stats = await props.fs.promises.stat(newPath);
        if (stats.isFile()) {
            console.log("this is a file");
        } else {
            getFileList(newPath).then((res) => {
                setFileList(res);
                setPath(newPath);
            });
        }
    };
    const enter = (item: string) => {
        const newPath = `${path()}${item}/`;
        return jumpTo(newPath);
    };
    const back = () => {
        const newPath = path().replace(/[^\/]+\/$/, "");
        if (newPath !== path()) {
            return jumpTo(newPath);
        }
        return;
    };

    jumpTo("/");
    return (
        <nav class="file-explorer">
            <header>
                <div class="material-icons" onclick={back}>
                    keyboard_arrow_left
                </div>
                <input type="text" value={path()} />
            </header>
            <div class="file-list">
                <For each={fileList()}>
                    {(item) => {
                        const src =
                            "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/" +
                            getIconForFile(item);
                        return (
                            <span
                                onclick={() => enter(item)}
                                class="single-tab"
                            >
                                <img src={src} alt="" />
                                {item}
                            </span>
                        );
                    }}
                </For>
            </div>
        </nav>
    );
};
