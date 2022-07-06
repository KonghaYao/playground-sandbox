/* CDN */
export const CDN = {
    __themeCDN__: "https://fastly.jsdelivr.net/npm/monaco-themes/themes/",
    __monacoCDN__:
        "https://fastly.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs",
};
export type Monaco = Awaited<typeof import("monaco-editor")>;
declare global {
    let monaco: Monaco;
}
