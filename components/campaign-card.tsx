"use client";

import Link from "next/link";
import Image from "next/image";
import { Users, Clock, Bookmark, Sparkles, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useWalletStore } from "@/lib/store/walletStore";

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string;
    category: string;
    fundingGoal: number;
    raisedAmount: number;
    deadline: string | Date;
    coverImage: string;
    featured?: boolean;
    verified?: boolean;
    creator?: {
      name?: string | null;
      avatar?: string | null;
    };
    _count?: {
      donations?: number;
    };
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { isConnected } = useWalletStore();

  const progressPercent = Math.min(
    100,
    Math.round((campaign.raisedAmount / campaign.fundingGoal) * 100)
  );

  const deadlineDate = new Date(campaign.deadline);
  const now = new Date();
  const diffDays = Math.max(
    0,
    Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  );

  const toggleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isConnected) {
      toast.error("Please connect wallet to bookmark campaigns");
      return;
    }

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaign.id }),
      });
      const data = await res.json();
      setIsBookmarked(data.bookmarked);
      toast.success(data.bookmarked ? "Saved to Bookmarks" : "Removed from Bookmarks");
    } catch (err) {
      toast.error("Failed to update bookmark");
    }
  };

  return (
    <Link
      href={`/campaigns/${campaign.slug}`}
      className="group glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full border border-slate-200/80 bg-white/90 relative shadow-sm"
    >
      {/* Cover Image Container */}
      <div className="relative w-full h-48 overflow-hidden bg-slate-100">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-900/80 backdrop-blur-md text-white border border-white/20">
            {campaign.category}
          </span>
          {campaign.featured && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FF5A00] text-white flex items-center gap-1 shadow-md shadow-[#FF5A00]/40">
              <Sparkles className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={toggleBookmark}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all ${
            isBookmarked
              ? "bg-[#FF5A00] text-white"
              : "bg-black/40 text-white hover:bg-black/60"
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Creator Badge */}
          {campaign.creator && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden relative bg-purple-100 border border-purple-200">
                {campaign.creator.avatar ? (
                  <Image src={campaign.creator.avatar} alt="Creator" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-800">
                    {campaign.creator.name?.charAt(0)}
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                {campaign.creator.name || "Stellar Creator"}
                {campaign.verified && <CheckCircle className="w-3.5 h-3.5 text-[#0284C7]" />}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#FF5A00] transition-colors line-clamp-2 leading-snug">
            {campaign.title}
          </h3>

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
            {campaign.shortDescription}
          </p>
        </div>

        {/* Progress Bar & Stats */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-900 text-sm">
                {campaign.raisedAmount.toLocaleString()} <span className="text-[#FF5A00] text-xs font-extrabold">XLM</span>
              </span>
              <span className="text-xs font-bold text-[#0284C7] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                {progressPercent}%
              </span>
            </div>

            {/* Custom Progress Track */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FF5A00] to-[#0284C7] transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-0.5">
              <span>Goal: {campaign.fundingGoal.toLocaleString()} XLM</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>{campaign._count?.donations || Math.floor(campaign.raisedAmount / 150)} Backers</span>
            </div>

            <div className="flex items-center gap-1.5 text-amber-600 font-bold">
              <Clock className="w-3.5 h-3.5" />
              <span>{diffDays > 0 ? `${diffDays} days left` : "Ended"}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
