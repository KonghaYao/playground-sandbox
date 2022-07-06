const ready = (async () => {
    const data: {
        [key: string]: { extensions: string[] };
    } = await fetch(
        "https://cdn.jsdelivr.net/npm/vscode-icons-js/data/static/languages-vscode.json"
    ).then((res) => res.json());
    const map = new Map<string, string>();
    Object.entries(data).forEach(([languageName, value]) => {
        value.extensions.forEach((i) => {
            map.set(i, languageName);
        });
    });
    return map;
})();
export const languageDetection = async (path: string) => {
    return ready.then((map) => {
        const ext = path.replace(/.*(\.\w+)?$/, "$1");
        return map.get(ext);
    });
};
