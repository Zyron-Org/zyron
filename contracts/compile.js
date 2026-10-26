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

const source = fs.readFileSync(path.resolve(__dirname, 'src', 'ZyronAttestation.sol'), 'utf8');

const input = {
  language: 'Solidity',
  sources: {
    'ZyronAttestation.sol': {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    viaIR: true,
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode.object'],
      },
    },
  },
};

console.log('Compiling ZyronAttestation.sol with solc 0.8.20...');
const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  let hasErrors = false;
  output.errors.forEach(err => {
    if (err.severity === 'error') {
      hasErrors = true;
      console.error('COMPILE ERROR:', err.formattedMessage);
    } else {
      console.warn('COMPILE WARNING:', err.formattedMessage);
    }
  });
  if (hasErrors) {
    process.exit(1);
  }
}

const contract = output.contracts['ZyronAttestation.sol']['ZyronAttestation'];
const abi = contract.abi;
const bytecode = '0x' + contract.evm.bytecode.object;

console.log('Compilation SUCCESS!');
console.log('ABI functions count:', abi.filter(x => x.type === 'function').length);
console.log('Bytecode size (bytes):', bytecode.length / 2);

fs.mkdirSync(path.resolve(__dirname, 'out'), { recursive: true });
fs.writeFileSync(
  path.resolve(__dirname, 'out', 'ZyronAttestation.json'),
  JSON.stringify({ abi, bytecode }, null, 2)
);

// Write to zyron-frontend/lib/zyron-contract.ts
const frontendTs = `// Auto-generated contract ABI and deployment artifact for ZyronAttestation.sol
export const ZYRON_ATTESTATION_ABI = ${JSON.stringify(abi, null, 2)};

export const ZYRON_ATTESTATION_BYTECODE = '${bytecode}';
`;

fs.writeFileSync(
  path.resolve(__dirname, '..', 'zyron-frontend', 'lib', 'zyron-contract.ts'),
  frontendTs
);

console.log('Updated zyron-frontend/lib/zyron-contract.ts');
