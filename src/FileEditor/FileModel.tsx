import { languageDetection } from "../utils/languageDetection";
import { wrapper } from "./getMonaco";

/* 保存单个文件 Monaco Model 的类 */
export class FileModel {
    path!: string;
    model!: ReturnType<typeof monaco["editor"]["createModel"]>;
    async init(path: string, code: string) {
        this.path = path;
        const language = languageDetection(path);
        if (language) {
            console.log("loading ", language);
            await wrapper.loadLanguage(language);
        }
        this.model = monaco.editor.createModel(code, language);
    }
    destroy() {
        this.model.dispose();
    }
    async changeLanguage(language: string) {
        await wrapper.loadLanguage(language);

        monaco.editor.setModelLanguage(this.model, language);
        console.log("语言更换为 " + language);
    }
}
