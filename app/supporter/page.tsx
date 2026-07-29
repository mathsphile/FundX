"use client";

import Link from "next/link";
import {
  HeartHandshake,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useWalletStore } from "@/lib/store/walletStore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function SupporterPortalPage() {
  const { isConnected, publicKey, connect } = useWalletStore();

  const { data, refetch } = useQuery({
    queryKey: ["supporter-portal", publicKey],
    enabled: !!isConnected,
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed to fetch supporter data");
      return res.json();
    },
  });

  const campaigns = data?.campaigns || [];
  const failedCampaigns = campaigns.filter((c: any) => c.status === "FAILED");

  const handleClaimRefund = async (campaignId: string, campaignTitle: string) => {
    toast.loading(`Executing Soroban contract refund claim for "${campaignTitle}"...`, { id: "refund" });
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/refund`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Refund failed");

      toast.success("Refund Claimed Successfully!", {
        id: "refund",
        description: result.message || "XLMs refunded directly to your Stellar wallet!",
      });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to claim refund", { id: "refund" });
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mx-auto">
          <HeartHandshake className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Connect Stellar Wallet</h2>
          <p className="text-xs text-slate-500 font-medium">
            Connect your wallet to view your donation history and claim 100% Soroban smart contract refunds.
          </p>
        </div>
        <button
          onClick={connect}
          className="px-6 py-3 rounded-xl bg-[#0284C7] text-white font-bold text-xs shadow-md shadow-[#0284C7]/25"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
          Supporter Portal & Refunds
        </div>
        <h1 className="text-3xl font-black text-slate-900">Donation History & Refund Escrows</h1>
        <p className="text-xs text-slate-500 font-medium">
          View all past contributions and execute zero-middleman refund claims for campaigns that did not reach their funding goal.
        </p>
      </div>

      {/* Soroban Refund Center (Highlighted Feature) */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white/90 shadow-xl relative overflow-hidden space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Soroban Refund Center</h3>
              <p className="text-xs text-slate-500 font-medium">Campaigns eligible for 100% automated refund</p>
            </div>
          </div>
        </div>

        {failedCampaigns.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 font-medium space-y-1">
            <p className="font-bold text-slate-900">No Active Refunds Required</p>
            <p>All your backed campaigns are either active or successfully funded!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {failedCampaigns.map((fc: any) => (
              <div key={fc.id} className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{fc.title}</h4>
                  <p className="text-xs text-amber-800 font-medium">
                    Expired on {new Date(fc.deadline).toLocaleDateString()} • Raised {fc.raisedAmount} / {fc.fundingGoal} XLM
                  </p>
                </div>

                <button
                  onClick={() => handleClaimRefund(fc.id, fc.title)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Claim 100% Soroban Refund
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Your XLM Contribution History</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 text-slate-500 uppercase font-bold">
              <tr>
                <th className="pb-3 px-2">Campaign</th>
                <th className="pb-3 px-2">Donated Amount</th>
                <th className="pb-3 px-2">Date</th>
                <th className="pb-3 px-2">Stellar Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {campaigns.slice(0, 3).map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-4 px-2 font-bold text-slate-900">
                    <Link href={`/campaigns/${c.slug}`} className="hover:text-[#FF5A00] transition-colors">
                      {c.title}
                    </Link>
                  </td>
                  <td className="py-4 px-2 font-black text-[#FF5A00]">150 XLM</td>
                  <td className="py-4 px-2 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="py-4 px-2">
                    <a
                      href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0284C7] hover:underline inline-flex items-center gap-1 font-bold"
                    >
                      View on Stellar Expert
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
