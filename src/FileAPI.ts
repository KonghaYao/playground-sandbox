import _FS from "@isomorphic-git/lightning-fs";

type TreeObject = {
    [ket: string]: TreeObject | string;
};
/* 向外部导出的 API */
export class FileAPI {
    constructor(public fs: _FS) {}
    /* 安全地创建深层文件夹并给出文件 */
    async outputFile(path: string, code: string) {
        const list = path.split("/");
        list.pop();
        await list.reduce((col, cur) => {
            if (cur) {
                return col.then(async (root) => {
                    const dir = root + cur + "/";
                    try {
                        await this.fs.promises.stat(dir);
                    } catch (e) {
                        await this.fs.promises.mkdir(dir);
                    }
                    return dir;
                });
            } else {
                return col;
            }
        }, Promise.resolve("/"));
        return this.fs.promises.writeFile(path, code);
    }
    /* 将 web 地址映射到 fs 中 */
    async reflect(
        fsPath: string,
        webPath: string,
        getCode?: (webPath: string) => Promise<string> | string
    ) {
        const code = await (getCode
            ? getCode(webPath)
            : fetch(webPath).then((res) => res.text()));
        await this.outputFile(fsPath, code);
    }
    /* 将树状结构映射到 fs 中 */
    async mergeTree(tree: TreeObject, root = "/") {
        const promises = Object.entries(tree).map(async ([key, value]) => {
            if (typeof value === "string") {
                return this.reflect(root + key, value);
            } else {
                return this.mergeTree(value, root + key + "/");
            }
        });
        await Promise.all(promises);
        return;
    }
}
