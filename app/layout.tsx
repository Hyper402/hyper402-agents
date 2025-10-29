"use client";

import "./globals.css"; // <- keep ONLY this CSS import
import React, { ReactNode } from "react";
import Navbar from "./components/navbar";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

const endpoint = "https://api.mainnet-beta.solana.com";
const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen flex flex-col">
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Navbar />
              <main className="flex-grow mx-auto w-full max-w-6xl px-6 py-10">
                {children}
              </main>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </body>
    </html>
  );
}
