# rollup in Browser!

Simply use rollup to bundle esm or commonjs or typescript code in browser! We have a easy way to do that!

# Get Start

```js
import {
    useRollup,
    web_module,
    sky_module,
    ModuleEval,
} from "https://cdn.jsdelivr.net/npm/rollup-web/dist/index.js";

// 导入各种插件
import { json } from "../dist/plugins/json.js";
import { initBabel, babel } from "../dist/plugins/babel.js";
import { initSwc, swcPlugin } from "../dist/plugins/swc.js";
import { alias } from "../dist/plugins/alias.js";
import { commonjs } from "../dist/plugins/commonjs.js";
import { replace } from "../dist/plugins/replace.js";
import mocha from "https://esm.run/mocha/mocha.js";

// swc, babel must init before used.
// await initBabel();
await initSwc();

const config = {
    input: "./public/test.ts",
    output: {
        format: "es",
    },
    plugins: [
        json(),
        alias({
            entries: [{ find: "@", replacement: "./" }],
        }),
        commonjs({
            extensions: [".cjs", ".js"],
        }),

        replace({
            __buildDate__: () => JSON.stringify(new Date()),
            __buildVersion: "15",
        }),

        // You can use Babel to compile Typescript! Or other awesome code!
        // babel({
        //     babelrc: {
        //         presets: [Babel.availablePresets.typescript],
        //     },
        //     extensions: [".ts"],
        // }),

        // Swc plugin is used to compile typescript to esm! Yes! Typescript! But dependencies more bigger then babel.
        swcPlugin({
            log(id) {
                console.warn("> " + id);
            },
        }),

        // web_module can get code file from your web site!
        web_module({
            // 如果不设置 root， 则是相对于网页的 url 进行获取
            // 甚至可以对 npm 包进行动态打包！
            // root: 'https://cdn.jsdelivr.net/npm/skypack-api/',
            extension: ".ts",

            log(url) {
                console.log("%c " + url, "color:green");
            },
        }),

        // some package in node_module (We don't use it!) will be redirected to a ESM cdn! (if it can run in the browser...)
        // but we actually don't download the source code!
        sky_module({
            cdn: "https://esm.run/",
        }),
    ],
};
const res = await useRollup(config);
```
