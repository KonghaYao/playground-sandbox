import { createSandbox } from "../src/index.tsx";

createSandbox(
    document.body,
    {
        files: [
            ["/package.json"],
            [],
        ],
        async onMount(context) {
            await context.fetchTo(new Request('/test/index.html'), "/index.html")
            console.log(await context.fs().readdir('/'))
        }
    },
);
