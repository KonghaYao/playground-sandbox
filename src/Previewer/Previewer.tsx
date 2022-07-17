import { ConsoleView } from "@forsee/console";
import { Component, onCleanup, onMount } from "solid-js";
import { Refresh, ScreenFull } from "../Helpers/Icon";
import { fullscreen } from "../utils/fullscreen";
import { CompilerManager, IframeFactory, LoadFile } from "./IframeFactory";
/* 用于承载 Iframe */
export const Previewer: Component<{
    port?: MessagePort;
    loadFile: LoadFile;
}> = (props) => {
    let container: HTMLElement;
    let consoleNav: HTMLDivElement;
    let manager: CompilerManager;
    onMount(async () => {
        const view = new ConsoleView(consoleNav);
        const [Manager] = await IframeFactory(container, props.loadFile, {
            beforeBuild(manager) {
                manager.ConsoleHub.on("update", (args) => {
                    view.insertSync(...args);
                });
                manager.ConsoleHub.on("clear", () => {
                    view.clear();
                });
            },
        });
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
                    data-icon
                    onclick={() => {
                        manager.reload();
                    }}
                >
                    {Refresh()}
                </div>
                <div
                    data-icon
                    onclick={() => {
                        fullscreen(container);
                    }}
                >
                    {ScreenFull()}
                </div>
            </header>
            <main class="iframe-container" ref={container!}></main>
            <nav ref={consoleNav!}></nav>
        </>
    );
};
