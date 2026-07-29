import Link from "next/link";
import { Sparkles, Github, Twitter, Disc as Discord, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-slate-200/80 bg-white/80 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg-stellar p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#FF5A00]" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-slate-900">
                CrowdFund<span className="gradient-text">X</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Launch. Fund. Build. Production-grade decentralized crowdfunding platform secured by Soroban smart contract escrows on Stellar.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 w-fit font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Soroban Escrow Secured
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Marketplace</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><Link href="/campaigns?category=Technology" className="hover:text-[#FF5A00] transition-colors">Technology & Hardware</Link></li>
              <li><Link href="/campaigns?category=AI" className="hover:text-[#FF5A00] transition-colors">Artificial Intelligence</Link></li>
              <li><Link href="/campaigns?category=Web3" className="hover:text-[#FF5A00] transition-colors">Web3 & Soroban DApps</Link></li>
              <li><Link href="/campaigns?category=Education" className="hover:text-[#FF5A00] transition-colors">Education & Literacy</Link></li>
              <li><Link href="/campaigns?category=Gaming" className="hover:text-[#FF5A00] transition-colors">Gaming & Metaverse</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li><Link href="/campaigns/create" className="hover:text-[#FF5A00] transition-colors">Launch a Campaign</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#FF5A00] transition-colors">Creator Dashboard</Link></li>
              <li><Link href="/supporter" className="hover:text-[#FF5A00] transition-colors">Supporter Refund Portal</Link></li>
              <li><a href="https://developers.stellar.org/" target="_blank" rel="noreferrer" className="hover:text-[#FF5A00] transition-colors">Stellar Developer Docs</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-3">Connect</h4>
            <p className="text-xs text-slate-500 mb-4">Join our global Stellar ecosystem creator community.</p>
            <div className="flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors">
                <Discord className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4 font-medium">
          <p>© 2026 CrowdFundX. Powered by Stellar & Soroban. Built for Rise In Orange Belt Level 3.</p>
          <div className="flex items-center gap-1">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for the Stellar Ecosystem</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
