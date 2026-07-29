"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useWalletStore } from "@/lib/store/walletStore";
import { toast } from "sonner";

export default function CreateCampaignPage() {
  const router = useRouter();
  const { isConnected, connect } = useWalletStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    story: "",
    category: "Technology",
    fundingGoal: "10000",
    deadlineDays: "30",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80",
    videoUrl: "",
    website: "",
    github: "",
    twitter: "",
    discord: "",
    milestones: [
      { title: "Alpha Deployment", description: "Deploy prototype to Soroban Testnet", targetAmount: "3000" },
    ],
    rewardTiers: [
      { title: "Early Supporter", description: "Receive official Discord role and early access pass", minAmount: "100" },
    ],
  });

  const categories = ["Technology", "AI", "Web3", "Education", "Gaming", "Open Source"];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading cover image...", { id: "upload" });
    const data = new FormData();
    data.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (result.url) {
        setFormData({ ...formData, coverImage: result.url });
        toast.success("Image uploaded successfully!", { id: "upload" });
      }
    } catch (err) {
      toast.error("Failed to upload image", { id: "upload" });
    }
  };

  const handlePublish = async () => {
    if (!isConnected) {
      toast.error("Please connect your Stellar wallet first");
      await connect();
      return;
    }

    if (!formData.title || !formData.shortDescription || !formData.story || !formData.fundingGoal) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Deploying Soroban smart contract escrow & publishing campaign...", { id: "publish" });

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Campaign creation failed");

      toast.success("Campaign Published Live on Soroban!", {
        id: "publish",
        description: `Your campaign "${data.campaign.title}" is live on Stellar!`,
      });

      router.push(`/campaigns/${data.campaign.slug}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to publish campaign", { id: "publish" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-[#FF5A00]">
          <Rocket className="w-3.5 h-3.5" />
          Campaign Creator Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900">
          Launch a Project on <span className="gradient-text">Stellar Soroban</span>
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Provision an automated Soroban smart contract escrow in minutes. Zero middleman fees.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-200/80 bg-white shadow-sm flex justify-between items-center text-xs font-bold">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${step === s ? "text-[#FF5A00]" : step > s ? "text-emerald-600" : "text-slate-400"}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
              step === s ? "bg-[#FF5A00] text-white" : step > s ? "bg-emerald-500 text-white" : "bg-slate-100 border border-slate-200"
            }`}>
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            <span className="hidden sm:inline">
              {s === 1 ? "Basic Details" : s === 2 ? "Goal & Timing" : s === 3 ? "Story & Media" : "Publish & Preview"}
            </span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/80 bg-white/90 shadow-xl space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Step 1: Campaign Information</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Campaign Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Soroban Pay: Sub-Second Micropayments Protocol"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-semibold text-xs focus:outline-none focus:border-[#FF5A00]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      formData.category === cat
                        ? "bg-[#FF5A00] text-white border-[#FF5A00] shadow-sm"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Short Summary (1-2 sentences) *</label>
              <textarea
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                placeholder="A high-level summary of your project vision and goals..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:border-[#FF5A00]"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Step 2: Funding Target & Timeline</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Funding Goal (XLM) *</label>
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    value={formData.fundingGoal}
                    onChange={(e) => setFormData({ ...formData, fundingGoal: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#FF5A00]"
                  />
                  <span className="absolute right-4 top-3.5 text-xs font-extrabold text-[#FF5A00]">XLM</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Campaign Duration (Days) *</label>
                <input
                  type="number"
                  min="7"
                  max="90"
                  value={formData.deadlineDays}
                  onChange={(e) => setFormData({ ...formData, deadlineDays: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-extrabold text-xs focus:outline-none focus:border-[#FF5A00]"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Automated Soroban Contract Escrow Guarantee</p>
                <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">
                  Your funds will be locked securely inside the Soroban contract escrow until {formData.deadlineDays} days pass. If {formData.fundingGoal} XLM is reached, you can withdraw immediately.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="text-lg font-bold text-slate-900">Step 3: Story & Media Upload</h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Cover Image *</label>
              <div className="flex items-center gap-4">
                <div className="relative w-32 h-20 rounded-xl overflow-hidden glass-panel border border-slate-200 bg-white">
                  <Image src={formData.coverImage} alt="Cover Preview" fill className="object-cover" />
                </div>
                <label className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs cursor-pointer flex items-center gap-2 border border-slate-200">
                  <Upload className="w-4 h-4 text-slate-600" />
                  Upload Image
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Project Story (Markdown) *</label>
              <textarea
                rows={6}
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                placeholder="Explain why you are building this project, why Stellar Soroban is used, and how funds will be spent..."
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-[#FF5A00]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="Website URL"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none"
              />
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="GitHub Repo URL"
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none"
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-900">Step 4: Review & Publish to Soroban</h3>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-medium">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Campaign Title</span>
                <span className="text-sm font-bold text-slate-900">{formData.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Funding Goal</span>
                <span className="text-sm font-black text-[#FF5A00]">{formData.fundingGoal} XLM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Category</span>
                <span className="text-sm font-bold text-[#0284C7]">{formData.category}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500">Duration</span>
                <span className="text-sm font-bold text-slate-900">{formData.deadlineDays} Days</span>
              </div>
            </div>

            <button
              onClick={handlePublish}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5A00] to-[#FF8A00] hover:from-[#FF7A00] text-white font-black text-base shadow-xl shadow-[#FF5A00]/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Publish Campaign & Deploy Soroban Contract
            </button>
          </div>
        )}

        {/* Stepper Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-2 border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>
          ) : (
            <div />
          )}

          {step < 4 && (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-[#FF5A00] hover:bg-[#FF7A00] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-[#FF5A00]/25"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
