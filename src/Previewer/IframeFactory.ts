import { Console } from "@forsee/console/dist/Console";
import type { ConsoleView } from "@forsee/console";
import mitt from "mitt";
import { Evaluator, IframeEnv } from "../Helpers/Helper";

export type LoadFile = (string: string) => Promise<string>;

type Config = { target?: string; compiler?: { url?: string } };

export class CompilerManager {
    /** Compiler 线程的代码，通过这个代码判断是否为同一个 */
    code = "";

    config!: Config;
    iframe?: IframeEnv = undefined;
    constructor(public container: HTMLElement, public loadFile: LoadFile) {}
    /* 构建 json 配置文件 */
    async loadConfig(setting?: Partial<Config>) {
        this.config = await this.loadFile!("/rollup.setting.json").then(
            (res) => ({ ...setting, ...JSON.parse(res) }),
            () => ({ ...setting })
        );
    }
    private evaluator = new Evaluator();
    async createPort() {
        const compilerPath =
            this.config?.compiler?.url || "/rollup.config.web.js";
        const code = await this.loadFile(compilerPath);
        const isSame = this.checkSameCode(code);
        if (isSame) {
            return this.evaluator.createCompilerPort();
        } else {
            this.code = code;
            return this.recreateCompilerPort(code);
        }
    }
    checkSameCode(code: string) {
        return this.code !== "" && code === this.code;
    }
    /* 重置 Compiler */
    async recreateCompilerPort(code: string): Promise<MessagePort> {
        const file = new File([code], "index.js", {
            type: "text/javascript",
        });
        const url = URL.createObjectURL(file);
        this.evaluator.Compiler?.destroy();
        await this.evaluator.useWorker(url);
        return this.evaluator.createCompilerPort();
    }
    // TODO 类型注解
    ConsoleHub = mitt<{
        update: Parameters<ConsoleView["insertSync"]>;
        clear: null;
    }>();
    createConsole(iframe: HTMLIFrameElement) {
        const _c = new Console();

        (iframe.contentWindow! as any).console = _c;

        _c.init(
            (...args) => this.ConsoleHub.emit("update", args),
            () => this.ConsoleHub.emit("clear", null),
            "classic"
        );
    }
    async build() {
        const port = await this.createPort(); // 构建 Compiler 线程, 已经经过去重
        // 构建 Iframe
        const iframe = new IframeEnv();
        this.iframe = iframe;
        const initHTMLPath = this.config.target || "/index.html";
        await this.loadFile(initHTMLPath)
            .then(() => {
                return iframe.mount({
                    port,
                    container: this.container,
                    getFile: (src: string) => {
                        return this.loadFile(src);
                    },
                    src: initHTMLPath,

                    // 构建虚拟 URL
                    root: new URL("/index.html", location.href).toString(),
                });
            })
            .then(() => {
                this.createConsole(iframe.iframeBox.frame);
            });
    }
    reload() {
        this.iframe.destroy();
        this.ConsoleHub.emit("clear", null);
        this.build();
    }
    destroy() {
        /* @ts-ignore */
        this.ConsoleHub.off("*");
        this.iframe.destroy();
        this.evaluator.compiler?.destroy();
    }
}

export const IframeFactory = async (
    container: HTMLElement,
    loadFile: LoadFile,
    {
        setting,
        beforeBuild,
    }: { setting?: Config; beforeBuild?: (manager: CompilerManager) => void }
) => {
    const manager = new CompilerManager(container, loadFile);
    beforeBuild && beforeBuild(manager);
    await manager.loadConfig(setting);
    await manager.build();
    return [manager] as const;
};
