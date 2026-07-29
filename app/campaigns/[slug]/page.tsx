"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Clock,
  ShieldCheck,
  Share2,
  Bookmark,
  Globe,
  Github,
  CheckCircle2,
  Heart,
  Send,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DonateModal } from "@/components/donate-modal";
import { useWalletStore } from "@/lib/store/walletStore";
import { toast } from "sonner";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [activeTab, setActiveTab] = useState<"story" | "milestones" | "updates" | "comments" | "rewards">("story");
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const { isConnected } = useWalletStore();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["campaign-detail", slug],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${slug}`);
      if (!res.ok) throw new Error("Campaign not found");
      return res.json();
    },
  });

  const campaign = data?.campaign;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#FF5A00] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading campaign on-chain state...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Campaign Not Found</h2>
        <p className="text-xs text-slate-500 font-medium">The requested campaign does not exist or has been removed.</p>
        <Link href="/campaigns" className="inline-block px-4 py-2 rounded-xl bg-[#FF5A00] text-white text-xs font-bold">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((campaign.raisedAmount / campaign.fundingGoal) * 100));
  const deadlineDate = new Date(campaign.deadline);
  const diffDays = Math.max(0, Math.ceil((deadlineDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const galleryImages: string[] = campaign.gallery ? JSON.parse(campaign.gallery) : [];

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isConnected) {
      toast.error("Please connect your Stellar wallet to comment");
      return;
    }

    try {
      const res = await fetch(`/api/campaigns/${campaign.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment("");
        toast.success("Comment posted!");
        refetch();
      }
    } catch (e) {
      toast.error("Failed to post comment");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Campaign link copied to clipboard!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-[#FF5A00] border border-amber-200">
            {campaign.category}
          </span>
          <div className="flex items-center gap-1 text-xs text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Soroban Smart Contract Escrow
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">{campaign.title}</h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed font-normal">{campaign.shortDescription}</p>
      </div>

      {/* Hero Media + Funding Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Image Media */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative w-full h-[400px] rounded-3xl overflow-hidden glass-panel border border-slate-200/80 bg-white shadow-md">
            <Image src={campaign.coverImage} alt={campaign.title} fill className="object-cover" priority />
          </div>

          {/* Gallery Thumbnails */}
          {galleryImages.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <div key={idx} className="relative h-20 rounded-xl overflow-hidden glass-panel border border-slate-200/80 bg-white">
                  <Image src={img} alt={`Gallery ${idx}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Funding Card */}
        <div className="lg:col-span-5">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white/95 shadow-xl space-y-6">
            {/* Creator Profile */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden relative bg-purple-100 border border-purple-200">
                  {campaign.creator?.avatar ? (
                    <Image src={campaign.creator.avatar} alt="Creator" fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-900">
                      {campaign.creator?.name?.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1">
                    {campaign.creator?.name}
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Verified Stellar Creator</p>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {campaign.website && (
                  <a href={campaign.website} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900">
                    <Globe className="w-4 h-4" />
                  </a>
                )}
                {campaign.github && (
                  <a href={campaign.github} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900">
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Raised Amounts */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-3xl font-black text-slate-900">
                  {campaign.raisedAmount.toLocaleString()} <span className="text-base text-[#FF5A00] font-extrabold">XLM</span>
                </span>
                <span className="text-xs font-bold text-[#0284C7] bg-sky-50 px-2.5 py-1 rounded-md border border-sky-200">
                  {progressPercent}% Funded
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF5A00] to-[#0284C7] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 pt-1 font-medium">Target Goal: {campaign.fundingGoal.toLocaleString()} XLM</p>
            </div>

            {/* Backer & Days Stats */}
            <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100">
              <div className="space-y-0.5">
                <span className="text-xl font-bold text-slate-900 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#0284C7]" />
                  {campaign._count?.donations || Math.floor(campaign.raisedAmount / 150)}
                </span>
                <span className="text-xs text-slate-500 font-medium">Total Backers</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xl font-bold text-amber-600 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {diffDays > 0 ? `${diffDays} Days` : "Expired"}
                </span>
                <span className="text-xs text-slate-500 font-medium">Remaining Time</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => setIsDonateOpen(true)}
                disabled={diffDays <= 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5A00] to-[#FF8A00] hover:from-[#FF7A00] text-white font-black text-base shadow-xl shadow-[#FF5A00]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Heart className="w-5 h-5 fill-current text-white" />
                {diffDays > 0 ? "Back this Campaign with XLM" : "Campaign Ended"}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={copyShareLink}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  Share Project
                </button>
                <button
                  onClick={() => toast.success("Campaign bookmarked")}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Bookmark className="w-4 h-4 text-slate-600" />
                  Save Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-8">
          {(["story", "milestones", "updates", "comments", "rewards"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-extrabold capitalize transition-colors relative ${
                activeTab === tab ? "text-[#FF5A00]" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab === "rewards" ? "Reward Tiers" : tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5A00] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Contents */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-200/80 bg-white/90 shadow-sm">
        {activeTab === "story" && (
          <div className="prose max-w-none space-y-4 text-slate-700 text-sm leading-relaxed whitespace-pre-line font-normal">
            {campaign.story}
          </div>
        )}

        {activeTab === "milestones" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Project Roadmap & Funding Milestones</h3>
            {campaign.milestones?.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No milestones published yet.</p>
            ) : (
              campaign.milestones?.map((m: any, idx: number) => (
                <div key={m.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    m.completed ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {m.completed ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                      <span className="text-xs font-bold text-[#FF5A00]">{m.targetAmount} XLM</span>
                    </div>
                    <p className="text-xs text-slate-600">{m.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "updates" && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Creator Updates</h3>
            {campaign.updates?.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No updates posted yet.</p>
            ) : (
              campaign.updates?.map((u: any) => (
                <div key={u.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="font-bold text-slate-900">{u.title}</span>
                    <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">{u.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "comments" && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Community Discussion</h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a message to support the creator..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-[#FF5A00]"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#FF5A00] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-[#FF5A00]/25"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {campaign.comments?.map((c: any) => (
                <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{c.user?.name || "Stellar Supporter"}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-normal">{c.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "rewards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaign.rewardTiers?.map((r: any) => (
              <div key={r.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-bold text-slate-900">{r.title}</h4>
                  <span className="text-sm font-black text-[#FF5A00]">{r.minAmount} XLM+</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{r.description}</p>
                <button
                  onClick={() => setIsDonateOpen(true)}
                  className="w-full py-2 rounded-xl bg-white hover:bg-[#FF5A00] text-slate-900 hover:text-white font-bold text-xs border border-slate-200 transition-colors shadow-sm"
                >
                  Select Tier ({r.minAmount} XLM)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donate Modal Component */}
      <DonateModal
        campaign={campaign}
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
