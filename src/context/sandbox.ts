import { atom } from "@cn-ui/reactive";
import { makeContext } from "./makeContext";
import { FileSystemApi, IFileStats } from "@codesandbox/nodebox/build/modules/fs";
import { ShellProcess } from "@codesandbox/nodebox";
const NullAtom = <T>() => {
    return atom<T>(null as unknown as T)
}

export const SandboxContext = makeContext(() => {
    const staticValue = {
        fs: NullAtom<FileSystemApi>(),
        shell: NullAtom<ShellProcess>(),

    }
    return {
        ...staticValue, async onMount(context = staticValue) {
        },
        async fetchTo(url: Request, fsPath: string) {
            const code = await fetch(url).then(res => res.text())
            return this.fs().writeFile(fsPath,code)
        }
    }
})


export const fileListController = makeContext(() => {
    return {
        fileList: atom<(IFileStats & { name: string })[]>([]),

    }
})