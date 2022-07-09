import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import fs, { writeFileSync } from "fs-extra";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
// import { terser } from "rollup-plugin-terser";
import analyze from "rollup-plugin-analyzer";
import path from "path";
fs.emptyDir("./dist/");
// rollup.config.js
export default {
    external: [
        "vscode-icons-js",
        "solid-js",
        "solid-js/web",
        "@monaco-editor/loader",
        "monaco-editor",
        "monaco-editor-solid",
    ],
    input: "./src/index.ts",
    output: {
        dir: "./dist/",
        format: "es",
        paths: {},
        globals: {
            "vscode-oniguruma": "onig",
        },
    },
    plugins: [
        {
            resolveId(thisFile) {
                if (thisFile.startsWith("https://")) {
                    return false;
                }
            },
            transform(code, id) {
                if (id.includes("monaco-editor-wrapper")) {
                    //! 将 * as monaco 导入转化为 default 导入，这样可以获取为 全局的 monaco
                    return code.replace(/(\* as monaco)/, "monaco");
                }
            },
            load(id) {
                if (id.endsWith("onig.wasm")) {
                    // wasm 转写
                    return `const a ='https://cdn.jsdelivr.net/npm/vscode-oniguruma/release/onig.wasm';
                    export default a`;
                }
                if (id.includes("monaco-editor\\esm")) {
                    //!
                    if (id.includes("shiftCommand")) {
                        return "export * from 'https://cdn.jsdelivr.net/npm/@codingame/monaco-editor/esm/vs/editor/common/commands/shiftCommand.js' ";
                    } else {
                        return "export default globalThis.monaco";
                    }
                }
            },
        },
        {
            resolveDynamicImport(thisFile, importer) {
                //! 编程语言文件的 CDN
                if (
                    importer.endsWith(
                        path.join(
                            "@codingame",
                            "monaco-editor-wrapper",
                            "dist",
                            "main.js"
                        )
                    )
                ) {
                    return {
                        external: true,
                        id: new URL(
                            thisFile,
                            "https://cdn.jsdelivr.net/npm/@codingame/monaco-editor-wrapper/dist/main.js"
                        ).toString(),
                    };
                }
            },
        },
        alias({
            entries: [
                {
                    find: "rollup-web",
                    replacement: false
                        ? "https://cdn.jsdelivr.net/npm/rollup-web"
                        : "./rollup-web",
                },
            ],
        }),
        nodeResolve({
            browser: true,
            extensions: [".ts", ".tsx", ".js"],
        }),
        commonjs(),
        // 解决 svg 模块问题
        {
            name: "svg",
            async load(id) {
                if (id.endsWith(".svg")) {
                    const code = await fs.promises.readFile(id, "utf8");
                    return {
                        code: `export default ()=>(new DOMParser().parseFromString(${JSON.stringify(
                            code
                        )}, 'image/svg+xml')).firstChild`,
                    };
                }
            },
        },
        postcss({
            inject: true,
            minimize: {},
            modules: {},
            sourceMap: false,
            extensions: [".css", ".less"],
        }),
        babel({
            babelHelpers: "bundled",
            extensions: [".ts", ".tsx", ".js", ".svg"],
        }),
        // terser(),
        analyze({
            summaryOnly: true,
            writeTo: (str) => writeFileSync("dist/index.analyze.txt", str),
        }),
    ],
};
