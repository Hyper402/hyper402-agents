// components/Navbar.tsx
"use client";

import Link from "next/link";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { usePathname } from "next/navigation";

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-zinc-300 hover:text-white hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
};

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-violet-600" />
          <span className="font-semibold tracking-tight">Hyper402</span>
        </Link>

        <nav className="hidden gap-1 md:flex">
          <NavLink href="/" label="Home" />
          <NavLink href="/mint" label="Mint Agent" />
          <NavLink href="/me" label="My Agents" />
          <NavLink href="/docs" label="Docs" />
        </nav>

        <div className="flex items-center gap-2">
          <WalletMultiButton className="!rounded-xl !bg-violet-600 hover:!bg-violet-500" />
        </div>
      </div>
    </header>
  );
}
