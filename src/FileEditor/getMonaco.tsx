import { CDN, Monaco } from "./cdn";
import MonacoLoader from "@monaco-editor/loader";
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

export const getMonaco = async () => {
    await loadMonaco();
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
    );
    /* @ts-ignore*/
    globalThis.monaco = wrapper.monaco;
    return monaco;
};
export { wrapper };
