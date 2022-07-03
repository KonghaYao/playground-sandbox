// declare namespace globalThis {
//     export let monaco: Awaited<typeof import("monaco-editor")>;
// }
declare module "*.svg" {
    const a: () => SVGViewElement;
    export default a;
}
