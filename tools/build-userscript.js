const fs = require('fs');

const script = fs.readFileSync('dist/main.js').toString();
const header = `// ==UserScript==
// @name            IW Logger
// @description     https://github.com/anon962/IwLog
// @author          프레이
// @match           *://*.hentaiverse.org/*

// @grant           GM.registerMenuCommand
// @require         https://cdn.jsdelivr.net/npm/alameda@1.4.0/alameda.js
// ==/UserScript==`

const userScript = header + '\n\n' + script
fs.writeFile('dist/userscript.js', userScript, function (err) {
    if (err) return console.log(err);
});