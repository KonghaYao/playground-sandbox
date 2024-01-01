import { render } from "solid-js/web";
import { Sandbox, SandboxInput } from "./sandbox";
import { SandboxContext } from "./context/sandbox";
import 'virtual:uno.css'

export const createSandbox = async (
    element: HTMLElement,
    sandboxOptions: SandboxInput,
) => {
    render(() => {
        return <SandboxContext.Provider value={{ ...SandboxContext.defaultValue, onMount: sandboxOptions.onMount ?? (() => { }) }}>
            <Sandbox {...sandboxOptions}></Sandbox>
        </SandboxContext.Provider>
    }, element);
    return;
};
