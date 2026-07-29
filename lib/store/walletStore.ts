import { create } from "zustand";
import { connectWallet, checkFreighterInstalled, signChallengeNonce } from "@/lib/stellar/wallet";

interface WalletStore {
  isConnected: boolean;
  publicKey: string | null;
  balance: number;
  isConnecting: boolean;
  hasFreighter: boolean;
  checkWallet: () => Promise<void>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  updateBalance: () => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  isConnected: false,
  publicKey: null,
  balance: 1450.5,
  isConnecting: false,
  hasFreighter: false,

  checkWallet: async () => {
    const installed = await checkFreighterInstalled();
    set({ hasFreighter: installed });

    // Check existing auth session
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.user) {
        set({ isConnected: true, publicKey: data.user.walletAddress });
        get().updateBalance();
      }
    } catch (e) {
      console.warn("Session check error", e);
    }
  },

  connect: async () => {
    set({ isConnecting: true });
    try {
      const key = await connectWallet();
      if (key) {
        // Authenticate with server challenge
        const challengeRes = await fetch("/api/auth/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: key }),
        });
        const { nonce } = await challengeRes.json();

        let signature: string | null = null;
        if (nonce) {
          signature = await signChallengeNonce(key, nonce);
        }

        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: key, nonce, signature }),
        });

        if (verifyRes.ok) {
          set({ isConnected: true, publicKey: key });
          await get().updateBalance();
        }
      }
    } catch (error) {
      console.error("Wallet connection failed", error);
    } finally {
      set({ isConnecting: false });
    }
  },

  disconnect: async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {}
    set({ isConnected: false, publicKey: null, balance: 0 });
  },

  updateBalance: async () => {
    const pubKey = get().publicKey;
    if (!pubKey) return;
    try {
      // Mock or fetch Horizon balance for testnet wallet
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
      if (res.ok) {
        const data = await res.json();
        const nativeBalance = data.balances?.find((b: any) => b.asset_type === "native");
        if (nativeBalance) {
          set({ balance: parseFloat(nativeBalance.balance) });
        }
      }
    } catch (e) {
      // Fallback balance for demo
      set({ balance: 2500.0 });
    }
  },
}));
