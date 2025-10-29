// /lib/umi.ts
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";

export const RPC = process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";

export function getUmi() {
  return createUmi(RPC).use(mplTokenMetadata()).use(mplToolbox());
}
