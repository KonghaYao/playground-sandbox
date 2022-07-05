/* 保存单个文件 Monaco Model 的类 */
export class FileModel {
    path!: string;
    model!: ReturnType<typeof monaco["editor"]["createModel"]>;
    init(path: string, code: string, language = "javascript") {
        this.path = path;
        this.model = monaco.editor.createModel(code, language);
    }
    destroy() {
        this.model.dispose();
    }
}
