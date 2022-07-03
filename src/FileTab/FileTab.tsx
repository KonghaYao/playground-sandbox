import { Component } from "solid-js";
import { getIconForFile } from "vscode-icons-js";
import { Close } from "../Icon";
export const FileTab: Component<{
    name: string;
    path: string;
    selected: boolean;
    onselect: Function;
    onclose: Function;
}> = (props) => {
    const src =
        "https://cdn.jsdelivr.net/gh/vscode-icons/vscode-icons/icons/" +
        getIconForFile(props.name);
    return (
        <div
            classList={{
                "file-tab": true,
                "select-tab": props.selected,
            }}
        >
            <img height="1em" width="1em" src={src} alt="" />

            <span onclick={() => props.onselect()}>{props.name}</span>
            <div onclick={() => props.onclose()}>{Close()}</div>
        </div>
    );
};
