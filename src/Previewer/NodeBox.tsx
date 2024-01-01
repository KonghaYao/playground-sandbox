import { atom, resource } from '@cn-ui/reactive';
import { Nodebox } from '@codesandbox/nodebox';
import { SandboxContext } from '../context/sandbox';
import { batch, onMount } from 'solid-js';
import { Portal } from 'solid-js/web';

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
                "scripts": {
                    "dev": "node main.js",
                },
                "dependencies": {
                    "@cn-ui/reactive": "^2.3.0",
                    "@codesandbox/nodebox": "^0.1.9",
                    "mitt": "^3.0.0",
                }
            }, null, 4),
            'main.js': `
import http from 'http'
 
const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/plain'
  })
 res.end('Hello from Nodebox')
})
 
server.listen(3000, () => {
  console.log('Server is ready!')
})
  `
        });
        const shell = emulator.shell.create();
        const pty = context.terminal().pty
        pty.write('npm run dev')


        let running = true
        pty.onReadable(async () => {
            const str = String.fromCharCode(...pty.read())
            if (running) {
                shell.stdin.write(str)
            } else {
                running = true
                const [command, ...args] = str.trim().split(/\s/g)
                const serverCommand = await shell.runCommand(command, args)
                emulator.preview.getByShellId(serverCommand.id).then(({ url }) => {
                    preview()!.setAttribute("src", url);
                })
            }
        })
        pty.onSignal((signal: string) => {
            console.log(signal)
            if (running && signal === 'SIGINT') {
                shell.kill()
                pty.write("\r\n\x1b[33m$\x1b[0m ")
                running = false
                return false
            }
        })
        shell.stdout.on('data', (data) => {
            console.info(data)
            context.terminal()?.pty.write(data)
        })
        shell.stderr.on('data', (data) => {
            console.error(data)
            context.terminal()?.pty.write(data)
        })
        batch(() => {
            context.fs(() => emulator.fs) // 注入 fs
            context.shell(() => shell) // 注入 shell
        })

        await context.onMount(context)
        context.terminal().prompt()
        console.log("注入完成")
    }, { immediately: false })
    onMount(() => a.refetch())
    return <>
        <iframe class='w-full b-0' ref={preview} ></iframe>
        <Portal mount={document.body}>
            <iframe ref={runtime} style={{
                display: "none"
            }} ></iframe>
        </Portal>
    </>
}