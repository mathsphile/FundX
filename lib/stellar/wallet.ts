import {
  isConnected,
  requestAccess,
  getAddress,
  signMessage,
  signTransaction,
} from "@stellar/freighter-api";
import { STELLAR_CONFIG } from "./config";

export interface WalletState {
  isConnected: boolean;
  publicKey: string | null;
  network: string;
}

export async function checkFreighterInstalled(): Promise<boolean> {
  try {
    const conn = await isConnected();
    return !!conn;
  } catch (e) {
    return false;
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    const key = await requestAccess();
    if (typeof key === "string" && key) return key;
    if (key && typeof (key as any).address === "string") return (key as any).address;
    
    const addr = await getAddress();
    if (typeof addr === "string") return addr;
    return addr?.address || null;
  } catch (error) {
    console.error("Wallet connection error:", error);
    return null;
  }
}

export async function signChallengeNonce(publicKey: string, nonce: string): Promise<string | null> {
  try {
    const messageToSign = `CrowdFundX Authentication Nonce: ${nonce}`;
    const signed = await signMessage(messageToSign);
    if (typeof signed === "string") return signed;
    return (signed as any)?.signature || null;
  } catch (error) {
    console.error("Signature signing error:", error);
    return null;
  }
}

export async function signTransactionXdr(xdr: string, publicKey: string): Promise<string | null> {
  try {
    const signed = await signTransaction(xdr, {
      networkPassphrase: STELLAR_CONFIG.networkPassphrase,
    });
    if (typeof signed === "string") return signed;
    return (signed as any)?.signedTxXdr || null;
  } catch (error) {
    console.error("Transaction signing error:", error);
    return null;
  }
}
