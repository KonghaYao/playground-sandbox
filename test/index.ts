import { FS, Sandbox } from "../src/sandbox";
import { render } from "solid-js/web";
const fs = new FS("_rollup_web_store_");
const fileReflect = async (realPath: string, innerPath: string) => {
    const config = await fetch(realPath).then((res) => res.text());
    await fs.promises.writeFile(innerPath, config);
};
await fileReflect("./test/worker.js", "/rollup.config.web.js");
await fileReflect("./test/index.html", "/index.html");
console.log(fs);
render(Sandbox as any, document.body);
