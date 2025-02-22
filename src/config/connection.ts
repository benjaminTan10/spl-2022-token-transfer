import { Connection, clusterApiUrl } from "@solana/web3.js";

export type NetworkType = "mainnet" | "devnet";

export const getConnection = (network: NetworkType = "devnet"): Connection => {
  const endpoint = network === "mainnet" 
    ? "https://api.mainnet-beta.solana.com"
    : clusterApiUrl("devnet");
  
  return new Connection(endpoint, "confirmed");
}; 