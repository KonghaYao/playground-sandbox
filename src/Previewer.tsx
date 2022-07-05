import { Component, onCleanup, onMount } from "solid-js";
import { Refresh } from "./Icon";
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
    onCleanup(() => {
        manager.destroy();
        container = undefined as any;
        manager = undefined as any;
    });
    return (
        <>
            <header class="bg-green-400">
                <div
                    onclick={() => {
                        manager.reload();
                    }}
                >
                    {Refresh()}
                </div>
                <input type="text"></input>
            </header>
            <main class="iframe-container" ref={container!}></main>
        </>
    );
};
