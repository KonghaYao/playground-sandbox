import { Evaluator, IframeEnv } from "./Helper";
export type LoadFile = (string: string) => Promise<string>;
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

/* 全局 Compiler 管理 */
const CompilerManager = {
    port: undefined as MessagePort | undefined,
    async createPort(loadFile: LoadFile) {
        this.port = await createCompilerPort(loadFile);
    },
};
export const IframeFactory = async (
    container: HTMLElement,
    loadFile: LoadFile
) => {
    // 构建 Compiler 线程
    if (!CompilerManager.port) await CompilerManager.createPort(loadFile);

    // 构建 json 配置文件
    const config: Config = await loadFile("/rollup.setting.json").then(
        (res) => JSON.parse(res),
        () => ({})
    );
    // 构建 Iframe
    const iframe = new IframeEnv();
    const initHTMLPath = config.target || "/index.html";
    await loadFile(initHTMLPath).then(() => {
        return iframe.mount({
            port: CompilerManager.port,
            container,
            getFile(src: string) {
                return loadFile(src);
            },
            src: initHTMLPath,
            // 构建虚拟 URL
            root: new URL("/index.html", location.href).toString(),
        });
    });
};
