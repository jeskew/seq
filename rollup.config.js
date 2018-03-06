import typescript from 'rollup-plugin-typescript'

export default {
    input: './src/index.ts',
    output: {
        format: 'es',
        file: './lib/index.mjs'
    },
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfig: false,
            module: "es2015",
            moduleResolution: "node",
            target: "es2017",
            lib: [
                "es2015",
                "esnext.asynciterable"
            ],
            strict: true,
            importHelpers: true
        })
    ]
}
