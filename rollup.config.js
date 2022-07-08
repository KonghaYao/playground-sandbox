import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import fs, { writeFileSync } from "fs";
import postcss from "rollup-plugin-postcss";
import commonjs from "@rollup/plugin-commonjs";
// import { terser } from "rollup-plugin-terser";
import analyze from "rollup-plugin-analyzer";
import path from "path";
// rollup.config.js
export default {
    external: [
        "vscode-icons-js",
        "solid-js",
        "solid-js/web",
        "@monaco-editor/loader",
        "monaco-editor",
        // "vscode-oniguruma",
    ],
    input: "./test/index.ts",
    output: {
        dir: "./dist/",
        format: "es",
        paths: {
            // 这个库 40k
            "vscode-icons-js": "https://cdn.skypack.dev/vscode-icons-js",
            // 两个主要的库也可以使用 cdn
            "solid-js": "https://cdn.skypack.dev/solid-js",
            "solid-js/web": "https://cdn.skypack.dev/solid-js/web/dist/web.js",
            "@monaco-editor/loader":
                "https://cdn.skypack.dev/@monaco-editor/loader",
        },
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
            load(id) {
                if (id.endsWith("onig.wasm")) {
                    return `
                    const a ='https://cdn.jsdelivr.net/npm/vscode-oniguruma/release/onig.wasm'
                    export default a`;
                }
            },
        },
        {
            resolveDynamicImport(thisFile, importer) {
                // 将里面的动态导入全部导向 cdn
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
                    replacement: true
                        ? "https://cdn.jsdelivr.net/npm/rollup-web"
                        : "./rollup-web",
                },

                {
                    find: /^(monaco-editor.*)/,
                    replacement: "$1.js",
                    customResolver(thiFile, importer) {
                        console.log(thiFile);
                        return {
                            external: true,
                            id: `https://esm.run/${thiFile}`,
                        };
                    },
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
