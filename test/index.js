import { createSandbox } from "../dist/index.js";

createSandbox(
    document.body,
    {
        files: [
            ["/index.html", "/rollup.config.web.js"],
            ["/rollup.config.web.js"],
            [],
        ],
    },
    {
        async beforeMount(api) {
            await api.mergeTree({
                "rollup.config.web.js": "./test/worker.js",
                "index.html": "./test/index.html",
                test: {
                    "index.html": "./index.html",
                },
            });
        },
    }
);
