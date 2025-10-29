"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, Connection, Commitment } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { findMetadataPda, fetchJsonMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

type Card = { mint: string; name: string; image?: string; model?: string };

const COMMITMENT: Commitment = "confirmed";
const PAGE_SIZE = 1000;

async function fetchHeliusAll(address: string, heliusKey: string): Promise<Card[]> {
  const base = "https://api.helius.xyz";
  const out: Card[] = [];
  let page = 1;

  while (true) {
    const url =
      `${base}/v0/addresses/${address}/assets` +
      `?tokenType=nonFungible&displayOptions=full&pageNumber=${page}&pageSize=${PAGE_SIZE}&api-key=${heliusKey}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Helius DAS ${r.status}`);
    const data = await r.json();
    const items = Array.isArray(data) ? data : data?.items;

    if (!items || items.length === 0) break;

    for (const it of items) {
      const meta = it?.content?.metadata ?? it?.offChainMetadata ?? {};
      const links = it?.content?.links ?? {};
      const x = meta?.x402_agent || {};
      out.push({
        mint: it?.id || it?.mint || it?.tokenAddress,
        name: meta?.name || it?.tokenName || (it?.id ?? ""),
        image: links?.image || meta?.image,
        model: x?.model,
      });
    }
    if (items.length < PAGE_SIZE) break;
    page += 1;
  }

  // Legacy fallback (rare)
  if (out.length === 0) {
    const url = `${base}/v0/addresses/${address}/nfts?pageNumber=1&pageSize=${PAGE_SIZE}&api-key=${heliusKey}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Helius v0/nfts ${r.status}`);
    const data = await r.json();
    const items = Array.isArray(data) ? data : data?.items;
    for (const it of items ?? []) {
      const meta = it?.content?.metadata ?? it?.offChainMetadata ?? {};
      const links = it?.content?.links ?? {};
      const x = meta?.x402_agent || {};
      out.push({
        mint: it?.id || it?.mint || it?.tokenAddress,
        name: meta?.name || it?.tokenName || (it?.id ?? ""),
        image: links?.image || meta?.image,
        model: x?.model,
      });
    }
  }

  return out.filter(c => !!c.mint);
}

async function scanProgramMints(connection: Connection, owner: PublicKey, programId: PublicKey): Promise<string[]> {
  const resp = await connection.getParsedTokenAccountsByOwner(owner, { programId }, COMMITMENT);
  return resp.value
    .map((a: any) => a.account?.data?.parsed?.info)
    .filter((i: any) => {
      const amt = Number(i?.tokenAmount?.amount || 0);
      // don’t assume decimals === 0; just require you actually hold it
      return amt > 0;
    })
    .map((i: any) => i?.mint as string)
    .filter(Boolean);
}

async function fetchViaRpcBoth(owner: PublicKey, rpcUrl: string): Promise<{cards: Card[]; dbg: {legacy: number; t22: number}}> {
  const connection = new Connection(rpcUrl, COMMITMENT);
  const [legacy, t22] = await Promise.all([
    scanProgramMints(connection, owner, TOKEN_PROGRAM_ID),
    scanProgramMints(connection, owner, TOKEN_2022_PROGRAM_ID),
  ]);

  const uniqueMints = Array.from(new Set([...legacy, ...t22]));
  const umi = createUmi(rpcUrl);

  const out: Card[] = [];
  for (const mint of uniqueMints.slice(0, 120)) {
    try {
      const pda = findMetadataPda(umi, { mint: umi.publicKey(mint) });
      const meta = await fetchJsonMetadata(umi, pda);
      const x = (meta as any)?.x402_agent || {};
      out.push({
        mint,
        name: meta?.name ?? mint,
        image: meta?.image,
        model: x?.model,
      });
    } catch {
      // still show the mint if metadata failed
      out.push({ mint, name: mint });
    }
  }
  return { cards: out, dbg: { legacy: legacy.length, t22: t22.length } };
}

export default function MePage() {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = React.useState(false);
  const [cards, setCards] = React.useState<Card[]>([]);
  const [error, setError] = React.useState<string>("");
  const [debug, setDebug] = React.useState<{source?: string; legacy?: number; t22?: number}>({});

  React.useEffect(() => {
    if (!publicKey) return;

    (async () => {
      setLoading(true);
      setError("");
      setDebug({});
      try {
        const heliusKey = process.env.NEXT_PUBLIC_HELIUS_KEY || "";
        const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || connection.rpcEndpoint;

        let list: Card[] = [];

        // 1) Try Helius (best coverage)
        if (heliusKey) {
          try {
            list = await fetchHeliusAll(publicKey.toBase58(), heliusKey);
            if (list.length) setDebug({ source: "helius" });
          } catch (e) {
            console.warn("Helius failed:", e);
          }
        }

        // 2) Fallback to RPC scan of both programs
        if (list.length === 0) {
          const { cards: rpcCards, dbg } = await fetchViaRpcBoth(publicKey, rpcUrl);
          list = rpcCards;
          setDebug({ source: "rpc", legacy: dbg.legacy, t22: dbg.t22 });
        }

        // Dedup by mint & prefer those with a name
        const byMint = new Map<string, Card>();
        for (const c of list) {
          const prev = byMint.get(c.mint);
          if (!prev || (c.name && c.name !== c.mint)) byMint.set(c.mint, c);
        }

        setCards(Array.from(byMint.values()));
      } catch (e: any) {
        setError(e.message || "unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, [publicKey, connection]);

  const rpcShown = process.env.NEXT_PUBLIC_RPC_URL || connection?.rpcEndpoint || "";

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">my agents</h1>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← back</Link>
        </div>

        <div className="text-xs text-zinc-500 space-y-1">
          <div>wallet: {publicKey ? publicKey.toBase58() : "not connected"}</div>
          <div>rpc: {rpcShown}</div>
          {debug.source && (
            <div>
              source: {debug.source}
              {debug.source === "rpc" && (
                <> • legacy tokens: {debug.legacy} • token-2022: {debug.t22}</>
              )}
            </div>
          )}
        </div>

        {!publicKey && <div className="text-zinc-400">connect a wallet to see your agents.</div>}
        {publicKey && loading && <div className="text-zinc-400">loading your nfts…</div>}
        {error && <div className="text-red-400">error: {error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cards.map((c) => (
            <div key={c.mint} className="rounded-2xl border border-zinc-800 bg-zinc-900">
              <div className="p-4 space-y-3">
                <div className="w-full aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950">
                  {c.image ? (
                    <Image alt={c.name} src={c.image} width={800} height={800} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-zinc-500">no image</div>
                  )}
                </div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-zinc-400 break-all">{c.mint}</div>
                {c.model && <div className="text-xs text-emerald-400">model • {c.model}</div>}
              </div>
            </div>
          ))}
        </div>

        {publicKey && !loading && !error && cards.length === 0 && (
          <div className="text-zinc-400">no agent nfts detected in this wallet.</div>
        )}
      </div>
    </div>
  );
}
