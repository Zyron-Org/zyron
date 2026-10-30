// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/ZyronAttestation.sol";

/**
 * @notice Deploys ZyronAttestation to Base Sepolia (chain ID 84532).
 *
 * Usage:
 *   forge script script/DeployBaseSepolia.s.sol:DeployBaseSepoliaScript \
 *     --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $OPERATOR_PRIVATE_KEY --broadcast
 */
contract DeployBaseSepoliaScript is Script {
  uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;

  ZyronAttestation public lastDeployed;

  function run() external {
    require(
      block.chainid == BASE_SEPOLIA_CHAIN_ID,
      "DeployBaseSepolia: wrong network, expected Base Sepolia (84532)"
    );

    address operator = vm.envOr("OPERATOR_ADDRESS", msg.sender);

    vm.startBroadcast();
    ZyronAttestation attestation = new ZyronAttestation(operator);
    lastDeployed = attestation;
    console.log("ZyronAttestation (Base Sepolia) Deployed at:", address(attestation));
    vm.stopBroadcast();

    console.log("--------------------------------------------------");
    console.log("BASE_SEPOLIA_ATTESTATION_ADDRESS=", address(attestation));
    console.log("--------------------------------------------------");
  }
}
