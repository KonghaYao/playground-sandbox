import { atom, resource } from '@cn-ui/reactive';
import { Nodebox } from '@codesandbox/nodebox';
import { SandboxContext } from '../context/sandbox';
import { batch, onMount } from 'solid-js';
export const NodeBox = () => {
    const preview = atom<HTMLIFrameElement | null>(null)
    const runtime = atom<HTMLIFrameElement | null>(null)
    const context = SandboxContext.use()

    const a = resource(async () => {
        const emulator = new Nodebox({
            iframe: runtime()!,
        });
        await emulator.connect();

        await emulator.fs.init({
            'package.json': JSON.stringify({
                name: 'my-app',
            }),
        });
        const shell = emulator.shell.create();
        const serverCommand = await shell.runCommand("node", ["-v"]);
        // const { url } = await emulator.preview.getByShellId(serverCommand.id);
        // preview()!.setAttribute("src", url);
        batch(()=>{
            context.fs(() => emulator.fs) // 注入 fs
            context.shell(() => shell) // 注入 shell
        })
        await context.onMount(context)
        console.log("注入完成")
    }, { immediately: false })
    onMount(() => a.refetch())
    return <>
        <iframe class='h-full w-full' ref={preview} ></iframe>
        <iframe ref={runtime} class='hidden' ></iframe>
    </>
}