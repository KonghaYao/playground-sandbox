import { languageDetection } from "../utils/languageDetection";

/* 保存单个文件 Monaco Model 的类 */
export class FileModel {
    path!: string;
    model!: ReturnType<typeof monaco["editor"]["createModel"]>;
    init(path: string, code: string) {
        this.path = path;
        const language = languageDetection(path);
        this.model = monaco.editor.createModel(code, language);
    }
    destroy() {
        this.model.dispose();
    }
    changeLanguage(language: string) {
        monaco.editor.setModelLanguage(this.model, language);
        console.log("语言更换为 " + language);
    }
}
