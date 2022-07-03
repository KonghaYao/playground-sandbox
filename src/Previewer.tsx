import { Component, onMount } from "solid-js";
import { CompilerManager, IframeFactory, LoadFile } from "./IframeFactory";
/* 用于承载 Iframe */
export const Previewer: Component<{
    port?: MessagePort;
    loadFile: LoadFile;
}> = (props) => {
    let container: HTMLElement;
    let manager: CompilerManager;
    onMount(async () => {
        const [Manager] = await IframeFactory(container, props.loadFile);
        manager = Manager;
    });
    return (
        <>
            <header class="bg-green-400">
                <div
                    onclick={() => {
                        manager.reload();
                    }}
                >
                    replay
                </div>
                <input type="text"></input>
            </header>
            <main class="iframe-container" ref={container!}></main>
        </>
    );
};
