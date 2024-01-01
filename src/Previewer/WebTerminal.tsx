import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import { onCleanup, onMount } from "solid-js";
import { atom } from "@cn-ui/reactive";
import { FitAddon } from "@xterm/addon-fit";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { SearchAddon } from "@xterm/addon-search";
import { CanvasAddon } from "@xterm/addon-canvas";
import { useResizeObserver } from "solidjs-use";
import { SandboxContext } from "../context/sandbox";
import { openpty } from "xterm-pty";

export const WebTerminal = () => {
    const dom = atom<HTMLDivElement | null>(null);
    let terminal: ReturnType<typeof createTerminal>;
    const context = SandboxContext.use()
    onMount(() => {
        terminal = createTerminal();
        terminal.term.open(dom()!);
        context.terminal(terminal)
        terminal.prompt()
    });
    onCleanup(() => {
        terminal?.term.dispose();
    });
    useResizeObserver(dom, () => {
        if (terminal) terminal.fit.fit();
    });
    return <div ref={dom}></div>;
}

/**
 * 创建一个终端实例
 *
 */
export const createTerminal = () => {
    const term = new Terminal({
        fontFamily: 'Menlo, Monaco, "Courier New", monospace', // 设置字体类型
        fontSize: 16, // 设置字体大小
        // theme, // 设置主题
        smoothScrollDuration: 100, // 设置平滑滚动的持续时间
        convertEol: true, // 转换行尾
        cursorBlink: true, // 设置光标闪烁
        macOptionIsMeta: true, // 设置Mac上的Option键作为Meta键
        allowProposedApi: true, // 允许使用建议的API
    });

    term.focus(); // 设置焦点

    const fit = new FitAddon(); // 创建适应插件实例
    term.loadAddon(fit); // 加载适应插件
    term.loadAddon(new WebLinksAddon()); // 加载Web链接插件
    term.loadAddon(new SearchAddon()); // 加载搜索插件
    term.loadAddon(new CanvasAddon()); // 加载画布插件
    const prompt = () => {
        return term.write("\r\n\x1b[33m$\x1b[0m ")
    }

    const { master, slave } = openpty();
    term.loadAddon(master)
    return {
        term, fit, pty: slave,
        prompt
    }; // 返回终端实例、适应插件、WebSocket实例
};
