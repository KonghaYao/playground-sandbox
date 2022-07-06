type IVSCodeTheme = any;
type IMonacoThemeRule = any;
const keepSafe = (color: string) => {
    if (color.length === 4) {
        color = color.replace(
            /#([0-9|a-f])([0-9|a-f])([0-9|a-f])/i,
            "#$1$1$2$2$3$3"
        );
    }
    return color;
};
function evalAsArray(color: any, monacoThemeRule: any[]) {
    if (color.scope) {
        (color.scope as string[]).map((scope) => {
            monacoThemeRule.push({
                ...color.settings,
                token: scope,
            });
        });
    }
}
export function convertTheme(theme: IVSCodeTheme, base = "vs") {
    const monacoThemeRule: IMonacoThemeRule = [];
    const returnTheme = {
        inherit: true,
        base,
        colors: Object.fromEntries(
            Object.entries(theme.colors).map(([key, value]) => {
                return [key, keepSafe(value as string)];
            })
        ),
        rules: monacoThemeRule,
        encodedTokensColors: [],
    };
    console.log(monacoThemeRule);
    theme.tokenColors.forEach((color: any) => {
        if (typeof color.scope == "string") {
            color.scope = color.scope.split(",");
        }

        evalAsArray(color, monacoThemeRule);
    });

    return returnTheme;
}
