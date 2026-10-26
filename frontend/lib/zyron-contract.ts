// Auto-generated contract ABI and deployment artifact for ZyronAttestation.sol
export const ZYRON_ATTESTATION_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_operator",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "ECDSAInvalidSignature",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "length",
        "type": "uint256"
      }
    ],
    "name": "ECDSAInvalidSignatureLength",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "s",
        "type": "bytes32"
      }
    ],
    "name": "ECDSAInvalidSignatureS",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721IncorrectOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721InsufficientApproval",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "approver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidApprover",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOperator",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidOwner",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "receiver",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidReceiver",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "sender",
        "type": "address"
      }
    ],
    "name": "ERC721InvalidSender",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ERC721NonexistentToken",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "EnforcedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ExpectedPause",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "InvalidShortString",
    "type": "error"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "str",
        "type": "string"
      }
    ],
    "name": "StringTooLong",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "currentAdmin",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "pendingAdmin",
        "type": "address"
      }
    ],
    "name": "AdminTransferInitiated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newAdmin",
        "type": "address"
      }
    ],
    "name": "AdminUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "approved",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "auditId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "bytecodeHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "leadAuditor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "ipfsReportCid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "status",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AttestationPublished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "auditId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "reason",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "AttestationRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_fromTokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_toTokenId",
        "type": "uint256"
      }
    ],
    "name": "BatchMetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "EIP712DomainChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "_tokenId",
        "type": "uint256"
      }
    ],
    "name": "MetadataUpdate",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOperator",
        "type": "address"
      }
    ],
    "name": "OperatorUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Paused",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "Unpaused",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "ATTESTATION_TYPEHASH",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "acceptAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "attestationCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "bytecodeToAuditId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "eip712Domain",
    "outputs": [
      {
        "internalType": "bytes1",
        "name": "fields",
        "type": "bytes1"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "chainId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "verifyingContract",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "salt",
        "type": "bytes32"
      },
      {
        "internalType": "uint256[]",
        "name": "extensions",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "gitCommitToAuditId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newAdmin",
        "type": "address"
      }
    ],
    "name": "initiateAdminTransfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "operator",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pendingAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationInput",
        "name": "input",
        "type": "tuple"
      }
    ],
    "name": "publishAttestation",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationInput",
        "name": "input",
        "type": "tuple"
      },
      {
        "internalType": "uint8",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }
    ],
    "name": "publishAttestationWithSignature",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "registry",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "auditId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "protocolName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "targetContract",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "gitCommit",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "repoTreeHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "bytecodeHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "merkleRoot",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "ipfsReportCid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "ipfsMetadataCid",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "recipient",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "leadAuditor",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "peerAuditor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "sloc",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "enum ZyronAttestation.AttestationStatus",
        "name": "status",
        "type": "uint8"
      },
      {
        "internalType": "bool",
        "name": "isVerified",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "reportCidToAuditId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "auditId",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "reason",
        "type": "string"
      }
    ],
    "name": "revokeAttestation",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_newOperator",
        "type": "address"
      }
    ],
    "name": "setOperator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "tokenToAuditId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "auditId",
        "type": "bytes32"
      }
    ],
    "name": "verifyAttestation",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "enum ZyronAttestation.AttestationStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isVerified",
            "type": "bool"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "bytecodeHash",
        "type": "bytes32"
      }
    ],
    "name": "verifyByBytecodeHash",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "enum ZyronAttestation.AttestationStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isVerified",
            "type": "bool"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "gitCommit",
        "type": "string"
      }
    ],
    "name": "verifyByGitCommit",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "enum ZyronAttestation.AttestationStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isVerified",
            "type": "bool"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "ipfsReportCid",
        "type": "string"
      }
    ],
    "name": "verifyByReportCid",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "auditId",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "protocolName",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "targetContract",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "gitCommit",
            "type": "string"
          },
          {
            "internalType": "bytes32",
            "name": "repoTreeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "bytecodeHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "merkleRoot",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "ipfsReportCid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "ipfsMetadataCid",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "leadAuditor",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "peerAuditor",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "sloc",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenId",
            "type": "uint256"
          },
          {
            "internalType": "enum ZyronAttestation.AttestationStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "bool",
            "name": "isVerified",
            "type": "bool"
          }
        ],
        "internalType": "struct ZyronAttestation.AttestationRecord",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export const ZYRON_ATTESTATION_BYTECODE = '0x610160806040523461050d5760208161426280380380916100208285610511565b83398101031261050d57516001600160a01b0381169081900361050d5760405161004b604082610511565b6010815260208101906f2d3cb937b720ba3a32b9ba30ba34b7b760811b825260405191610079604084610511565b600583526020830191640332e302e360dc1b835260405161009b604082610511565b601381527f5a79726f6e205365637572697479205365616c000000000000000000000000006020820152604051906100d4604083610511565b600a82526916965493d38b54d1505360b21b60208301528051906001600160401b03821161040c575f5490600182811c92168015610503575b60208310146103ee5781601f84931161048e575b50602090601f831160011461042b575f92610420575b50508160011b915f199060031b1c1916175f555b8051906001600160401b03821161040c5760015490600182811c92168015610402575b60208310146103ee5781601f849311610378575b50602090601f8311600114610312575f92610307575b50508160011b915f199060031b1c1916176001555b6101b681610534565b610120526101c3846106c7565b61014052519020918260e05251902080610100524660a0526040519060208201927f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f8452604083015260608201524660808201523060a082015260a0815261022c60c082610511565b5190206080523060c05280156102af57600a80546001600160a01b03199081163317909155600b8054909116919091179055604051613a56908161080c823960805181613648015260a05181613705015260c05181613612015260e05181613697015261010051816136bd015261012051816112310152610140518161125a0152f35b60405162461bcd60e51b815260206004820152602a60248201527f5a79726f6e4174746573746174696f6e3a20496e76616c6964206f70657261746044820152696f72206164647265737360b01b6064820152608490fd5b015190505f80610198565b60015f9081528281209350601f198516905b8181106103605750908460019594939210610348575b505050811b016001556101ad565b01515f1960f88460031b161c191690555f808061033a565b92936020600181928786015181550195019301610324565b828111156101825760015f52909150601f830160051c7fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6602085106103e6575b849392601f0160051c82900391015f5b8281106103d6575050610182565b5f818301558594506001016103c8565b5f91506103b8565b634e487b7160e01b5f52602260045260245ffd5b91607f169161016e565b634e487b7160e01b5f52604160045260245ffd5b015190505f80610137565b5f8080528281209350601f198516905b818110610476575090846001959493921061045e575b505050811b015f5561014b565b01515f1960f88460031b161c191690555f8080610451565b9293602060018192878601518155019501930161043b565b82811115610121575f8052909150601f830160051c7f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563602085106104fb575b849392601f0160051c82900391015f5b8281106104eb575050610121565b5f818301558594506001016104dd565b5f91506104cd565b91607f169161010d565b5f80fd5b601f909101601f19168101906001600160401b0382119082101761040c57604052565b908151602081105f146105ae575090601f81511161056e57602081519101516020821061055f571790565b5f198260200360031b1b161790565b604460209160405192839163305a27a960e01b83528160048401528051918291826024860152018484015e5f828201840152601f01601f19168101030190fd5b6001600160401b03811161040c57600854600181811c911680156106bd575b60208210146103ee57601f811161067e575b50602092601f821160011461061d57928192935f92610612575b50508160011b915f199060031b1c19161760085560ff90565b015190505f806105f9565b601f1982169360085f52805f20915f5b868110610666575083600195961061064e575b505050811b0160085560ff90565b01515f1960f88460031b161c191690555f8080610640565b9192602060018192868501518155019401920161062d565b818111156105df5760085f5260205f20601f80840160051c809201920160051c03905f5b8281106106b05750506105df565b5f828201556001016106a2565b90607f16906105cd565b908151602081105f146106f2575090601f81511161056e57602081519101516020821061055f571790565b6001600160401b03811161040c57600954600181811c91168015610801575b60208210146103ee57601f81116107c2575b50602092601f821160011461076157928192935f92610756575b50508160011b915f199060031b1c19161760095560ff90565b015190505f8061073d565b601f1982169360095f52805f20915f5b8681106107aa5750836001959610610792575b505050811b0160095560ff90565b01515f1960f88460031b161c191690555f8080610784565b91926020600181928685015181550194019201610771565b818111156107235760095f5260205f20601f80840160051c809201920160051c03905f5b8281106107f4575050610723565b5f828201556001016107e6565b90607f169061071156fe60a0806040526004361015610012575f80fd5b5f3560e01c9081623ddfa714612a055750806301ffc9a71461297d57806306fdde03146128db57806307090c1f146128a1578063081812fc1461286557806308f4695714612799578063095ea7b3146126af57806317aee51f146125ed57806323b872dd146125d657806326782247146125ae578063271011c51461241d5780632ae1873f146123205780633452a8d8146122f65780633f4ba83a1461228357806342842e0e14612254578063570ca7351461222c5780635c975abb1461220a5780636352211e146121da578063667e99b5146120fd57806370a08231146120ac57806372318d78146115255780637ef50298146113775780638456cb591461131157806384b0196e1461121957806395d89b411461114f578063a15b932114611132578063a22cb4651461107e578063ab6c12df14610fc0578063b3ab15fb14610efb578063b88d4fde14610e8e578063be3843a714610e5b578063c7b8f15414610490578063c87b56dd1461045d578063e985e9c514610406578063f2b739c1146103d3578063f5c2a6ee146101de5763f851a440146101b2575f80fd5b346101da575f3660031901126101da57600a546040516001600160a01b039091168152602090f35b5f80fd5b346101da5760203660031901126101da576004356001600160401b0381116101da576102106020913690600401612bec565b919061021a612dbd565b508260405193849283378101600e81520301902054801515806103b7575b15610354575f52600c60205261035060405f2060ff600f6040519261025c84612c51565b8054845261026c60018201612c8e565b602085015261027d60028201612c8e565b604085015261028e60038201612c8e565b606085015260048101546080850152600581015460a0850152600681015460c08501526102bd60078201612c8e565b60e08501526102ce60088201612c8e565b61010085015260098101546001600160a01b03908116610120860152600a8201548116610140860152600b82015416610160850152600c810154610180850152600d8101546101a0850152600e8101546101c0850152015481811661033281612a4f565b6101e084015260081c16151561020082015260405191829182612a59565b0390f35b60405162461bcd60e51b815260206004820152603560248201527f5a79726f6e4174746573746174696f6e3a204e6f206174746573746174696f6e60448201527408199bdd5b9908199bdc881c995c1bdc9d0810d251605a1b6064820152608490fd5b50805f52600c60205260ff600f60405f20015460081c16610238565b346101da57602080806103e536612d7f565b604051928184925191829101835e8101600e81520301902054604051908152f35b346101da5760403660031901126101da5761041f612b86565b610427612b9c565b9060018060a01b03165f52600560205260405f209060018060a01b03165f52602052602060ff60405f2054166040519015158152f35b346101da5760203660031901126101da5761035061047c60043561355f565b604051918291602083526020830190612a2b565b346101da5760203660031901126101da576004356001600160401b0381116101da5780600401906101a060031982360301126101da57600b546001600160a01b031633148015610e47575b15610de6576104e861329a565b813590815f52600c60205261050a60ff600f60405f20015460081c16156130e5565b6101448101906001600160a01b0361052183613157565b1615610d8a576011545f198114610d76576001019283601155805f52600c60205260405f209481865561055760248401826132b5565b60018801916001600160401b038211610aa45761057e826105788554612c19565b856132e7565b5f90601f8311600114610d12576105ac92915f9183610ca3575b50508160011b915f199060031b1c19161790565b90555b6105bc60448401826132b5565b60028801916001600160401b038211610aa4576105dd826105788554612c19565b5f90601f8311600114610cae5761060a92915f9183610ca35750508160011b915f199060031b1c19161790565b90555b606483019361061c85836132b5565b60038901916001600160401b038211610aa45761063d826105788554612c19565b5f90601f8311600114610c3f5761066a92915f9183610c345750508160011b915f199060031b1c19161790565b90555b6084840135600488015560a48401359485600589015560c4850135948560068a015560e481019161069e83866132b5565b60078c01916001600160401b038211610aa4576106bf826105788554612c19565b5f90601f8311600114610bd0576106ec92915f9183610bc55750508160011b915f199060031b1c19161790565b90555b6101048201996106ff8b876132b5565b60088301916001600160401b038211610aa457610720826105788554612c19565b5f90601f8311600114610b5d57918061075292600f9695945f92610b525750508160011b915f199060031b1c19161790565b90555b61018461012485019461076786613157565b6009840180546001600160a01b0319166001600160a01b0390921691909117905561079188613157565b600a840180546001600160a01b0319166001600160a01b039092169190911790556107bf6101648201613157565b600b840180546001600160a01b03929092166001600160a01b03199092169190911790550135600c82015542600d820155600e81018b905501805461ffff1916610102179055859088610b3f575b61081784876132b5565b9050610b17575b61082881876132b5565b9050610aee575b50505f8881526010602052604090208590556001600160a01b0361085282613157565b1615610ade5761086190613157565b915b6040516020996108738b83612c6d565b5f82526001600160a01b038516948515610acb576001600160a01b036108998c8361319f565b16610ab8578b928b6108ab9233613345565b6108b581876132b5565b9050610951575b5050906108cb6108d192613157565b936132b5565b9092907f4e9d9c9dcf6d9fc4f7a921e4effbbe27c3ae5ecd0e7f8e7844c64d9e79efc2e9936109259160405194859460018060a01b031685528b85015289604085015260c0606085015260c08401916130c5565b600260808301524260a08301520390a4604051908152f35b634e487b7160e01b5f52602160045260245ffd5b602766697066733a2f2f60c81b9261096c61099193896132b5565b80916040519687948501528484013781015f838201520301601f198101835282612c6d565b885f5260068a5260405f20908051906001600160401b038211610aa4576109bc826105788554612c19565b8b908c601f8411600114610a365750826108d19695936108cb95936109f5935f92610a2b5750508160011b915f199060031b1c19161790565b90555b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce78b6040518c8152a191928a91506108bc565b015190508f80610598565b9190601f198416855f52835f20935f905b828210610a8c5750509260019285926108d19998966108cb989610610a74575b505050811b0190556109f8565b01515f1960f88460031b161c191690558e8080610a67565b80600186978294978701518155019601940190610a47565b634e487b7160e01b5f52604160045260245ffd5b6339e3563760e11b5f525f60045260245ffd5b633250574960e11b5f525f60045260245ffd5b50610ae882613157565b91610863565b610afa602091876132b5565b91908260405193849283378101600f81520301902055848a61082f565b816020610b2486896132b5565b91908260405193849283378101600e8152030190205561081e565b885f52600d6020528160405f205561080d565b013590505f80610598565b601f19831691845f5260205f20925f5b818110610bad5750916001939185600f9897969410610b94575b505050811b019055610755565b01355f19600384901b60f8161c191690558f8080610b87565b91936020600181928787013581550195019201610b6d565b013590508e80610598565b601f19831691845f5260205f20925f5b818110610c1c5750908460019594939210610c03575b505050811b0190556106ef565b01355f19600384901b60f8161c191690558d8080610bf6565b91936020600181928787013581550195019201610be0565b013590508b80610598565b601f19831691845f5260205f20925f5b818110610c8b5750908460019594939210610c72575b505050811b01905561066d565b01355f19600384901b60f8161c191690558a8080610c65565b91936020600181928787013581550195019201610c4f565b013590508a80610598565b601f19831691845f5260205f20925f5b818110610cfa5750908460019594939210610ce1575b505050811b01905561060d565b01355f19600384901b60f8161c19169055898080610cd4565b91936020600181928787013581550195019201610cbe565b601f19831691845f5260205f20925f5b818110610d5e5750908460019594939210610d45575b505050811b0190556105af565b01355f19600384901b60f8161c19169055898080610d38565b91936020600181928787013581550195019201610d22565b634e487b7160e01b5f52601160045260245ffd5b60405162461bcd60e51b815260206004820152602e60248201527f5a79726f6e4174746573746174696f6e3a20496e76616c6964206c656164206160448201526d756469746f72206164647265737360901b6064820152608490fd5b60405162461bcd60e51b815260206004820152603360248201527f5a79726f6e4174746573746174696f6e3a2043616c6c6572206973206e6f742060448201527230baba3437b934bd32b21037b832b930ba37b960691b6064820152608490fd5b50600a546001600160a01b031633146104db565b346101da5760208080610e6d36612d7f565b604051928184925191829101835e8101600f81520301902054604051908152f35b346101da5760803660031901126101da57610ea7612b86565b610eaf612b9c565b90604435606435926001600160401b0384116101da57366023850112156101da57610ee7610ef9943690602481600401359101612d49565b92610ef3838383612e3c565b3361347a565b005b346101da5760203660031901126101da57610f14612b86565b610f2960018060a01b03600a5416331461306b565b6001600160a01b03168015610f7057600b80546001600160a01b031916821790557fb3b3f5f64ab192e4b5fefde1f51ce9733bbdcf831951543b325aebd49cc27ec45f80a2005b60405162461bcd60e51b815260206004820152602260248201527f5a79726f6e4174746573746174696f6e3a20496e76616c6964206f706572617460448201526137b960f11b6064820152608490fd5b346101da5760203660031901126101da57610fd9612b86565b600a546001600160a01b031690610ff133831461306b565b6001600160a01b031690811561103957601280546001600160a01b031916831790557fb4d7bcb4d9a5d6ef6e827e3b1554e5a2578ad9ca843903d42b05d08bfa3458945f80a3005b60405162461bcd60e51b815260206004820152601f60248201527f5a79726f6e4174746573746174696f6e3a20496e76616c69642061646d696e006044820152606490fd5b346101da5760403660031901126101da57611097612b86565b602435908115158092036101da57331561111f576001600160a01b031690811561110c57335f52600560205260405f20825f5260205260405f2060ff1981541660ff83161790556040519081527f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3160203392a3005b50630b61174360e31b5f5260045260245ffd5b63a9fbf51f60e01b5f525f60045260245ffd5b346101da575f3660031901126101da576020601154604051908152f35b346101da575f3660031901126101da576040515f60015461116f81612c19565b80845290600181169081156111f55750600114611197575b6103508361047c81850382612c6d565b60015f9081527fb10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6939250905b8082106111db5750909150810160200161047c611187565b9192600181602092548385880101520191019092916111c3565b60ff191660208086019190915291151560051b8401909101915061047c9050611187565b346101da575f3660031901126101da576112b56112557f00000000000000000000000000000000000000000000000000000000000000006137e1565b61127e7f00000000000000000000000000000000000000000000000000000000000000006138db565b60206112c3604051926112918385612c6d565b5f84525f368137604051958695600f60f81b875260e08588015260e0870190612a2b565b908582036040870152612a2b565b4660608501523060808501525f60a085015283810360c08501528180845192838152019301915f5b8281106112fa57505050500390f35b8351855286955093810193928101926001016112eb565b346101da575f3660031901126101da5761133660018060a01b03600a5416331461306b565b61133e61329a565b600160ff1960075416176007557f62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a2586020604051338152a1005b346101da5760203660031901126101da576004355f52600c60205260405f208054600182016113a590612c8e565b916113b260028201612c8e565b926113bf60038301612c8e565b6004830154600584015460068501549692916113dd60078701612c8e565b6113e960088801612c8e565b91600160a01b6001900360098901541699600160a01b60019003600a8a01541694600160a01b60019003600b8b01541696600c8b015498600d8c01549a600e8d01549c600f01549d6040516080526080515260805160200161022090526080516102200161145691612a2b565b60805181036080516040015261146b91612a2b565b60805181036080516060015261148091612a2b565b926080516080015260805160a0015260805160c00152608051810360805160e001526114ab91612a2b565b608051810360805161010001526114c191612a2b565b9660805161012001526080516101400152608051610160015260805161018001526080516101a001526080516101c0015260ff81166114ff90612a4f565b60ff81166080516101e0015260081c60ff16151560805161020001526080519003608051f35b346101da5760803660031901126101da576001600160401b03600435116101da576101a0600435360360031901126101da5760243560ff811681036101da576064356001600160401b0381116101da57611583903690600401612bec565b61158e92919261329a565b600435600401355f52600c6020526115b360ff600f60405f20015460081c16156130e5565b600260ff831603612056576116a56116ae9161169f608460043501359560426115e161014460043501613157565b60405160208101917f3c1d4c4df113570976f60dded774fa94901ebcb84f707c81f0f0352951ea013c835260043560040135604083015260c4600435013560608301528a608083015260a4600435013560a083015260018060a01b031660c0820152610184600435013560e082015260ff8916610100820152604435610120820152610120815261167461014082612c6d565b51902061167f61360f565b906040519161190160f01b83526002830152602282015220923691612d49565b9061372b565b90929192613765565b6001600160a01b036116c560043561014401613157565b6001600160a01b0390921691168114908115612041575b811561202c575b5015611fd3576116f560ff8216612a4f565b601154905f198214610d765760018201601155600435600401355f52600c60205260405f20926004356004013584556117386024600435016004356004016132b5565b60018601916001600160401b038211610aa457611759826105788554612c19565b5f90601f8311600114611f6f5761178692915f9183611e9c5750508160011b915f199060031b1c19161790565b90555b61179d6044600435016004356004016132b5565b60028601916001600160401b038211610aa4576117be826105788554612c19565b5f90601f8311600114611f0b576117eb92915f9183611e9c5750508160011b915f199060031b1c19161790565b90555b6118026064600435016004356004016132b5565b60038601916001600160401b038211610aa457611823826105788554612c19565b5f90601f8311600114611ea75761185092915f9183611e9c5750508160011b915f199060031b1c19161790565b90555b600484015560a46004350135600584015560c46004350135600684015561188460e4600435016004356004016132b5565b906001600160401b038211610aa4576118ad826118a46007880154612c19565b600788016132e7565b5f90601f8311600114611e2f576118da92915f9183611e245750508160011b915f199060031b1c19161790565b60078401555b61010460043501926118f7846004356004016132b5565b906001600160401b038211610aa457611920826119176008860154612c19565b600886016132e7565b5f90601f8311600114611db75761194d92915f9183611dac5750508160011b915f199060031b1c19161790565b60088201555b600f610124600435019161196683613157565b6009820180546001600160a01b0319166001600160a01b0390921691909117905561199660043561014401613157565b600a820180546001600160a01b0319166001600160a01b039092169190911790556119c660043561016401613157565b600b820180546001600160a01b0319166001600160a01b039092169190911790556004356101840135600c820155604435600d82015560018501600e82015501611a1260ff8416612a4f565b805461ffff191660ff84161761010017905560043560a40135611d8d575b611a4460e4600435016004356004016132b5565b9050611d56575b611a5f6064600435016004356004016132b5565b9050611d1f575b600183015f90815260106020526040902060048035013590556001600160a01b03611a9082613157565b1615611d0a57611a9f90613157565b602093604051611aaf8682612c6d565b5f81526001600160a01b03831615610acb576001600160a01b03611ad6600187018561319f565b16610ab857611aea90600186018433613345565b611af9816004356004016132b5565b9050611bc2575b5060ff611b6b611b1561014460043501613157565b92611b2a60e4600435016004356004016132b5565b9091611b37858816612a4f565b6040519560018060a01b0316865260018060a01b03168886015260018701604086015260c0606086015260c08501916130c5565b9216608082015260443560a082015260a46004350135917f4e9d9c9dcf6d9fc4f7a921e4effbbe27c3ae5ecd0e7f8e7844c64d9e79efc2e960c46004350135928060043560040135930390a4600160405191018152f35b611c08611bd66027926004356004016132b5565b92908360405194859266697066733a2f2f60c81b8b8501528484013781015f838201520301601f198101835282612c6d565b600184015f526006855260405f20908051906001600160401b038211610aa457611c36826105788554612c19565b8690601f8311600114611ca357611c6392915f9183611c985750508160011b915f199060031b1c19161790565b90555b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce784604051600186018152a184611b00565b015190508880610598565b9190835f52875f20905f935b89601f1985168610611cf157506001945083601f19811610611cd9575b505050811b019055611c66565b01515f1960f88460031b161c19169055878080611ccc565b8282015184559485019460019093019290910190611caf565b50611d1a61014460043501613157565b611a9f565b611d336064600435016004356004016132b5565b80604051928337810190600f825260208160043560040135930301902055611a66565b611d6a60e4600435016004356004016132b5565b80604051928337810190600e825260208160043560040135930301902055611a4b565b60a460043501355f52600d6020526004356004013560405f2055611a30565b013590508780610598565b600884939293015f5260205f20905f935b601f1984168510611e0c576001945083601f19811610611df3575b505050811b016008820155611953565b01355f19600384901b60f8161c19169055868080611de3565b81810135835560209485019460019093019201611dc8565b013590508680610598565b600786939293015f5260205f20905f935b601f1984168510611e84576001945083601f19811610611e6b575b505050811b0160078401556118e0565b01355f19600384901b60f8161c19169055858080611e5b565b81810135835560209485019460019093019201611e40565b013590508880610598565b601f19831691845f5260205f20925f5b818110611ef35750908460019594939210611eda575b505050811b019055611853565b01355f19600384901b60f8161c19169055878080611ecd565b91936020600181928787013581550195019201611eb7565b601f19831691845f5260205f20925f5b818110611f575750908460019594939210611f3e575b505050811b0190556117ee565b01355f19600384901b60f8161c19169055878080611f31565b91936020600181928787013581550195019201611f1b565b601f19831691845f5260205f20925f5b818110611fbb5750908460019594939210611fa2575b505050811b019055611789565b01355f19600384901b60f8161c19169055878080611f95565b91936020600181928787013581550195019201611f7f565b60405162461bcd60e51b815260206004820152602b60248201527f5a79726f6e4174746573746174696f6e3a20496e76616c6964204549502d373160448201526a32207369676e617475726560a81b6064820152608490fd5b600a546001600160a01b0316149050836116e3565b600b546001600160a01b0316811491506116dc565b60405162461bcd60e51b815260206004820152602860248201527f5a79726f6e4174746573746174696f6e3a204d7573742062652068756d616e2d604482015267185d1d195cdd195960c21b6064820152608490fd5b346101da5760203660031901126101da576001600160a01b036120cd612b86565b1680156120ea575f526003602052602060405f2054604051908152f35b6322718ad960e21b5f525f60045260245ffd5b346101da5760203660031901126101da57612116612dbd565b506004355f52600d60205260405f2054801515806121be575b15612153575f52600c60205261035060405f2060ff600f6040519261025c84612c51565b60405162461bcd60e51b815260206004820152603860248201527f5a79726f6e4174746573746174696f6e3a204e6f206174746573746174696f6e60448201527f20666f756e6420666f722062797465636f6465206861736800000000000000006064820152608490fd5b50805f52600c60205260ff600f60405f20015460081c1661212f565b346101da5760203660031901126101da5760206121f860043561316b565b6040516001600160a01b039091168152f35b346101da575f3660031901126101da57602060ff600754166040519015158152f35b346101da575f3660031901126101da57600b546040516001600160a01b039091168152602090f35b346101da57610ef961226536612bb2565b9060405192612275602085612c6d565b5f8452610ef3838383612e3c565b346101da575f3660031901126101da576122a860018060a01b03600a5416331461306b565b60075460ff8116156122e75760ff19166007557f5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa6020604051338152a1005b638dfc202b60e01b5f5260045ffd5b346101da5760203660031901126101da576004355f52600d602052602060405f2054604051908152f35b346101da5760203660031901126101da576004356001600160401b0381116101da576123526020913690600401612bec565b919061235c612dbd565b508260405193849283378101600f8152030190205480151580612401575b1561239e575f52600c60205261035060405f2060ff600f6040519261025c84612c51565b60405162461bcd60e51b815260206004820152603560248201527f5a79726f6e4174746573746174696f6e3a204e6f206174746573746174696f6e60448201527408199bdd5b9908199bdc8819da5d0818dbdb5b5a5d605a1b6064820152608490fd5b50805f52600c60205260ff600f60405f20015460081c1661237a565b346101da5760403660031901126101da576004356024356001600160401b0381116101da57612450903690600401612bec565b9061246660018060a01b03600a5416331461306b565b825f52600c60205260ff600f60405f20015460081c161561255457825f52600c602052600360ff600f60405f2001541661249f81612a4f565b14612505575f838152600c602052604090819020600f01805461ffff1916600317905580518181527fe07049fbb48f73515e4e670bf2440d335837db3ee3f78c68e0a2f9f48573f18d93909283926124fa92908401916130c5565b4260208301520390a2005b60405162461bcd60e51b815260206004820152602160248201527f5a79726f6e4174746573746174696f6e3a20416c7265616479207265766f6b656044820152601960fa1b6064820152608490fd5b60405162461bcd60e51b815260206004820152602c60248201527f5a79726f6e4174746573746174696f6e3a204174746573746174696f6e20646f60448201526b195cc81b9bdd08195e1a5cdd60a21b6064820152608490fd5b346101da575f3660031901126101da576012546040516001600160a01b039091168152602090f35b346101da57610ef96125e736612bb2565b91612e3c565b346101da575f3660031901126101da576012546001600160a01b038116903382900361265257600a80546001600160a01b03199081168417909155166012557f54e4612788f90384e6843298d7854436f3a585b2c3831ab66abf1de63bfa6c2d5f80a2005b60405162461bcd60e51b815260206004820152602f60248201527f5a79726f6e4174746573746174696f6e3a204f6e6c792070656e64696e67206160448201526e191b5a5b8818d85b881858d8d95c1d608a1b6064820152608490fd5b346101da5760403660031901126101da576126c8612b86565b6024356126d48161316b565b33151580612786575b80612759575b6127465781906001600160a01b0384811691167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9255f80a45f90815260046020526040902080546001600160a01b0319166001600160a01b03909216919091179055005b63a9fbf51f60e01b5f523360045260245ffd5b506001600160a01b0381165f90815260056020908152604080832033845290915290205460ff16156126e3565b506001600160a01b0381163314156126dd565b346101da5760203660031901126101da576004356127b5612dbd565b50805f52600c60205260ff600f60405f20015460081c16156127f0575f52600c60205261035060405f2060ff600f6040519261025c84612c51565b60405162461bcd60e51b815260206004820152604160248201527f5a79726f6e4174746573746174696f6e3a204e6f20766572696669656420617460448201527f746573746174696f6e20666f756e6420666f72207468697320617564697420496064820152601160fa1b608482015260a490fd5b346101da5760203660031901126101da576004356128828161316b565b505f526004602052602060018060a01b0360405f205416604051908152f35b346101da575f3660031901126101da5760206040517f3c1d4c4df113570976f60dded774fa94901ebcb84f707c81f0f0352951ea013c8152f35b346101da575f3660031901126101da576040515f5f546128fa81612c19565b80845290600181169081156111f55750600114612921576103508361047c81850382612c6d565b5f8080527f290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563939250905b8082106129635750909150810160200161047c611187565b91926001816020925483858801015201910190929161294b565b346101da5760203660031901126101da5760043563ffffffff60e01b81168091036101da57602090632483248360e11b81149081156129c2575b506040519015158152f35b6380ac58cd60e01b8114915081156129f4575b81156129e3575b50826129b7565b6301ffc9a760e01b149050826129dc565b635b5e139f60e01b811491506129d5565b346101da5760203660031901126101da576020906004355f526010825260405f20548152f35b805180835260209291819084018484015e5f828201840152601f01601f1916010190565b6004111561093d57565b6020815281516020820152610220610200612b08612af0612abb612aa5612a8f60208901518760408a0152610240890190612a2b565b6040890151888203601f190160608a0152612a2b565b6060880151878203601f19016080890152612a2b565b608087015160a087015260a087015160c087015260c087015160e087015260e0870151601f1987830301610100880152612a2b565b610100860151858203601f1901610120870152612a2b565b9360018060a01b036101208201511661014085015260018060a01b036101408201511661016085015260018060a01b03610160820151166101808501526101808101516101a08501526101a08101516101c08501526101c08101516101e08501526101e0810151612b7881612a4f565b828501520151151591015290565b600435906001600160a01b03821682036101da57565b602435906001600160a01b03821682036101da57565b60609060031901126101da576004356001600160a01b03811681036101da57906024356001600160a01b03811681036101da579060443590565b9181601f840112156101da578235916001600160401b0383116101da57602083818601950101116101da57565b90600182811c92168015612c47575b6020831014612c3357565b634e487b7160e01b5f52602260045260245ffd5b91607f1691612c28565b61022081019081106001600160401b03821117610aa457604052565b90601f801991011681019081106001600160401b03821117610aa457604052565b9060405191825f825492612ca184612c19565b8084529360018116908115612d0c5750600114612cc8575b50612cc692500383612c6d565b565b90505f9291925260205f20905f915b818310612cf0575050906020612cc6928201015f612cb9565b6020919350806001915483858901015201910190918492612cd7565b905060209250612cc694915060ff191682840152151560051b8201015f612cb9565b6001600160401b038111610aa457601f01601f191660200190565b929192612d5582612d2e565b91612d636040519384612c6d565b8294818452818301116101da578281602093845f960137010152565b60206003198201126101da57600435906001600160401b0382116101da57806023830112156101da57816024612dba93600401359101612d49565b90565b60405190612dca82612c51565b5f6102008382815260606020820152606060408201526060808201528260808201528260a08201528260c0820152606060e0820152606061010082015282610120820152826101408201528261016082015282610180820152826101a0820152826101c0820152826101e08201520152565b6001600160a01b0390911691908215610acb575f828152600260205260409020546001600160a01b0316151580613063575b612fec575f828152600260205260409020546001600160a01b031692829033151580612f57575b5084612f24575b805f52600360205260405f2060018154019055815f52600260205260405f20816bffffffffffffffffffffffff60a01b825416179055847fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a46001600160a01b0316808303612f0c57505050565b6364283d7b60e01b5f5260045260245260445260645ffd5b5f82815260046020526040902080546001600160a01b0319169055845f52600360205260405f205f198154019055612e9c565b90915080612f9b575b15612f6d5782905f612e95565b8284612f8557637e27328960e01b5f5260045260245ffd5b63177e802f60e01b5f523360045260245260445ffd5b503384148015612fca575b80612f6057505f838152600460205260409020546001600160a01b03163314612f60565b505f84815260056020908152604080832033845290915290205460ff16612fa6565b60405162461bcd60e51b815260206004820152604360248201527f5a79726f6e4174746573746174696f6e3a20536f756c626f756e64206174746560448201527f73746174696f6e2062616467652063616e6e6f74206265207472616e736665726064820152621c995960ea1b608482015260a490fd5b506001612e6e565b1561307257565b60405162461bcd60e51b815260206004820152602560248201527f5a79726f6e4174746573746174696f6e3a2043616c6c6572206973206e6f742060448201526430b236b4b760d91b6064820152608490fd5b908060209392818452848401375f828201840152601f01601f1916010190565b156130ec57565b60405162461bcd60e51b815260206004820152603e60248201527f5a79726f6e4174746573746174696f6e3a204174746573746174696f6e20616c60448201527f72656164792065786973747320666f72207468697320617564697420494400006064820152608490fd5b356001600160a01b03811681036101da5790565b5f818152600260205260409020546001600160a01b031690811561318d575090565b637e27328960e01b5f5260045260245ffd5b5f828152600260205260409020549091906001600160a01b0316151580613288575b612fec575f818152600260205260409020546001600160a01b03169182613255575b6001600160a01b03168061323d575b815f52600260205260405f20816bffffffffffffffffffffffff60a01b825416179055827fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef5f80a490565b805f52600360205260405f20600181540190556131f2565b5f82815260046020526040902080546001600160a01b0319169055825f52600360205260405f205f1981540190556131e3565b506001600160a01b03821615156131c1565b60ff600754166132a657565b63d93c066560e01b5f5260045ffd5b903590601e19813603018212156101da57018035906001600160401b0382116101da576020019181360383136101da57565b919091601f83116132f8575b505050565b81831161330457505050565b5f5260205f206020601f830160051c921061333d575b81601f9101920160051c03905f5b828110156132f3575f82820155600101613328565b5f915061331a565b9291813b613354575b50505050565b604051630a85bd0160e11b81526001600160a01b0394851660048201525f6024820152604481019190915260806064820152921691906020908290819061339f906084830190612a2b565b03815f865af15f9181613435575b5061340257503d156133fb573d6133c381612d2e565b906133d16040519283612c6d565b81523d5f602083013e5b805190816133f65782633250574960e11b5f5260045260245ffd5b602001fd5b60606133db565b6001600160e01b03191663757a42ff60e11b0161342357505f80808061334e565b633250574960e11b5f5260045260245ffd5b9091506020813d602011613472575b8161345160209383612c6d565b810103126101da57516001600160e01b0319811681036101da57905f6133ad565b3d9150613444565b823b613488575b5050505050565b604051630a85bd0160e11b81526001600160a01b0391821660048201529181166024830152604482019390935260806064820152911691602090829081906134d4906084830190612a2b565b03815f865af15f918161351a575b506134f857503d156133fb573d6133c381612d2e565b6001600160e01b03191663757a42ff60e11b0161342357505f80808080613481565b9091506020813d602011613557575b8161353660209383612c6d565b810103126101da57516001600160e01b0319811681036101da57905f6134e2565b3d9150613529565b6135688161316b565b506020906040516135798382612c6d565b5f8152815f526006835261358f60405f20612c8e565b81511561360857808491516135cd575050506135aa9061316b565b505f6040516135b98382612c6d565b526135c76040519182612c6d565b5f815290565b612dba935081906040519584879551918291018487015e8401908282015f8152815193849201905e01015f815203601f198101835282612c6d565b9250505090565b307f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03161480613702575b1561366a577f000000000000000000000000000000000000000000000000000000000000000090565b60405160208101907f8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f82527f000000000000000000000000000000000000000000000000000000000000000060408201527f000000000000000000000000000000000000000000000000000000000000000060608201524660808201523060a082015260a081526136fc60c082612c6d565b51902090565b507f00000000000000000000000000000000000000000000000000000000000000004614613641565b815191906041830361375b576137549250602082015190606060408401519301515f1a90613993565b9192909190565b50505f9160029190565b61376e81612a4f565b80613777575050565b61378081612a4f565b600181036137975763f645eedf60e01b5f5260045ffd5b6137a081612a4f565b600281036137bb575063fce698f760e01b5f5260045260245ffd5b6003906137c781612a4f565b146137cf5750565b6335e2f38360e21b5f5260045260245ffd5b60ff81146138275760ff811690601f82116138185760405191613805604084612c6d565b6020808452838101919036833783525290565b632cd44ac360e21b5f5260045ffd5b50604051600854815f61383983612c19565b80835292600181169081156138bc575060011461385d575b612dba92500382612c6d565b5060085f90815290917ff3f7a9fe364faab93b216da50a3214154f22a0a2b415b23a84c8169e8b636ee35b8183106138a0575050906020612dba92820101613851565b6020919350806001915483858801015201910190918392613888565b60209250612dba94915060ff191682840152151560051b820101613851565b60ff81146138ff5760ff811690601f82116138185760405191613805604084612c6d565b50604051600954815f61391183612c19565b80835292600181169081156138bc575060011461393457612dba92500382612c6d565b5060095f90815290917f6e1540171b6c0c960b71a7020d9f60077f6af931a8bbf590da0223dacf75c7af5b818310613977575050906020612dba92820101613851565b602091935080600191548385880101520191019091839261395f565b91907f7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a08411613a15579160209360809260ff5f9560405194855216868401526040830152606082015282805260015afa15613a0a575f516001600160a01b03811615613a0057905f905f90565b505f906001905f90565b6040513d5f823e3d90fd5b5050505f916003919056fea2646970667358221220d931bf54c10b47ace69c411bbe407721af4964cf7e519d14c84e150ae0adf8c464736f6c63430008250033';
