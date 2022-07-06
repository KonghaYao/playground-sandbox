import { createSandbox } from "../src/index";

createSandbox(document.body, {
    async beforeMount(api) {
        await api.reflect("./test/worker.js", "/rollup.config.web.js");
        await api.reflect("./test/index.html", "/index.html");
        // api.mergeTree(
        //     {
        //         test: {
        //             "worker.js": "/rollup.config.web.js",
        //             "index.html": "/index.html",
        //         },
        //     },
        //     "./"
        // );
    },
});
