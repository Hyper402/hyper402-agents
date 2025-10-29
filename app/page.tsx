"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import EsotericBg from "./components/esotericbg";

const Stat: React.FC<{ label: string; value: string; delta?: string }> = ({
  label,
  value,
  delta,
}) => (
  <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50">
    <div className="text-zinc-400 text-xs">{label}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    {delta && <div className="text-xs text-emerald-400 mt-1">{delta}</div>}
  </div>
);

const Feature: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 h-full">
    <h3 className="text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-zinc-400">{body}</p>
  </div>
);

export default function Page() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* animated esoteric background */}
      <EsotericBg />

      {/* nav */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-7 rounded-md bg-purple-600" />
          <span className="font-semibold">Hyper402</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <Link href="#features">Features</Link>
          <Link href="#stats">Stats</Link>
          <Link href="/mint" className="rounded-xl px-3 py-1.5 bg-zinc-900 border border-zinc-800">
            Mint
          </Link>
          <a href="#docs" className="text-zinc-400">
            Docs
          </a>
        </nav>
      </header>

      {/* hero */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-10 items-center"
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs text-purple-300 bg-purple-600/10 border border-purple-600/30 rounded-full px-3 py-1">
              Composable • On-chain • Solana
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-bold leading-tight">
              Mint Hyper Agents.{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-rose-400">
                Power the 402 Economy.
              </span>
            </h1>
            <p className="mt-4 text-zinc-400 text-base md:text-lg max-w-xl">
              Create AI agents as NFTs with embedded config. Deploy them anywhere and plug into 402 payments when
              you're ready.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/mint" className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-medium">
                Mint Agent
              </Link>
              <a href="#demo" className="px-5 py-3 rounded-2xl border border-zinc-800 bg-zinc-900/50">
                Live Demo
              </a>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-zinc-500">
              <span>Backed by Solana speed</span>
              <span>Arweave metadata via Bundlr</span>
              <span>0% royalties</span>
            </div>
          </div>

          {/* hero card mock */}
          <div className="p-4 md:p-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 backdrop-blur">
            <div className="flex gap-4">
              <div className="w-28 h-28 rounded-2xl bg-zinc-800" />
              <div className="flex-1">
                <div className="text-sm text-zinc-400">Preview</div>
                <div className="text-xl font-semibold">Nyx #001 • H402</div>
                <div className="mt-1 text-sm text-zinc-400">Model: gpt-4o-mini • Temp: 0.6</div>
                <div className="mt-3 p-3 rounded-xl bg-black/40 border border-zinc-800 text-sm text-zinc-300">
                  System prompt goes here…
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500">Mint Agent NFT</button>
              <button className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900/50">View Metadata</button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid md:grid-cols-3 gap-6">
          <Feature
            title="Agent-as-NFT"
            body="Ownable, tradable identity with embedded AI config (model, temp, system prompt)."
          />
          <Feature title="Arweave Metadata" body="Images + JSON uploaded via Bundlr. Immutable records you can trust." />
          <Feature
            title="402-Ready"
            body="Plug in prepaid meters or pay-per-request receipts when you want monetization."
          />
        </div>
      </section>

      {/* stats */}
      <section id="stats" className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Overall Stats</h2>
          <div className="text-sm text-zinc-400">Past 24h</div>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <Stat label="Transactions" value="12.3K" delta="+18.2%" />
          <Stat label="Volume" value="$84.5K" delta="+3.7%" />
          <Stat label="Buyers" value="3.2K" delta="+9.6%" />
          <Stat label="Sellers" value="212" delta="-2.3%" />
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/60 text-zinc-400">
              <tr>
                <th className="text-left p-3">Agent Server</th>
                <th className="text-left p-3">Txns</th>
                <th className="text-left p-3">Volume</th>
                <th className="text-left p-3">Buyers</th>
                <th className="text-left p-3">Chain</th>
              </tr>
            </thead>
            <TableBodyClient />
          </table>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="p-6 md:p-10 rounded-3xl border border-zinc-800 bg-gradient-to-r from-purple-600/10 to-rose-600/10">
          <h3 className="text-2xl md:text-3xl font-semibold">Ready to mint your first Agent?</h3>
          <p className="mt-2 text-zinc-400">Spin an NFT with embedded AI config in under a minute.</p>
          <div className="mt-5">
            <Link href="/mint" className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 font-medium">
              Go to Mint
            </Link>
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 pb-12 text-sm text-zinc-500">
        <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} Hyper402</span>
          <div className="flex items-center gap-4">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#github">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/** Client-only table body to avoid hydration mismatch */
function TableBodyClient() {
  const [rows, setRows] = useState<
    { server: string; txns: string; volume: string; buyers: number }[]
  >([]);

  useEffect(() => {
    const data = Array.from({ length: 8 }).map((_, i) => ({
      server: `pay.hyper${i}`,
      txns: `${(Math.random() * 10 + 5).toFixed(2)}K`,
      volume: `$${(Math.random() * 90 + 10).toFixed(2)}K`,
      buyers: Math.floor(Math.random() * 4000),
    }));
    setRows(data);
  }, []);

  if (rows.length === 0) {
    return (
      <tbody>
        {Array.from({ length: 8 }).map((_, i) => (
          <tr key={i} className="border-t border-zinc-800">
            <td className="p-3">
              <div className="h-4 w-40 bg-zinc-800 rounded" />
            </td>
            <td className="p-3">
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </td>
            <td className="p-3">
              <div className="h-4 w-16 bg-zinc-800 rounded" />
            </td>
            <td className="p-3">
              <div className="h-4 w-12 bg-zinc-800 rounded" />
            </td>
            <td className="p-3">
              <div className="h-4 w-14 bg-zinc-800 rounded" />
            </td>
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody>
      {rows.map((r, i) => (
        <tr key={i} className="border-t border-zinc-800 hover:bg-zinc-900/40">
          <td className="p-3 flex items-center gap-2">
            <div className="size-5 rounded bg-zinc-700" /> {r.server}
          </td>
          <td className="p-3">{r.txns}</td>
          <td className="p-3">{r.volume}</td>
          <td className="p-3">{r.buyers}</td>
          <td className="p-3">Solana</td>
        </tr>
      ))}
    </tbody>
  );
}
