import { ConsoleView } from "@forsee/console";
import {
    Component,
    createMemo,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import { CircleSlash, Refresh, ScreenFull } from "../Helpers/Icon";
import { fullscreen } from "../utils/fullscreen";
import { CompilerManager, IframeFactory, LoadFile } from "./IframeFactory";
import style from "../style/preview.module.less";
/* 用于承载 Iframe */
export const Previewer: Component<{
    port?: MessagePort;
    loadFile: LoadFile;
}> = (props) => {
    let container: HTMLElement;
    let consoleNav: HTMLElement;
    let manager: CompilerManager;
    let view!: ConsoleView;

    onMount(async () => {
        view = new ConsoleView(consoleNav);
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
            <sl-split-panel vertical style="flex:1;z-index:1">
                <aside slot="handle" class={style.handle}></aside>
                <main
                    class="iframe-container"
                    slot="start"
                    ref={container!}
                ></main>
                <ConsoleViewer
                    slot="end"
                    getView={() => view}
                    ref={(el) => {
                        consoleNav = el;
                    }}
                ></ConsoleViewer>
            </sl-split-panel>
        </>
    );
};
export const ConsoleViewer: Component<{
    slot?: string;
    ref: (el: HTMLElement) => void;
    getView: () => ConsoleView;
}> = (props) => {
    const [log, setLog] = createSignal(0);
    const [error, setError] = createSignal(0);
    const [warn, setWarn] = createSignal(0);
    const col = {
        log() {
            setLog((i) => i + 1);
        },
        error() {
            setError((i) => i + 1);
        },
        warn() {
            setWarn((i) => i + 1);
        },
    };
    const all = createMemo(() => {
        return log() + error() + warn();
    });
    onMount(() => {
        props.getView().on("insert", (log) => {
            /* @ts-ignore */
            if (log.type in col) col[log.type]();
        });
    });
    return (
        <nav slot={props.slot} class={style.console}>
            <header>
                <div
                    onclick={() => {
                        props.getView().clear();
                    }}
                >
                    <CircleSlash></CircleSlash>
                </div>
                <nav data-all>
                    All <div>{all()}</div>
                </nav>
                <nav data-error>
                    Error <div>{error()}</div>
                </nav>
                <nav data-warn>
                    Warning <div>{warn()}</div>
                </nav>
                <nav data-log>
                    Log <div>{log()}</div>
                </nav>
            </header>
            <main ref={props.ref}></main>
        </nav>
    );
};
