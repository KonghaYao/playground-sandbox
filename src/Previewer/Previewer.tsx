import { Split } from "solid-split-component";
import {
    Component,
} from "solid-js";
import { Refresh, ScreenFull } from "../Helpers/Icon";
import { fullscreen } from "../utils/fullscreen";
import style from "../style/preview.module.less";
import { NodeBox } from "./NodeBox";
import { WebTerminal } from './WebTerminal'
/* 用于承载 Iframe */
export const Previewer: Component<{
    port?: MessagePort;
}> = (props) => {
    let container: HTMLElement;
    return (
        <>
            <header class="bg-green-400">
                <div
                    data-icon
                    class="codicon codicon-refresh"
                    onclick={() => {

                    }}
                >
                </div>
                <div
                    data-icon
                    class="codicon codicon-screen-full"
                    onclick={() => {
                        fullscreen(container);
                    }}
                >
                </div>
            </header>
            <Split direction="vertical" class={style.panel}>
                <NodeBox></NodeBox>
                <WebTerminal></WebTerminal>
            </Split>
        </>
    );
};