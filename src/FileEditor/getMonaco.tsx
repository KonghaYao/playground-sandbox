import { CDN, Monaco } from "./cdn";
import MonacoLoader from "@monaco-editor/loader";
import { loadScript } from "../Helpers/Helper";
/** 获取 Monaco 对象，只会进行一次网络请求  */
export const loadMonaco = async () => {
    /* @ts-ignore */
    const monaco: Monaco = globalThis.monaco;
    if (monaco) return monaco;
    MonacoLoader.config({
        paths: {
            vs: CDN.__monacoCDN__,
        },
        "vs/nls": {
            availableLanguages: {
                "*": "zh-cn",
            },
        },
    });
    return MonacoLoader.init();
};
let wrapper: typeof import("@codingame/monaco-editor-wrapper");
let loading: Promise<typeof wrapper["monaco"]>;
export const getMonaco = async () => {
    if (loading) return loading;
    loading = (async () => {
        await loadMonaco();
        await loadScript(
            "https://cdn.jsdelivr.net/npm/vscode-oniguruma/release/main.js"
        );
        wrapper = await import("@codingame/monaco-editor-wrapper");
        await import(
            "@codingame/monaco-editor-wrapper/dist/features/htmlContribution"
        );
        await import(
            "@codingame/monaco-editor-wrapper/dist/features/typescriptContribution"
        );
        await import(
            "@codingame/monaco-editor-wrapper/dist/features/cssContribution"
        );
        await import(
            "@codingame/monaco-editor-wrapper/dist/features/extensionConfigurations"
        ); /* @ts-ignore*/
        globalThis.monaco = wrapper.monaco;
        return wrapper.monaco;
    })();

    return loading;
};
export { wrapper };
