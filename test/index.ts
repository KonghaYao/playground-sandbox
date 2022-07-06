import { createSandbox } from "../src/index";

createSandbox(document.body, {
    async beforeMount(api) {
        // await api.reflect("/rollup.config.web.js", "./test/worker.js");
        // await api.reflect("/index.html", "./test/index.html");
        await api.mergeTree(
            {
                "rollup.config.web.js": "./test/worker.js",
                "index.html": "./index.html",
                test: {
                    "index.html": "./index.html",
                },
            },
            "/"
        );
    },
});
