import Link from "next/link";
import Image from "next/image";
import {
  Rocket,
  Compass,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Users,
  CheckCircle2,
  HelpCircle,
  Coins,
  Code2,
  Layers,
} from "lucide-react";
import { CampaignCard } from "@/components/campaign-card";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Refresh every minute

export default async function HomePage() {
  // Fetch featured campaigns from database
  let featuredCampaigns: any[] = [];
  let stats = {
    totalRaised: 74450,
    activeCampaigns: 4,
    totalBackers: 1420,
    successRate: 98,
  };

  try {
    featuredCampaigns = await prisma.campaign.findMany({
      take: 3,
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      include: {
        creator: { select: { name: true, avatar: true } },
        _count: { select: { donations: true } },
      },
    });

    const totalRaisedAgg = await prisma.campaign.aggregate({
      _sum: { raisedAmount: true },
    });
    if (totalRaisedAgg._sum.raisedAmount) {
      stats.totalRaised = Math.round(totalRaisedAgg._sum.raisedAmount);
    }
  } catch (e) {
    console.warn("Using fallback initial data");
  }

  const steps = [
    {
      step: "01",
      title: "Create Campaign",
      desc: "Set your funding target in XLM, deadline, milestones, and upload your project story.",
      icon: Rocket,
      color: "from-orange-500 to-amber-500",
    },
    {
      step: "02",
      title: "Deploy Soroban Escrow",
      desc: "Our engine automatically provisions an audited Soroban smart contract on Stellar.",
      icon: Code2,
      color: "from-[#FF5A00] to-purple-600",
    },
    {
      step: "03",
      title: "Receive XLM Donations",
      desc: "Supporters back your project directly from Freighter or any Stellar wallet with sub-second finality.",
      icon: Coins,
      color: "from-purple-600 to-[#0284C7]",
    },
    {
      step: "04",
      title: "Reach Goal or Refund",
      desc: "If goal is met, creator withdraws funds. If goal fails, contract refunds 100% to supporters automatically.",
      icon: RefreshCw,
      color: "from-[#0284C7] to-emerald-500",
    },
  ];

  const categories = [
    { name: "Web3 & Soroban", count: "12 Projects", icon: Layers, href: "/campaigns?category=Web3" },
    { name: "Artificial Intelligence", count: "18 Projects", icon: Zap, href: "/campaigns?category=AI" },
    { name: "Technology", count: "24 Projects", icon: Code2, href: "/campaigns?category=Technology" },
    { name: "Education & Literacy", count: "9 Projects", icon: Award, href: "/campaigns?category=Education" },
    { name: "Gaming & Metaverse", count: "15 Projects", icon: Rocket, href: "/campaigns?category=Gaming" },
    { name: "Open Source", count: "21 Projects", icon: ShieldCheck, href: "/campaigns?category=Open+Source" },
  ];

  const faqs = [
    {
      q: "How does CrowdFundX secure my donated XLM?",
      a: "Every campaign deployed on CrowdFundX is governed by a Soroban smart contract on the Stellar network. Funds are locked strictly inside the contract escrow until either the funding goal is met or the deadline expires.",
    },
    {
      q: "What happens if a campaign fails to reach its funding goal?",
      a: "If a campaign does not meet its target before the deadline, all supporters can execute a 100% claim refund call directly against the Soroban contract. No platform middleman intervention is required.",
    },
    {
      q: "Which Stellar wallets are supported?",
      a: "CrowdFundX natively supports Freighter Wallet, Stellar Wallet Kit, and any wallet compatible with Stellar network keypair signing.",
    },
    {
      q: "What are the platform fees?",
      a: "CrowdFundX charges 0% middleman fees. You only pay standard Stellar network gas fees (0.00001 XLM per transaction).",
    },
  ];

  return (
    <div className="space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glowing Ambient Spheres */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF5A00]/15 via-[#0284C7]/15 to-[#3E1B96]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Headline */}
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900">
                Launch. Fund. Build. <br />
                <span className="gradient-text">Powered by Stellar.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl font-normal leading-relaxed">
                The zero-middleman decentralized crowdfunding platform where creator campaigns are backed by audited Soroban smart contracts. Funds remain 100% secure until success or automated refund.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-2">
                <Link
                  href="/campaigns"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5A00] to-[#FF8A00] hover:from-[#FF7A00] text-white font-black text-base shadow-xl shadow-[#FF5A00]/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Compass className="w-5 h-5" />
                  Explore Campaigns
                </Link>
                <Link
                  href="/campaigns/create"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl glass-panel hover:bg-slate-100 text-slate-900 font-bold text-base border border-slate-200 shadow-sm transition-all hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5 text-[#FF5A00]" />
                  Launch Project
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-semibold">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  No Middleman Fees
                </div>
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  Sub-Second XLM Finality
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-[#0284C7]" />
                  Soroban Escrow Secured
                </div>
              </div>
            </div>

            {/* Right Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="glass-panel rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF5A00]/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF5A00]/15 text-[#FF5A00] border border-[#FF5A00]/25">
                    🔥 Featured Campaign
                  </span>
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Escrow
                  </span>
                </div>

                <div className="relative h-56 rounded-2xl overflow-hidden mb-4 shadow-sm">
                  <Image
                    src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80"
                    alt="Hero Preview"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-extrabold text-base">Soroban Pay: Next-Gen Micropayments Protocol</h3>
                    <p className="text-xs text-slate-300 font-medium">By Aria Vance • Web3 Category</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-slate-900">
                    <span>18,450 XLM Raised</span>
                    <span className="text-[#0284C7] font-black">74%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#FF5A00] to-[#0284C7] w-[74%]" />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Goal: 25,000 XLM</span>
                    <span>120 Backers • 15 Days Left</span>
                  </div>
                </div>

                <Link
                  href="/campaigns/soroban-pay-protocol"
                  className="mt-5 w-full py-3 rounded-xl bg-slate-100 hover:bg-[#FF5A00] text-slate-900 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  View Live Campaign
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Ticker */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 border border-slate-200/80 bg-white/90 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <div className="text-center pt-4 md:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-slate-900 gradient-text">
              {stats.totalRaised.toLocaleString()} <span className="text-sm font-bold text-[#FF5A00]">XLM</span>
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Total Raised</p>
          </div>

          <div className="text-center pt-4 md:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-slate-900">
              {stats.activeCampaigns}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Active Campaigns</p>
          </div>

          <div className="text-center pt-4 md:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-[#0284C7]">
              {stats.totalBackers.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Total Backers</p>
          </div>

          <div className="text-center pt-4 md:pt-0">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600">
              {stats.successRate}%
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">Escrow Success Rate</p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold tracking-wider uppercase text-[#FF5A00]">Curated Projects</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Featured Soroban Campaigns</h2>
          </div>
          <Link
            href="/campaigns"
            className="flex items-center gap-2 text-xs font-bold text-[#0284C7] hover:text-slate-900 transition-colors"
          >
            View All Marketplace Campaigns
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </section>

      {/* How CrowdFundX Works Stepper */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#0284C7]">Simple & Transparent</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">How CrowdFundX Works</h2>
          <p className="text-sm text-slate-600 font-normal">
            From smart contract creation to automated refunds, every step is executed on-chain without any central authority.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="glass-panel rounded-3xl p-6 border border-slate-200/80 bg-white/90 shadow-sm relative space-y-4 hover:border-[#FF5A00]/40 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-black text-slate-300 group-hover:text-[#FF5A00] transition-colors">
                    {s.step}
                  </span>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} p-0.5 shadow-md`}>
                    <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                      <Icon className="w-6 h-6 text-slate-900" />
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why Stellar & Soroban Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-200/80 bg-white/90 shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-700">Next-Gen Architecture</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Why CrowdFundX is Built on Stellar
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                Traditional crowdfunding platforms charge 5-10% in platform fees, hold your funds for weeks, and subject creators to arbitrary account freezes.
              </p>
              <p className="text-sm text-slate-600 leading-relaxed font-normal">
                CrowdFundX leverages Soroban smart contracts to make crowdfunding fast, decentralized, and trustless.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Zap className="w-5 h-5 text-amber-600" />
                  Sub-Second Settlement
                </div>
                <p className="text-xs text-slate-500">Transactions finalize on Stellar in ~1 second with absolute deterministic guarantee.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Coins className="w-5 h-5 text-[#FF5A00]" />
                  Fractional Gas Fees
                </div>
                <p className="text-xs text-slate-500">Average transaction fee is less than 0.00001 XLM ($0.000001 USD).</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <RefreshCw className="w-5 h-5 text-[#0284C7]" />
                  Automated Refunds
                </div>
                <p className="text-xs text-slate-500">Contract automatically unlocks 100% refunds for backers if funding target fails.</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Audited Rust Contracts
                </div>
                <p className="text-xs text-slate-500">Soroban SDK memory safety eliminates common smart contract reentrancy bugs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#FF5A00]">Diverse Ecosystem</span>
          <h2 className="text-3xl font-black text-slate-900">Browse by Category</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.name}
                href={c.href}
                className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-200/80 bg-white/90 flex flex-col items-center text-center space-y-3 group shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#FF5A00] group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#FF5A00] transition-colors">{c.name}</h4>
                  <span className="text-[11px] text-slate-500 font-medium">{c.count}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#0284C7]">Got Questions?</span>
          <h2 className="text-3xl font-black text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-2xl p-6 border border-slate-200/80 bg-white/90 space-y-2 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#FF5A00]" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed pl-6 font-normal">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-10 sm:p-16 border border-slate-200/80 bg-white/90 relative overflow-hidden text-center space-y-6 shadow-xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-[#FF5A00]/15 to-[#0284C7]/15 blur-3xl rounded-full pointer-events-none"></div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 max-w-2xl mx-auto leading-tight">
            Ready to Launch Your Next Big Idea on Stellar?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-normal">
            Join hundreds of creators and supporters building the future of decentralized crowdfunding with Soroban.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/campaigns/create"
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5A00] to-[#FF8A00] text-white font-black text-base shadow-xl shadow-[#FF5A00]/25 transition-all hover:scale-105 flex items-center gap-2"
            >
              <Rocket className="w-5 h-5" />
              Create Campaign Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
