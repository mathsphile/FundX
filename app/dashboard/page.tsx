"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  Eye,
  Plus,
  Rocket,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useWalletStore } from "@/lib/store/walletStore";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CreatorDashboardPage() {
  const { isConnected, publicKey, connect } = useWalletStore();
  const [selectedCampaignForUpdate, setSelectedCampaignForUpdate] = useState<string | null>(null);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["creator-dashboard", publicKey],
    enabled: !!isConnected,
    queryFn: async () => {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });

  const campaigns = data?.campaigns || [];
  const totalRaised = campaigns.reduce((acc: number, c: any) => acc + c.raisedAmount, 0);
  const totalViews = campaigns.reduce((acc: number, c: any) => acc + c.views, 0);

  const handleWithdraw = async (campaignId: string, title: string, amount: number) => {
    toast.loading(`Executing Soroban contract withdrawal for ${amount} XLM...`, { id: "withdraw" });
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/withdraw`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Withdrawal failed");

      toast.success("Funds Withdrawn Successfully!", {
        id: "withdraw",
        description: `${amount} XLM transferred from Soroban contract escrow to your wallet!`,
      });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to process withdrawal", { id: "withdraw" });
    }
  };

  const handlePostUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignForUpdate || !updateTitle || !updateContent) return;

    try {
      const res = await fetch(`/api/campaigns/${selectedCampaignForUpdate}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: updateTitle, content: updateContent }),
      });
      if (res.ok) {
        toast.success("Campaign update published!");
        setSelectedCampaignForUpdate(null);
        setUpdateTitle("");
        setUpdateContent("");
        refetch();
      }
    } catch (e) {
      toast.error("Failed to publish update");
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[#FF5A00] mx-auto">
          <Wallet className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900">Connect Stellar Wallet</h2>
          <p className="text-xs text-slate-500 font-medium">
            Please connect your wallet to access your creator dashboard and manage Soroban contract withdrawals.
          </p>
        </div>
        <button
          onClick={connect}
          className="px-6 py-3 rounded-xl bg-[#FF5A00] hover:bg-[#FF7A00] text-white font-bold text-xs shadow-md shadow-[#FF5A00]/25"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-[#0284C7]">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Creator Hub
          </div>
          <h1 className="text-3xl font-black text-slate-900">Analytics & Campaign Management</h1>
        </div>

        <Link
          href="/campaigns/create"
          className="px-5 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#FF5A00]/25"
        >
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Link>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total Raised</span>
            <TrendingUp className="w-4 h-4 text-[#FF5A00]" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalRaised.toLocaleString()} <span className="text-xs text-[#FF5A00] font-bold">XLM</span></p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total Backers</span>
            <Users className="w-4 h-4 text-[#0284C7]" />
          </div>
          <p className="text-2xl font-black text-slate-900">1,420</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Total Page Views</span>
            <Eye className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalViews.toLocaleString()}</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-slate-200/80 bg-white shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
            <span>Active Campaigns</span>
            <Rocket className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{campaigns.length}</p>
        </div>
      </div>

      {/* Campaigns Management Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900">Your Campaigns</h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-medium">You have not launched any campaigns yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="pb-3 px-2">Campaign Title</th>
                  <th className="pb-3 px-2">Raised / Goal</th>
                  <th className="pb-3 px-2">Status</th>
                  <th className="pb-3 px-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {campaigns.map((c: any) => {
                  const isFunded = c.raisedAmount >= c.fundingGoal;
                  const isWithdrawn = c.status === "WITHDRAWN";

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-4 px-2 font-bold text-slate-900">{c.title}</td>
                      <td className="py-4 px-2 font-extrabold">
                        <span className="text-[#FF5A00]">{c.raisedAmount.toLocaleString()} XLM</span> / {c.fundingGoal.toLocaleString()} XLM
                      </td>
                      <td className="py-4 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isWithdrawn
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : isFunded
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          {isWithdrawn ? "Funds Withdrawn" : isFunded ? "Goal Met (Successful)" : "Active"}
                        </span>
                      </td>
                      <td className="py-4 px-2 flex items-center gap-2">
                        {isFunded && !isWithdrawn && (
                          <button
                            onClick={() => handleWithdraw(c.id, c.title, c.raisedAmount)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-md shadow-emerald-600/25 flex items-center gap-1 transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Withdraw XLM
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedCampaignForUpdate(c.id)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-[11px] border border-slate-200"
                        >
                          Post Update
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Post Update Modal */}
      {selectedCampaignForUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 max-w-lg w-full border border-slate-200 bg-white space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Post Creator Update</h3>
            <form onSubmit={handlePostUpdate} className="space-y-4">
              <input
                type="text"
                value={updateTitle}
                onChange={(e) => setUpdateTitle(e.target.value)}
                placeholder="Update Title"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
              />
              <textarea
                rows={4}
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                placeholder="Share exciting news or progress with your backers..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCampaignForUpdate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#FF5A00] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#FF5A00]/25"
                >
                  <Send className="w-3.5 h-3.5" />
                  Publish Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
