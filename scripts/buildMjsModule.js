const { copyFileSync } = require('fs')
const { dirname, join } = require('path')

const packageRoot = dirname(__dirname);

copyFileSync(
    join(packageRoot, 'esm', 'index.js'),
    join(packageRoot, 'build', 'index.mjs')
);
