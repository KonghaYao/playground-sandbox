import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import fs from "fs";
import postcss from "rollup-plugin-postcss";

// rollup.config.js
export default {
    external: ["vscode-icons-js"],
    input: "./test/index.ts",
    output: {
        file: "./dist/test.js",
        format: "es",
        paths: {
            "vscode-icons-js": "https://esm.run/vscode-icons-js",
        },
    },
    plugins: [
        alias({
            entries: [
                // 这个库的导出出现了问题，我们将其导出改为 Index.ts
                {
                    find: "vscode-icons-js",
                    replacement: "vscode-icons-js/src/Index",
                },
            ],
        }),
        nodeResolve({
            extensions: [".ts", ".tsx", ".js"],
        }),
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
        postcss(),
        babel({
            babelHelpers: "bundled",
            extensions: [".js", ".ts", ".tsx", ".svg"],
        }),
    ],
};
