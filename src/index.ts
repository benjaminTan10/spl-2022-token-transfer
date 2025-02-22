import dotenv from "dotenv";
import bs58 from "bs58";
import { LAMPORTS_PER_SOL, Keypair, PublicKey } from "@solana/web3.js";
import { getConnection } from "./config/connection";
import { getTokenAccountBalance, setupTokenTransfer, createAndSignTransaction } from "./utils/token";
import { NetworkType } from "./config/connection";

dotenv.config();

const MINT_ADDRESS = "FrQ9tE1VKEfce8SLxXw7nKsR5THEbrDYTD5aecgaXkpF"; // Devnet Token2022 SPL Token
const TRANSFER_AMOUNT = 1; // Adjust this to a smaller amount for testing

async function transferSplToken(network: NetworkType = "devnet") {
  const connection = getConnection(network);
  
  // Initialize wallets
  const fromWallet = Keypair.fromSecretKey(
    bs58.decode(process.env.SENDER_WALLET_PRIVATE_KEY as string)
  );
  const toWalletPublicKey = new PublicKey(
    process.env.RECEIVER_WALLET_PUBLIC_KEY as string
  );
  const mint = new PublicKey(MINT_ADDRESS);

  console.log("Mint Address:", MINT_ADDRESS);
  console.log("From Wallet:", fromWallet.publicKey.toString());
  console.log("To Wallet:", toWalletPublicKey.toString());

  // Check sender's SOL balance
  const fromWalletBalance = await connection.getBalance(fromWallet.publicKey);
  console.log("From Wallet Balance:", fromWalletBalance / LAMPORTS_PER_SOL, "SOL");

  if (fromWalletBalance < 0.01 * LAMPORTS_PER_SOL) {
    throw new Error("Insufficient SOL balance for transaction fees");
  }

  // Setup token transfer
  try {
    const {
      mintInfo,
      fromTokenAccount,
      transferInstruction,
      priorityFeeInstruction
    } = await setupTokenTransfer(
      connection,
      mint,
      fromWallet,
      toWalletPublicKey,
      TRANSFER_AMOUNT // Use the constant here
    );

    console.log("From Token Account:", fromTokenAccount.toString());
    
    // Check token balance
    try {
      const tokenBalance = await getTokenAccountBalance(connection, fromTokenAccount);
      console.log("Token Balance:", tokenBalance.value.uiAmount);

      if (!tokenBalance.value.uiAmount || tokenBalance.value.uiAmount < TRANSFER_AMOUNT) { // Use the constant here
        throw new Error("Insufficient token balance");
      }
    } catch (error) {
      console.error("Error checking token balance. Token account may not exist.");
      throw error;
    }

    // Create and sign transaction
    const { transaction, latestBlockhash } = await createAndSignTransaction(
      connection,
      fromWallet,
      [priorityFeeInstruction, transferInstruction]
    );

    try {
      const signature = await connection.sendTransaction(transaction, {
        maxRetries: 20
      });

      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      });

      if (confirmation.value.err) throw new Error("Transaction failed");

      const explorerUrl = `https://solscan.io/tx/${signature}${network === "devnet" ? "?cluster=devnet" : ""}`;
      console.log("Transaction successful:", explorerUrl);
      
    } catch (error) {
      console.error("Transaction failed:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in setup:", error);
    throw error;
  }
}

// Execute transfer
transferSplToken("devnet")
  .catch(console.error); 