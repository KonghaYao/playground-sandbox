import {
    Component,
    createContext,
    createEffect,
    createResource,
    createSignal,
    onMount,
} from "solid-js";
import { getIconForFile, getIconForFolder } from "vscode-icons-js";
import type FS from "@isomorphic-git/lightning-fs";
import { CDN, Monaco } from "./Monaco/cdn";

type Props = {
    fileList: string[];
    fs: FS;
};
/* 文件浏览器 */
export const FileEditor: Component<Props> = (props) => {
    return (
        <nav class="file-editor">
            <div></div>
            <div></div>
        </nav>
    );
};
