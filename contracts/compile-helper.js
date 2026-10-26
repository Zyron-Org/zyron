const fs = require('fs');
const path = require('path');
const solc = require('solc');

function findImports(importPath) {
  if (importPath.startsWith('@openzeppelin/')) {
    const fullPath = path.resolve(__dirname, 'node_modules', importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return { error: 'File not found: ' + importPath };
}

module.exports = { findImports };
