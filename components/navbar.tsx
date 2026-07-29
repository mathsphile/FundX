"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/store/walletStore";
import {
  Wallet,
  Rocket,
  Compass,
  LayoutDashboard,
  HeartHandshake,
  Bell,
  LogOut,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, publicKey, balance, connect, disconnect, hasFreighter } = useWalletStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (isConnected) {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => setNotifications(data.notifications || []))
        .catch(() => {});
    }
  }, [isConnected]);

  const navLinks = [
    { name: "Explore", href: "/campaigns", icon: Compass },
    { name: "Create Campaign", href: "/campaigns/create", icon: Rocket },
    { name: "Creator Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Supporter Portal", href: "/supporter", icon: HeartHandshake },
  ];

  const handleConnect = async () => {
    if (!hasFreighter) {
      toast.error("Freighter Wallet not detected", {
        description: "Please install the Freighter Browser Extension to interact with Soroban on Stellar.",
        action: {
          label: "Install Freighter",
          onClick: () => window.open("https://www.freighter.app/", "_blank"),
        },
      });
      return;
    }

    toast.loading("Connecting Freighter Wallet...", { id: "connect-wallet" });
    await connect();
    toast.success("Wallet Connected!", {
      id: "connect-wallet",
      description: `Authenticated on Stellar Testnet as ${publicKey?.substring(0, 6)}...`,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - Just CrowdFundX */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl gradient-bg-stellar p-0.5 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FF5A00]" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center">
            CrowdFund<span className="gradient-text">X</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#FF5A00] text-white shadow-md shadow-[#FF5A00]/25"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Wallet & Actions */}
        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.some((n) => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF5A00] animate-ping"></span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 glass-panel rounded-2xl p-4 shadow-2xl border border-slate-200 z-50 bg-white">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                    <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                    <span className="text-xs text-slate-500">{notifications.length} new</span>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 text-xs text-slate-700 hover:bg-slate-100 transition-colors">
                          <p className="font-semibold text-slate-900">{n.message}</p>
                          <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5A00] to-[#FF8A00] hover:from-[#FF7A00] hover:to-[#FFA000] text-white font-bold text-sm shadow-md shadow-[#FF5A00]/25 transition-all hover:scale-105 active:scale-95"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF5A00] to-[#0284C7] flex items-center justify-center font-bold text-xs text-white">
                  XL
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900">
                    {publicKey?.substring(0, 5)}...{publicKey?.substring(publicKey.length - 4)}
                  </span>
                  <span className="text-[11px] font-bold text-[#0284C7]">
                    {balance.toLocaleString()} XLM
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* User Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-3 w-64 glass-panel rounded-2xl p-3 shadow-2xl border border-slate-200 z-50 bg-white">
                  <div className="px-3 py-2 border-b border-slate-100 mb-2">
                    <p className="text-xs text-slate-400 font-medium">Connected Stellar Account</p>
                    <p className="text-xs font-mono font-bold text-slate-900 break-all">{publicKey}</p>
                    <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Soroban Escrow Active
                    </div>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-[#FF5A00]" />
                    Creator Dashboard
                  </Link>

                  <Link
                    href="/supporter"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <HeartHandshake className="w-4 h-4 text-[#0284C7]" />
                    Supporter Portal & Refunds
                  </Link>

                  <a
                    href={`https://stellar.expert/explorer/testnet/account/${publicKey}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <ExternalLink className="w-4 h-4 text-purple-600" />
                      Stellar Expert Explorer
                    </span>
                  </a>

                  <button
                    onClick={() => {
                      disconnect();
                      setShowDropdown(false);
                      toast.info("Wallet Disconnected");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect Wallet
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
