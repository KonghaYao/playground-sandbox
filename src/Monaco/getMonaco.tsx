import { CDN, Monaco } from "./cdn";
import MonacoLoader from "@monaco-editor/loader";

/** 获取 Monaco 对象，只会进行一次网络请求  */
export const getMonaco = async () => {
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
