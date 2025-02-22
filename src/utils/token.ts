import {
  getMint,
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Keypair,
  TransactionMessage,
  VersionedTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { BN } from "@project-serum/anchor";

export async function getTokenAccountBalance(
  connection: Connection,
  tokenAccount: PublicKey
) {
  return await connection.getTokenAccountBalance(tokenAccount);
}

export async function getMintProgramId(
  connection: Connection,
  mintAddress: PublicKey
): Promise<PublicKey> {
  const accountInfo = await connection.getAccountInfo(mintAddress);
  if (!accountInfo) {
    throw new Error('Mint account not found');
  }
  return accountInfo.owner;
}

export async function setupTokenTransfer(
  connection: Connection,
  mint: PublicKey,
  fromWallet: Keypair,
  toWalletPublicKey: PublicKey,
  amount: number
) {
  // First get the program ID that owns the mint
  const programId = await getMintProgramId(connection, mint);
  console.log("Token Program ID:", programId.toString());

  const mintInfo = await getMint(
    connection,
    mint,
    "confirmed",
    programId
  );

  // Get or create the from token account
  const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet,
    mint,
    fromWallet.publicKey,
    false,
    undefined,
    undefined,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Get or create the to token account
  const toTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    fromWallet, // payer
    mint,
    toWalletPublicKey,
    false,
    undefined,
    undefined,
    programId,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  console.log("From Token Account:", fromTokenAccount.address.toString());
  console.log("To Token Account:", toTokenAccount.address.toString());

  const transferInstruction = createTransferCheckedInstruction(
    fromTokenAccount.address, // Use .address from the account
    mint,
    toTokenAccount.address, // Use .address from the account
    fromWallet.publicKey,
    new BN(amount * Math.pow(10, mintInfo.decimals)),
    mintInfo.decimals,
    [],
    programId
  );

  const priorityFeeInstruction = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 200000
  });

  return {
    mintInfo,
    fromTokenAccount: fromTokenAccount.address,
    toTokenAccount: toTokenAccount.address,
    transferInstruction,
    priorityFeeInstruction
  };
}

export async function createAndSignTransaction(
  connection: Connection,
  fromWallet: Keypair,
  instructions: any[]
) {
  const latestBlockhash = await connection.getLatestBlockhash();
  
  const messageV0 = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message();
  
  const transaction = new VersionedTransaction(messageV0);
  transaction.sign([fromWallet]);
  
  return { transaction, latestBlockhash };
} 