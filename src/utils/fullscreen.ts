type FunctionMap = [
    "requestFullscreen",
    "exitFullscreen",
    "fullscreenElement",
    "fullscreenEnabled",
    "fullscreenchange",
    "fullscreenerror"
];

// from: https://github.com/sindresorhus/screenfull.js/blob/master/src/screenfull.js
const functionsMap: FunctionMap[] = [
    [
        "requestFullscreen",
        "exitFullscreen",
        "fullscreenElement",
        "fullscreenEnabled",
        "fullscreenchange",
        "fullscreenerror",
    ],
    // New WebKit
    [
        "webkitRequestFullscreen",
        "webkitExitFullscreen",
        "webkitFullscreenElement",
        "webkitFullscreenEnabled",
        "webkitfullscreenchange",
        "webkitfullscreenerror",
    ],
    // Old WebKit
    [
        "webkitRequestFullScreen",
        "webkitCancelFullScreen",
        "webkitCurrentFullScreenElement",
        "webkitCancelFullScreen",
        "webkitfullscreenchange",
        "webkitfullscreenerror",
    ],
    [
        "mozRequestFullScreen",
        "mozCancelFullScreen",
        "mozFullScreenElement",
        "mozFullScreenEnabled",
        "mozfullscreenchange",
        "mozfullscreenerror",
    ],
    [
        "msRequestFullscreen",
        "msExitFullscreen",
        "msFullscreenElement",
        "msFullscreenEnabled",
        "MSFullscreenChange",
        "MSFullscreenError",
    ],
] as any;

let isSupported = false;
let map: FunctionMap = functionsMap[0];
if (!document) {
    isSupported = false;
} else {
    for (const m of functionsMap) {
        if (m[1] in document) {
            map = m;
            isSupported = true;
            break;
        }
    }
}

const [REQUEST, EXIT, ELEMENT, ,] = map;

export async function fullscreen(target: HTMLElement) {
    async function exit() {
        if (!isSupported) return;
        if (document?.[ELEMENT]) await document[EXIT]();
    }

    if (!isSupported) return;
    await exit();
    if (target) {
        await target[REQUEST]();
    }
    return exit;
}
