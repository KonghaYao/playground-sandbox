import { Component, JSXElement } from "solid-js";
export const Info: Component<{
    children: JSXElement;
    class?: string;
}> = (props) => {
    return (
        <div
            class={props.class}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                display: "flex",
                "justify-content": "center",
                "align-items": "center",
                "z-index": 10,
            }}
        >
            {props.children}
        </div>
    );
};
