import babel from "@rollup/plugin-babel";
import nodeResolve from "@rollup/plugin-node-resolve";
// rollup.config.js
export default {
    input: "./test/index.ts",
    output: {
        file: "./dist/test.js",
        format: "es",
    },
    plugins: [
        nodeResolve({
            extensions: [".ts", ".tsx"],
        }),
        babel({
            babelHelpers: "bundled",
            extensions: ["", ".ts", ".tsx"],
        }),
    ],
};
