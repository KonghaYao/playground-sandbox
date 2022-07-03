import { Evaluator, IframeEnv } from "./Helper";
export type LoadFile = (string: string) => Promise<string>;

type Config = { target?: string; compiler?: { url?: string } };

class CompilerManager {
    /** Compiler 线程的代码，通过这个代码判断是否为同一个 */
    code = "";

    config!: Config;
    iframe?: IframeEnv = undefined;
    port?: MessagePort = undefined;
    constructor(public container: HTMLElement, public loadFile: LoadFile) {}
    /* 构建 json 配置文件 */
    async loadConfig(setting?: Partial<Config>) {
        this.config = await this.loadFile!("/rollup.setting.json").then(
            (res) => ({ ...setting, ...JSON.parse(res) }),
            () => ({ ...setting })
        );
    }
    async createPort() {
        const compilerPath =
            this.config?.compiler?.url || "/rollup.config.web.js";
        const code = await this.loadFile(compilerPath);
        const isSame = this.checkSameCode(code);
        if (isSame) {
            return this.port!;
        } else {
            this.code = code;
            this.port = await this.createCompilerPort(code);
            return this.port;
        }
    }
    checkSameCode(code: string) {
        return this.code !== "" && code === this.code;
    }
    async createCompilerPort(code: string): Promise<MessagePort> {
        const file = new File([code], "index.js", {
            type: "text/javascript",
        });
        const url = URL.createObjectURL(file);
        const Eval = new Evaluator();
        await Eval.useWorker(url);
        return Eval.createCompilerPort();
    }
    async build() {
        // 构建 Iframe
        const iframe = new IframeEnv();
        const initHTMLPath = this.config.target || "/index.html";
        this.iframe = IframeEnv;
        await this.loadFile(initHTMLPath).then(() => {
            return iframe.mount({
                port: this.port,
                container: this.container,
                getFile(src: string) {
                    return this.loadFile(src);
                },
                src: initHTMLPath,
                // 构建虚拟 URL
                root: new URL("/index.html", location.href).toString(),
            });
        });
    }
    reload() {
        this.iframe.destroy();
        this.build();
    }
    destroy() {}
}

export const IframeFactory = async (
    container: HTMLElement,
    loadFile: LoadFile,
    setting?: Config
) => {
    const manager = new CompilerManager(container, loadFile);
    await manager.loadConfig(setting);
    await manager.createPort(); // 构建 Compiler 线程, 已经经过去重
    await manager.build();

    return [manager] as const;
};
