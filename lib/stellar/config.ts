export const STELLAR_CONFIG = {
  network: process.env.NEXT_PUBLIC_STELLAR_NETWORK || "TESTNET",
  rpcUrl: process.env.NEXT_PUBLIC_STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase: process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015",
  nativeXlmContract: process.env.NEXT_PUBLIC_NATIVE_XLM_CONTRACT || "CDLZFC3SYJYDVR72C5SCNXLI32WVWRK2VXLZ45UKEBRC6EDT3GVSR2HN",
  crowdfundContractId: process.env.NEXT_PUBLIC_CROWDFUND_CONTRACT_ID || "CDEE2K7UAVF2V2K62P7D5XOTSIWKWBN2Z3I4FU3PBSXWGLMNIMMHB4NE",
  horizonUrl: "https://horizon-testnet.stellar.org",
  explorerUrl: "https://stellar.expert/explorer/testnet"
};
