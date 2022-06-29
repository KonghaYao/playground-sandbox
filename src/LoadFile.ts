/* @ts-ignore */
import { IframeEnv } from "../rollup-web/dist/Iframe.js";
/* @ts-ignore */
import { Evaluator } from "../rollup-web/dist/index.js";

type LoadFile = (string: string) => Promise<string>;
async function createCompilerPort(loadFile: LoadFile): Promise<MessagePort> {
    const code = await loadFile("/rollup.config.web.js");
    const file = new File([code], "index.js", {
        type: "text/javascript",
    });
    const url = URL.createObjectURL(file);
    const Eval = new Evaluator();
    await Eval.useWorker(url);
    return Eval.createCompilerPort();
}
type Config = { target?: string };
export const IframeFactory =
    (loadFile: LoadFile) =>
    async (container: HTMLElement, port?: MessagePort) => {
        // 构建 Compiler 线程
        if (!port) port = await createCompilerPort(loadFile);
        // 构建 json 配置文件
        const config: Config = await loadFile("/rollup.setting.json").then(
            (res) => {
                return JSON.parse(res);
            },
            () => ({})
        );
        // 构建 Iframe
        const iframe = new IframeEnv();
        const initHTML = config.target || "/index.html";
        await loadFile(initHTML).then(() => {
            const root = new URL("/index.html", location.href).toString();
            console.log(root);
            return iframe.mount({
                port,
                container,
                getFile(src: string) {
                    return loadFile(src);
                },
                src: initHTML,
                root,
            });
        });
    };
