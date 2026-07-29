"use client";

import { useState } from "react";
import { Search, Compass, SlidersHorizontal } from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { useQuery } from "@tanstack/react-query";

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  const categories = ["All", "Technology", "AI", "Web3", "Education", "Gaming", "Open Source"];

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", selectedCategory, searchQuery, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);
      if (sortBy) params.append("sort", sortBy);

      const res = await fetch(`/api/campaigns?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return res.json();
    },
  });

  const campaigns = data?.campaigns || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-extrabold text-[#FF5A00]">
          <Compass className="w-3.5 h-3.5" />
          Decentralized Marketplace
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900">
          Explore Stellar <span className="gradient-text">Soroban Campaigns</span>
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl font-normal">
          Discover and back verified Web3 projects, AI initiatives, and open-source software built on Stellar.
        </p>
      </div>

      {/* Toolbar: Search, Filters & Sorting */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 bg-white/90 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, story, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-[#FF5A00] transition-colors"
            />
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold focus:outline-none focus:border-[#FF5A00]"
            >
              <option value="featured" className="bg-white">Featured</option>
              <option value="trending" className="bg-white">Trending</option>
              <option value="newest" className="bg-white">Newest</option>
              <option value="ending_soon" className="bg-white">Ending Soon</option>
              <option value="highest_funded" className="bg-white">Highest Funded</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/25"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200 border border-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="glass-panel rounded-2xl h-96 animate-pulse p-4 space-y-4 bg-white">
              <div className="w-full h-48 bg-slate-100 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto my-12 bg-white">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No campaigns found</h3>
          <p className="text-xs text-slate-500 font-medium">
            No projects match your selected filter criteria. Try adjusting your search query or category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campaigns.map((c: any) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
}
