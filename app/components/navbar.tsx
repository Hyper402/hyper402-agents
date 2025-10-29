"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const WalletMultiButtonDynamic = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link
      href={href}
      className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
        active
          ? "bg-violet-600 text-white"
          : "text-zinc-300 hover:text-white hover:bg-white/10"
      }`}
    >
      {label}
    </Link>
  );
};

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-fuchsia-500 to-violet-600" />
          <span className="font-semibold text-lg tracking-tight">
            Hyper402
          </span>
        </Link>

        <nav className="hidden md:flex gap-1">
          <NavLink href="/" label="Home" />
          <NavLink href="/mint" label="Mint Agent" />
          <NavLink href="/me" label="My Agents" />
          <NavLink href="/docs" label="Docs" />
        </nav>

        <WalletMultiButtonDynamic className="!rounded-xl !bg-violet-600 hover:!bg-violet-500 transition-all" />
      </div>
    </header>
  );
}
