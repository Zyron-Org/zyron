const fs = require('fs');
const path = require('path');
const { ethers } = require('../backend/node_modules/ethers');

// Load local gitignored contracts/.env if present
const localEnvPath = path.resolve(__dirname, '.env');
if (fs.existsSync(localEnvPath)) {
  const envContent = fs.readFileSync(localEnvPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const BASE_SEPOLIA_RPC_URL =
  process.env.BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';
const BASE_SEPOLIA_CHAIN_ID = 84532;

function getCompiledArtifact() {
  const artifactPath = path.resolve(__dirname, 'out', 'ZyronAttestation.json');
  if (!fs.existsSync(artifactPath)) {
    require('./compile.js');
  }
  return JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
}

async function main() {
  const privateKey = process.env.OPERATOR_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error(
      'ERROR: OPERATOR_PRIVATE_KEY is required in contracts/.env or environment.',
    );
    process.exit(1);
  }
  const wallet = new ethers.Wallet(privateKey);
  const counterfactualNonce0 = ethers.getCreateAddress({
    from: wallet.address,
    nonce: 0,
  });

  console.log('==============================================================');
  console.log('  ZyronAttestation — Base Sepolia (84532) Deployment Tool');
  console.log('==============================================================');
  console.log(`Operator Address               : ${wallet.address}`);
  console.log(`Counterfactual Address (nonce 0): ${counterfactualNonce0}`);
  console.log(`Base Sepolia RPC               : ${BASE_SEPOLIA_RPC_URL}`);

  const provider = new ethers.JsonRpcProvider(
    BASE_SEPOLIA_RPC_URL,
    BASE_SEPOLIA_CHAIN_ID,
  );
  const signer = wallet.connect(provider);

  let balance = 0n;
  let nonce = 0;
  try {
    [balance, nonce] = await Promise.all([
      provider.getBalance(wallet.address),
      provider.getTransactionCount(wallet.address),
    ]);
    console.log(
      `Base Sepolia Balance           : ${ethers.formatEther(balance)} ETH (nonce: ${nonce})`,
    );
  } catch (err) {
    console.warn(
      `[WARN] Could not query Base Sepolia RPC (${err.message}). Using counterfactual address ${counterfactualNonce0}.`,
    );
    process.exit(0);
  }

  const nextCreateAddress = ethers.getCreateAddress({
    from: wallet.address,
    nonce,
  });

  // Check if contract is already deployed at counterfactualNonce0
  const existingCode = await provider.getCode(counterfactualNonce0);
  if (existingCode && existingCode !== '0x') {
    console.log(
      `[OK] ZyronAttestation is ALREADY deployed on Base Sepolia at ${counterfactualNonce0}`,
    );
    return;
  }

  if (balance === 0n) {
    console.log('\n[ACTION REQUIRED] Operator wallet has 0.0 ETH on Base Sepolia.');
    console.log(`1. Fund ${wallet.address} with Base Sepolia ETH`);
    console.log('2. Re-run: npm --prefix contracts run deploy:base-sepolia');
    console.log(
      `   It will deploy ZyronAttestation to: ${nextCreateAddress}`,
    );
    process.exit(0);
  }

  const { abi, bytecode } = getCompiledArtifact();
  console.log(`\nBroadcasting ZyronAttestation(${wallet.address}) to Base Sepolia...`);
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy(wallet.address);
  const deployTx = contract.deploymentTransaction();
  console.log(`Deployment Tx Hash             : ${deployTx.hash}`);

  const receipt = await deployTx.wait(1);
  const deployedAddress = await contract.getAddress();
  console.log(`Confirmed in Block             : ${receipt.blockNumber}`);
  console.log(`BASE_SEPOLIA_ATTESTATION_ADDRESS=${deployedAddress}`);

  const deploymentJsonPath = path.resolve(
    __dirname,
    'deployments',
    '84532.json',
  );
  const deploymentRecord = {
    chainId: 84532,
    network: 'Base Sepolia',
    isTestnet: true,
    rpcUrl: BASE_SEPOLIA_RPC_URL,
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrencySymbol: 'ETH',
    contracts: {
      ZyronAttestation: {
        address: deployedAddress,
        deployTxHash: deployTx.hash,
        blockNumber: receipt.blockNumber,
        deployer: wallet.address,
        operator: wallet.address,
        eip712Domain: {
          name: 'ZyronAttestation',
          version: '3.0.0',
          chainId: 84532,
          verifyingContract: deployedAddress,
        },
        status: 'DEPLOYED',
      },
    },
  };
  fs.writeFileSync(
    deploymentJsonPath,
    JSON.stringify(deploymentRecord, null, 2) + '\n',
  );
  console.log(`Updated ${deploymentJsonPath}`);
}

main().catch((err) => {
  console.error('Deployment failed:', err);
  process.exit(1);
});
