// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ZyronAttestation.sol";

/**
 * @notice Deploys ZyronAttestation to Monad Testnet (chain ID 10143).
 *
 * Usage:
 *   forge script script/Deploy.s.sol:DeployScript \
 *     --rpc-url monad_testnet --private-key $PRIVATE_KEY --broadcast
 */
contract DeployScript is Script {
  uint256 public constant MONAD_TESTNET_CHAIN_ID = 10143;

  ZyronAttestation public lastDeployed;

  function run() external {
    require(
      block.chainid == MONAD_TESTNET_CHAIN_ID,
      "Deploy: wrong network, expected Monad Testnet (10143)"
    );

    // Operator defaults to the deployer unless OPERATOR_ADDRESS is provided.
    address operator = vm.envOr("OPERATOR_ADDRESS", msg.sender);

    vm.startBroadcast();

    // 1. Deploy ZyronAttestation registry & Soulbound badge contract
    ZyronAttestation attestation = new ZyronAttestation(operator);
    lastDeployed = attestation;
    console.log("ZyronAttestation Deployed at:", address(attestation));

    vm.stopBroadcast();

    console.log("--------------------------------------------------");
    console.log("Deployment Complete!");
    console.log("ATTESTATION_CONTRACT_ADDRESS=", address(attestation));
    console.log("--------------------------------------------------");
  }
}
