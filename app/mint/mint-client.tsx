"use client";
import { rehostToArweave } from "@/lib/rehost";
import React, { useMemo, useState } from "react";
import Link from "next/link";

import { ConnectionProvider, WalletProvider, useWallet } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
} from "@solana/wallet-adapter-wallets";

// Umi (browser bundle) + helpers
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  generateSigner,
  some,
  percentAmount,
  createGenericFileFromJson,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { bundlrUploader } from "@metaplex-foundation/umi-uploader-bundlr";

// Register programs (Token Metadata, SPL Associated Token, etc.)
import { mplTokenMetadata, createNft } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";

const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
const BUNDLR = process.env.NEXT_PUBLIC_BUNDLR_NODE || "https://node1.bundlr.network";
const COLLECTION_MINT = process.env.NEXT_PUBLIC_COLLECTION_MINT || "";

/* ---------- small UI helpers ---------- */
function Label({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-zinc-400">{title}</span>
      {children}
    </label>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/50">
      <h3 className="text-lg font-semibold mb-3 text-zinc-200">{title}</h3>
      {children}
    </div>
  );
}

/* ---------- mint logic ---------- */
function useMintAgent() {
  const wallet = useWallet();
  const [status, setStatus] = useState<string>("");
  const [txSig, setTxSig] = useState<string>("");
  const [mintAddr, setMintAddr] = useState<string>("");

  const mint = async (fields: {
    name: string;
    symbol: string;
    description: string;
    model: string;
    temperature: number;
    systemPrompt: string;
    imageFile?: File | null;
  }) => {
    try {
      if (!wallet.connected || !wallet.publicKey) throw new Error("connect a wallet first");

      setStatus("preparing umi + bundlr…");
      const umi = createUmi(RPC)
        .use(walletAdapterIdentity(wallet as any))
        .use(mplTokenMetadata()) // registers Token Metadata
        .use(mplToolbox())       // registers splAssociatedToken & helpers
        .use(bundlrUploader({ address: BUNDLR }));

      // 1) upload image (optional) — always rehost to Arweave
      let imageUri = "";
      if (fields.imageFile) {
        setStatus("uploading avatar to arweave…");
        imageUri = await rehostToArweave(umi as any, fields.imageFile);
      }

      // 2) upload metadata
      setStatus("uploading metadata…");
      const metadata = {
        name: fields.name,
        symbol: fields.symbol || "H402",
        description: fields.description,
        image: imageUri || undefined, // permanent arweave URL
        attributes: [
          { trait_type: "Model", value: fields.model },
          { trait_type: "Temperature", value: String(fields.temperature) },
        ],
        properties: {
          files: imageUri ? [{ uri: imageUri, type: fields.imageFile?.type || "image/png" }] : [],
          category: "image",
        },
        external_url: "https://hyper402.app",
        x402_agent: {
          model: fields.model,
          temperature: fields.temperature,
          system_prompt: fields.systemPrompt,
          version: "v0.1",
        },
      };
      const metaFile = createGenericFileFromJson(metadata, "metadata.json");
      const [metadataUri] = await (umi as any).uploader.upload([metaFile]); // array ✔

      // 3) mint nft
      setStatus("minting nft on solana…");
      const mint = generateSigner(umi);
      setMintAddr(mint.publicKey.toString());

      const collection = COLLECTION_MINT ? { verified: false, key: umi.publicKey(COLLECTION_MINT) } : undefined;

      const res = await createNft(umi, {
        mint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
        isCollection: false,
        collection: collection ? some(collection) : undefined,
      }).sendAndConfirm(umi, { commitment: "finalized" });

      setTxSig((res as any).signature || "");
      setStatus("✅ minted! your agent nft is live.");
      return res;
    } catch (e: any) {
      console.error(e);
      setStatus(`❌ ${e.message || e}`);
      throw e;
    }
  };

  return { mint, status, txSig, mintAddr };
}

/* ---------- page content ---------- */
function MintInner() {
  const { mint, status, txSig, mintAddr } = useMintAgent();
  const [name, setName] = useState("nyx #001");
  const [symbol, setSymbol] = useState("H402");
  const [desc, setDesc] = useState("your on-chain ai agent.");
  const [model, setModel] = useState("gpt-4o-mini");
  const [temp, setTemp] = useState(0.6);
  const [sys, setSys] = useState("you are an efficient, helpful ai agent named nyx.");
  const [file, setFile] = useState<File | null>(null);
  const [minting, setMinting] = useState(false);

  const onMint = async () => {
    setMinting(true);
    try {
      await mint({ name, symbol, description: desc, model, temperature: temp, systemPrompt: sys, imageFile: file });
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-zinc-950 text-zinc-100">
      <div className="max-w-5xl mx-auto p-6">
        <header className="flex items-center justify-between mb-8">
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-200">← back</Link>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500 !rounded-xl" />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="agent settings">
            <div className="grid gap-4">
              <Label title="name">
                <input value={name} onChange={(e) => setName(e.target.value)} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700" />
              </Label>

              <div className="grid grid-cols-2 gap-4">
                <Label title="symbol">
                  <input value={symbol} onChange={(e) => setSymbol(e.target.value)} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700" />
                </Label>
                <Label title="model">
                  <select value={model} onChange={(e) => setModel(e.target.value)} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700">
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="claude-3.5-sonnet">claude-3.5-sonnet</option>
                    <option value="llama-3.1-70b">llama-3.1-70b</option>
                    <option value="mixtral-8x7b">mixtral-8x7b</option>
                  </select>
                </Label>
              </div>

              <Label title="temperature">
                <input type="range" min={0} max={1} step={0.05} value={temp} onChange={(e) => setTemp(parseFloat(e.target.value))} />
                <span className="text-sm">{temp.toFixed(2)}</span>
              </Label>

              <Label title="system prompt">
                <textarea value={sys} onChange={(e) => setSys(e.target.value)} rows={4} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700" />
              </Label>

              <Label title="avatar image (png/jpg)">
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </Label>

              <Label title="description">
                <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700" />
              </Label>

              <button onClick={onMint} disabled={minting} className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50">
                {minting ? "minting…" : "mint agent nft"}
              </button>

              <p className="text-sm text-zinc-400 mt-2">{status}</p>

              {(txSig || mintAddr) && (
                <div className="space-y-1">
                  {txSig && (
                    <div className="text-sm">
                      <span className="text-zinc-400 mr-2">tx:</span>
                      <a className="text-purple-300 underline mr-3" href={`https://explorer.solana.com/tx/${txSig}`} target="_blank" rel="noreferrer">Solana Explorer</a>
                      <a className="text-purple-300 underline mr-3" href={`https://solscan.io/tx/${txSig}`} target="_blank" rel="noreferrer">Solscan</a>
                      <a className="text-purple-300 underline" href={`https://solana.fm/tx/${txSig}`} target="_blank" rel="noreferrer">SolanaFM</a>
                    </div>
                  )}
                  {mintAddr && (
                    <div className="text-sm">
                      <span className="text-zinc-400 mr-2">mint:</span>
                      <a className="text-purple-300 underline mr-3" href={`https://explorer.solana.com/address/${mintAddr}`} target="_blank" rel="noreferrer">Solana Explorer</a>
                      <a className="text-purple-300 underline mr-3" href={`https://solscan.io/token/${mintAddr}`} target="_blank" rel="noreferrer">Solscan</a>
                      <a className="text-purple-300 underline" href={`https://solana.fm/address/${mintAddr}`} target="_blank" rel="noreferrer">SolanaFM</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>

          <Section title="live preview">
            <div className="flex gap-4">
              <div className="w-40 h-40 rounded-2xl bg-zinc-800 overflow-hidden border border-zinc-700">
                {file ? (
                  <img alt="preview" className="w-full h-full object-cover" src={URL.createObjectURL(file)} />
                ) : (
                  <div className="w-full h-full grid place-items-center text-zinc-500">no image</div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold">
                  {name} <span className="text-zinc-500">{symbol && `• ${symbol}`}</span>
                </h4>
                <p className="text-sm text-zinc-400 mt-1">{desc}</p>
                <div className="mt-3 text-sm">
                  <div className="flex items-center gap-2"><span className="text-zinc-500 w-28">model</span><span>{model}</span></div>
                  <div className="flex items-center gap-2"><span className="text-zinc-500 w-28">temperature</span><span>{temp.toFixed(2)}</span></div>
                </div>
                <div className="mt-4 p-3 rounded-xl bg-black/40 border border-zinc-800">
                  <div className="text-xs text-zinc-400">system prompt</div>
                  <div className="text-sm mt-1 whitespace-pre-wrap">{sys}</div>
                </div>
              </div>
            </div>
            {COLLECTION_MINT ? (
              <p className="text-xs text-emerald-400 mt-4">collection enabled • {COLLECTION_MINT}</p>
            ) : (
              <p className="text-xs text-amber-400 mt-4">
                no collection set. add NEXT_PUBLIC_COLLECTION_MINT to verify under a collection later.
              </p>
            )}
          </Section>
        </div>

        <Section title="how this becomes an ai agent">
          <ol className="list-decimal pl-5 space-y-2 text-sm text-zinc-300">
            <li>Agent config (model, temperature, system prompt) is stored inside the NFT metadata under <code>x402_agent</code>.</li>
            <li>Your runtime reads the NFT’s metadata by mint address, spins an AI session with those params, and ties usage to the NFT owner.</li>
            <li>Later, plug into the 402 paywall: the agent pays-per-request from the owner’s meter or requires one-shot receipts.</li>
          </ol>
        </Section>
      </div>
    </div>
  );
}

/* ---------- provide wallets + connection ---------- */
export default function MintClient() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TorusWalletAdapter(), new LedgerWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={RPC}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <MintInner />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
