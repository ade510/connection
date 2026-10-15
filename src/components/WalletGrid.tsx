"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Wallet {
    id: string;
    name: string;
    icon: string; // valid url or local path
    aliases?: string[];
}

// Mock Data - In a real app this might come from an API or config
const wallets: Wallet[] = [
    { id: "metamask", name: "MetaMask", icon: "https://github.com/MetaMask.png" },
    { id: "trustwallet", name: "Trust Wallet", icon: "https://github.com/trustwallet.png" },
    { id: "walletconnect", name: "WalletConnect", icon: "https://github.com/WalletConnect.png" },
    { id: "coinbase", name: "Coinbase Wallet", icon: "https://github.com/coinbase.png" },
    { id: "phantom", name: "Phantom", icon: "https://github.com/phantom.png" },
    {
        id: "crypto-onchain",
        name: "Crypto.com Onchain",
        icon: "https://github.com/crypto-com.png",
        aliases: ["Crypto Onchain", "Crypto.com", "DeFi Wallet", "Cronos"]
    },
    { id: "ledger", name: "Ledger", icon: "https://github.com/LedgerHQ.png" },
    { id: "trezor", name: "Trezor", icon: "https://github.com/trezor.png" },
    { id: "dash", name: "Dash", icon: "https://github.com/dashpay.png" },
    { id: "brave", name: "Brave Wallet", icon: "https://github.com/brave.png" },
    { id: "safepal", name: "SafePal", icon: "https://github.com/SafePalWallet.png" },
    { id: "rainbow", name: "Rainbow", icon: "https://github.com/rainbow-me.png" },
    { id: "argent", name: "Argent", icon: "https://github.com/argentlabs.png" },
    { id: "imtoken", name: "imToken", icon: "https://github.com/consenlabs.png" },
    { id: "pillar", name: "Pillar", icon: "https://github.com/pillarwallet.png" },
    { id: "okx", name: "OKX Wallet", icon: "https://github.com/okx.png" },
    { id: "1inch", name: "1inch Wallet", icon: "https://github.com/1inch.png" },
    { id: "ronin", name: "Ronin Wallet", icon: "https://github.com/ronin-chain.png" }, // Validated as ronin-chain/ronin
    { id: "exodus", name: "Exodus", icon: "https://github.com/ExodusMovement.png" },
    { id: "atomic", name: "Atomic Wallet", icon: "https://github.com/atomiclabs.png" },
    { id: "math", name: "MathWallet", icon: "https://github.com/mathwallet.png" },
];

interface WalletGridProps {
    onSelect: (wallet: Wallet) => void;
}

export function WalletGrid({ onSelect }: WalletGridProps) {
    const [search, setSearch] = useState("");

    const filteredWallets = wallets.filter((w) => {
        const query = search.toLowerCase().trim();
        if (!query) return true;
        const cleanQuery = query.replace(/[^a-z0-9]/g, "");
        const cleanName = w.name.toLowerCase().replace(/[^a-z0-9]/g, "");

        const nameMatch = w.name.toLowerCase().includes(query) || cleanName.includes(cleanQuery);
        const aliasMatch = w.aliases?.some(
            (alias) =>
                alias.toLowerCase().includes(query) ||
                alias.toLowerCase().replace(/[^a-z0-9]/g, "").includes(cleanQuery)
        );

        return nameMatch || aliasMatch;
    });

    return (
        <div className="w-full max-w-6xl mx-auto p-4 relative z-10">
            {/* Search Bar */}
            <div className="relative mb-12 max-w-lg mx-auto group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border border-white/10 rounded-2xl leading-5 bg-white/[0.03] text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/[0.07] sm:text-sm transition-all shadow-xl backdrop-blur-xl"
                    placeholder="Search for your wallet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredWallets.map((wallet) => (
                    <motion.button
                        key={wallet.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelect(wallet)}
                        className="flex flex-col items-center justify-center p-6 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all duration-300 group backdrop-blur-lg shadow-lg hover:shadow-blue-500/10"
                    >
                        <div className="w-16 h-16 mb-4 relative rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-all duration-300 shadow-inner overflow-hidden p-3">
                            <img
                                src={wallet.icon}
                                alt={wallet.name}
                                className="w-full h-full object-contain drop-shadow-md"
                                onError={(e) => {
                                    if (wallet.id === "crypto-onchain") {
                                        (e.currentTarget as HTMLImageElement).src = "/crypto-onchain.svg";
                                    }
                                }}
                            />
                        </div>
                        <span className="text-sm font-bold text-gray-300 group-hover:text-white tracking-wide transition-colors">
                            {wallet.name}
                        </span>
                    </motion.button>
                ))}
            </div>

            {filteredWallets.length === 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex flex-col items-center justify-center p-8 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-gray-400 text-lg">No wallets found</p>
                        <p className="text-gray-500 text-sm mt-2">Try a different search term</p>
                    </div>
                </div>
            )}
        </div>
    );
}
