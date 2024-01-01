import UnoCSS from 'unocss/vite'
import Solid from 'vite-plugin-solid'
export default {
    plugins: [
        Solid(),
        UnoCSS(),
    ],
    build: {
        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: 'src/index.tsx',
            formats: ['es']
        },
        cssCodeSplit: true
    }
}