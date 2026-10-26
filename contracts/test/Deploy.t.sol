// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../script/Deploy.s.sol";
import "../src/ZyronAttestation.sol";

/// @notice Tests for the Monad Testnet deployment script.
contract DeployScriptTest is Test {
    DeployScript public script;

    function setUp() public {
        script = new DeployScript();
    }

    function test_MonadTestnetChainIdConstant() public view {
        assertEq(script.MONAD_TESTNET_CHAIN_ID(), 10143);
    }

    function test_DeployRunsOnMonadTestnet() public {
        vm.chainId(10143);
        script.run();
    }

    function test_DeployRevertsOnWrongChain() public {
        vm.chainId(421614); // Arbitrum Sepolia must no longer be a valid target
        vm.expectRevert("Deploy: wrong network, expected Monad Testnet (10143)");
        script.run();
    }

    function test_DeployUsesOperatorFromEnv() public {
        vm.chainId(10143);
        address op = address(0xBEEF);
        vm.setEnv("OPERATOR_ADDRESS", vm.toString(op));
        script.run();
        assertEq(script.lastDeployed().operator(), op);
    }
}
