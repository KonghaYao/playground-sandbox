import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
import postcss from "rollup-plugin-postcss";

// rollup.config.js
export default {
    input: "./test/index.ts",
    output: {
        file: "./dist/test.js",
        format: "es",
    },
    plugins: [
        postcss(),
        nodeResolve({
            extensions: [".ts", ".tsx"],
        }),
        babel({
            babelHelpers: "bundled",
            extensions: ["", ".ts", ".tsx"],
        }),
    ],
};
