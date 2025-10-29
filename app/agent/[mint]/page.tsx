// /app/agent/[mint]/page.tsx
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getUmi } from "@/lib/umi";
import {
  fetchDigitalAsset,
  fetchJsonMetadata,
} from "@metaplex-foundation/mpl-token-metadata";

export default function AgentPage({ params: { mint } }: { params: { mint: string } }) {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      try {
        const umi = getUmi();
        const asset = await fetchDigitalAsset(umi, umi.publicKey(mint));
        const json = await fetchJsonMetadata(umi, asset.metadata.uri);
        setData({ asset, json });
      } catch (e: any) {
        setErr(e?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [mint]);

  if (loading) return <div className="p-6 text-zinc-300">loading…</div>;
  if (err) return <div className="p-6 text-red-400">error: {err}</div>;
  if (!data) return <div className="p-6">not found</div>;

  const meta = data.json;
  const cfg = meta?.x402_agent || {};
  const img = meta?.image;

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← back</Link>

        <div className="flex gap-6 items-start">
          <div className="w-48 h-48 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
            {img ? (
              // next/image is optional; plain <img> also works
              <Image alt="nft" src={img} width={512} height={512} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full grid place-items-center text-zinc-500">no image</div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold">{meta?.name}</h1>
            <div className="text-zinc-400">{meta?.description}</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="text-xs text-zinc-500">model</div>
                <div className="text-sm">{cfg?.model ?? "—"}</div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="text-xs text-zinc-500">temperature</div>
                <div className="text-sm">{cfg?.temperature ?? "—"}</div>
              </div>
              <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="text-xs text-zinc-500">mint</div>
                <div className="text-xs break-all">{mint}</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900">
              <div className="text-xs text-zinc-500 mb-1">system prompt</div>
              <div className="text-sm whitespace-pre-wrap">{cfg?.system_prompt ?? "—"}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          <a
            className="text-purple-300 underline"
            href={`https://explorer.solana.com/address/${mint}`}
            target="_blank"
            rel="noreferrer"
          >
            open in explorer
          </a>
          <a
            className="text-purple-300 underline"
            href={`https://solscan.io/token/${mint}`}
            target="_blank"
            rel="noreferrer"
          >
            open in solscan
          </a>
          <a
            className="text-purple-300 underline"
            href={`https://solana.fm/address/${mint}`}
            target="_blank"
            rel="noreferrer"
          >
            open in solanafm
          </a>
        </div>
      </div>
    </div>
  );
}
