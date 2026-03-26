const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Build TypeScript
esbuild.buildSync({
  entryPoints: ['src/ts/app.ts'],
  bundle: true,
  outfile: 'dist/js/app.js',
  format: 'iife',
  target: 'es2020',
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
});

// Copy HTML
fs.cpSync('src/index.html', 'dist/index.html');

// Copy CSS
fs.mkdirSync('dist/css', { recursive: true });
fs.cpSync('src/css/style.css', 'dist/css/style.css');

// Copy content files
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.cpSync(srcPath, destPath);
    }
  }
}

copyDir('src/content', 'dist/content');

// Copy public assets
if (fs.existsSync('public')) {
  copyDir('public', 'dist');
}

console.log('Build complete!');
