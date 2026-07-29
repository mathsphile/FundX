import {
  rpc,
  Address,
  nativeToScVal,
  xdr,
  TransactionBuilder,
  BASE_FEE,
  Contract,
} from "@stellar/stellar-sdk";
import { STELLAR_CONFIG } from "./config";

const server = new rpc.Server(STELLAR_CONFIG.rpcUrl);

/**
 * Convert XLM float to Stroops (1 XLM = 10,000,000 Stroops)
 */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

/**
 * Convert Stroops to XLM
 */
export function stroopsToXlm(stroops: bigint | number | string): number {
  return Number(stroops) / 10_000_000;
}

/**
 * Get current Soroban network fee status & ledger info
 */
export async function getNetworkState() {
  try {
    const health = await server.getHealth();
    const latestLedger = await server.getLatestLedger();
    return { status: health.status, sequence: latestLedger.sequence };
  } catch (error) {
    console.error("Soroban RPC Error:", error);
    return { status: "OFFLINE", sequence: 0 };
  }
}

/**
 * Prepare a contract call transaction XDR to be signed by Freighter or Wallet Kit
 */
export async function buildContractCallXdr({
  publicKey,
  method,
  args = [],
}: {
  publicKey: string;
  method: string;
  args?: any[];
}) {
  const account = await server.getAccount(publicKey);
  const contract = new Contract(STELLAR_CONFIG.crowdfundContractId);

  const scArgs = args.map((arg) => {
    // If already a constructed ScVal union, pass directly
    if (arg && typeof arg === "object" && ("_switch" in arg || "i128" in arg || "u64" in arg)) {
      return arg as xdr.ScVal;
    }
    if (typeof arg === "string" && arg.startsWith("G")) {
      return new Address(arg).toScVal();
    }
    if (typeof arg === "bigint") {
      return nativeToScVal(arg, { type: "i128" });
    }
    return nativeToScVal(arg);
  });

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_CONFIG.networkPassphrase,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(60)
    .build();

  // Simulate transaction to estimate resource fees
  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    console.warn("Simulation warning:", simulated.error);
  }

  const preparedTx = rpc.assembleTransaction(tx, simulated).build();
  return preparedTx.toXDR();
}

/**
 * Submit signed transaction XDR to Stellar network
 */
export async function submitSignedTransaction(signedTxXdr: string) {
  const tx = TransactionBuilder.fromXDR(
    signedTxXdr,
    STELLAR_CONFIG.networkPassphrase
  );
  const response = await server.sendTransaction(tx);

  if (response.status === "ERROR") {
    throw new Error(`Transaction failed: ${JSON.stringify(response.errorResult)}`);
  }

  // Poll for completion
  let status: string = response.status;
  let attempts = 0;
  while (status === "PENDING" && attempts < 10) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const txResult = await server.getTransaction(response.hash);
    status = txResult.status as string;
    if (status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return { hash: response.hash, status: "SUCCESS" };
    }
    attempts++;
  }

  return { hash: response.hash, status };
}
