import { Component } from "solid-js";
import { IframeFactory, LoadFile } from "./IframeFactory";
/* 用于承载 Iframe */
export const Previewer: Component<{
    port?: MessagePort;
    loadFile: LoadFile;
}> = (props) => {
    return (
        <>
            <header class="bg-green-400">
                <div>replay</div>
                <input type="text"></input>
            </header>
            <main
                class="iframe-container"
                ref={(el) => {
                    /* 用于创建 Iframe 对象 */
                    IframeFactory(el, props.loadFile);
                }}
            ></main>
        </>
    );
};
