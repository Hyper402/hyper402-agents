"use client";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-zinc-800 bg-black/60 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-zinc-100 hover:text-purple-400">
          Hyper402
        </Link>
        <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-xl" />
      </div>
    </div>
  );
}
