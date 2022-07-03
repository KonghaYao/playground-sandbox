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
        nodeResolve({
            extensions: [".ts", ".tsx", ".js"],
        }),
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
