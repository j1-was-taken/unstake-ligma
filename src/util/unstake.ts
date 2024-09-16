import {
  Connection,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
  ComputeBudgetProgram,
  TransactionMessage,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  Keypair,
  SendTransactionError,
  BlockhashWithExpiryBlockHeight,
} from '@solana/web3.js';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAccount, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import bs58 from 'bs58'

// Constants
const RPC_URL = 'https://solana-mainnet.core.chainstack.com/c66e6078957a0376aae2632af596dd66/';
const LIGMA_PROGRAM_ID = new PublicKey("pLigmFBt3J3gLeZv1tehqZ3RhWcMmTkGart6oN9tqkX");
const LIGMA_ADDRESS = new PublicKey("node3SHFNF7h6N9jbztfVcXrZcvAJdns1xAV8CbYFLG");
const XLIGMA_ADDRESS = new PublicKey("xNodeyB1u8WNrKQJqfucbKDMq7LYcAQfYXmqVdDj9M5");
const CONSTANT_ACCOUNT = new PublicKey("ENz6c4ZVYedrcK5V4fh7vwDA1SvZDNDQb1j3KKQbbo8Q");

export const connectWallet = async (): Promise<string | null> => {
  if ('solflare' in window) {
    const solana = window as any;
    if (solana.solflare.isSolflare) {
      try {
        const response = await solana.solflare.connect();
        if (solana.solflare.isConnected) {
          console.log('Connected to wallet');
        } else {
          console.log('Cancelled');
        }

        return solana.solflare.publicKey;
      } catch (err) {
        console.error('Connection to wallet failed!', err);
        return null;
      }
    } else {
      alert('Phantom or Solflare wallet not found! Please install it.');
      return null;
    }
  }
  return null;
};

export const unstakeLigmaTokens = async (payer: PublicKey, amount: number) => {
  const connection = new Connection(RPC_URL, 'finalized');
  const solana = window as any;

  const xligmaTokenAccount = await getAssociatedTokenAddress(XLIGMA_ADDRESS, payer);
  const ligmaTokenAccount = await getAssociatedTokenAddress(LIGMA_ADDRESS, payer);
  console.log(ligmaTokenAccount.toBase58());

  // Check if the ligmaTokenAccount is initialized
  const accountInfo = await connection.getAccountInfo(ligmaTokenAccount);
  if (accountInfo === null) {
    console.log('Ligma Account not initialized... initializing');

    const computeBudgetCreate = ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 });
    const computeBudgetPriorityCreate = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_333_333 });
    const createAccInst = createAssociatedTokenAccountInstruction(
      payer, // Payer of the initialization fees
      ligmaTokenAccount, // New associated token account
      payer, // Owner of the new account
      LIGMA_ADDRESS, // Token mint account
      TOKEN_PROGRAM_ID, // SPL Token program account
      ASSOCIATED_TOKEN_PROGRAM_ID // SPL Associated Token program account
    );

    const dataFunctionName = '5a5f6b2acd7c32e1fe';
    const splAmount = Buffer.alloc(8);
    splAmount.writeBigUInt64LE(BigInt(amount * 1_000_000)); // Example amount

    const buyInstruction = new TransactionInstruction({
      programId: LIGMA_PROGRAM_ID,
      keys: [
        { pubkey: LIGMA_ADDRESS, isSigner: false, isWritable: false },
        { pubkey: XLIGMA_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: xligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: CONSTANT_ACCOUNT, isSigner: false, isWritable: true },
        { pubkey: ligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(dataFunctionName + splAmount.toString('hex'), 'hex'),
    });

    const blockhashCreate = await connection.getLatestBlockhash('finalized') as BlockhashWithExpiryBlockHeight;

    const messageCreate = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhashCreate.blockhash,
      instructions: [computeBudgetCreate, computeBudgetPriorityCreate, createAccInst, buyInstruction],
    }).compileToV0Message();

    const transactionCreate = new VersionedTransaction(messageCreate);

    const signedTransaction = await solana.solflare.signTransaction(transactionCreate);
    const signature = await connection.sendTransaction(signedTransaction);

    // Wait for the transaction to be confirmed
    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmationPromise = connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    }).then(() => 'Confirmed!');

    return { signature, confirmation: confirmationPromise };
  } else {
    console.log('Ligma Account is already initialized.');

    const dataFunctionName = '5a5f6b2acd7c32e1fe';
    const splAmount = Buffer.alloc(8);
    splAmount.writeBigUInt64LE(BigInt(amount * 1_000_000)); // Example amount

    const buyInstruction = new TransactionInstruction({
      programId: LIGMA_PROGRAM_ID,
      keys: [
        { pubkey: LIGMA_ADDRESS, isSigner: false, isWritable: false },
        { pubkey: XLIGMA_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: xligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: CONSTANT_ACCOUNT, isSigner: false, isWritable: true },
        { pubkey: ligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(dataFunctionName + splAmount.toString('hex'), 'hex'),
    });

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 });
    const computeBudgetPriority = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_333_333 });

    const { blockhash } = await connection.getLatestBlockhash('finalized');

    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [computeBudget, computeBudgetPriority, buyInstruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    const signedTransaction = await solana.solflare.signTransaction(transaction);
    const signature = await connection.sendTransaction(signedTransaction);

    const latestBlockHash = await connection.getLatestBlockhash();
    const confirmationPromise = connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    }).then(() => 'Confirmed!');

    return { signature, confirmation: confirmationPromise };
  }
};

export const stakeLigmaTokens = async (payer: PublicKey, amount: number) => {
  const connection = new Connection(RPC_URL, 'finalized');
  const solana = window as any;

  console.log('connection worked');

  let xligmaTokenAccount = await getAssociatedTokenAddress(XLIGMA_ADDRESS, payer);
  let ligmaTokenAccount = await getAssociatedTokenAddress(LIGMA_ADDRESS, payer);

  const accountInfo = await connection.getAccountInfo(xligmaTokenAccount);
  if (accountInfo === null) {
    console.log('Ligma Account not initialized... initializing and staking');

    const computeBudgetCreate = ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 });
    const computeBudgetPriorityCreate = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_333_333 });
    const createAccInst = createAssociatedTokenAccountInstruction(
      payer, // Payer of the initialization fees
      xligmaTokenAccount, // New associated token account
      payer, // Owner of the new account
      XLIGMA_ADDRESS, // Token mint account
      TOKEN_PROGRAM_ID, // SPL Token program account
      ASSOCIATED_TOKEN_PROGRAM_ID // SPL Associated Token program account
    );

    const dataFunctionName = 'ceb0ca12c8d1b36cfe';
    const splAmount = Buffer.alloc(8);
    splAmount.writeBigUInt64LE(BigInt(amount * 1_000_000)); // Example amount
    const buyInstruction = new TransactionInstruction({
      programId: LIGMA_PROGRAM_ID,
      keys: [
        { pubkey: LIGMA_ADDRESS, isSigner: false, isWritable: false },
        { pubkey: XLIGMA_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: ligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: CONSTANT_ACCOUNT, isSigner: false, isWritable: true },
        { pubkey: xligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(dataFunctionName + splAmount.toString('hex'), 'hex'),
    });

    const blockhashCreate = await connection.getLatestBlockhash('finalized') as BlockhashWithExpiryBlockHeight;

    const messageCreate = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhashCreate.blockhash,
      instructions: [computeBudgetCreate, computeBudgetPriorityCreate, createAccInst, buyInstruction],
    }).compileToV0Message();

    const transactionCreate = new VersionedTransaction(messageCreate);

    const signedTransaction = await solana.solflare.signTransaction(transactionCreate);
    const signature = await connection.sendTransaction(signedTransaction);

    // Wait for the transaction to be confirmed
    const latestBlockHash = await connection.getLatestBlockhash();

    const confirmationPromise = connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    }).then(() => 'Confirmed!');

    return { signature, confirmation: confirmationPromise };
  } else {
    console.log('Ligma Account is already initialized.');

    const dataFunctionName = 'ceb0ca12c8d1b36cfe';
    const splAmount = Buffer.alloc(8);
    splAmount.writeBigUInt64LE(BigInt(amount * 1_000_000)); // Example amount

    const buyInstruction = new TransactionInstruction({
      programId: LIGMA_PROGRAM_ID,
      keys: [
        { pubkey: LIGMA_ADDRESS, isSigner: false, isWritable: false },
        { pubkey: XLIGMA_ADDRESS, isSigner: false, isWritable: true },
        { pubkey: ligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: CONSTANT_ACCOUNT, isSigner: false, isWritable: true },
        { pubkey: xligmaTokenAccount, isSigner: false, isWritable: true },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      ],
      data: Buffer.from(dataFunctionName + splAmount.toString('hex'), 'hex'),
    });

    const computeBudget = ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 });
    const computeBudgetPriority = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1_333_333 });

    const { blockhash } = await connection.getLatestBlockhash('finalized');

    const message = new TransactionMessage({
      payerKey: payer,
      recentBlockhash: blockhash,
      instructions: [computeBudget, computeBudgetPriority, buyInstruction],
    }).compileToV0Message();

    const transaction = new VersionedTransaction(message);

    const signedTransaction = await solana.solflare.signTransaction(transaction);
    const signature = await connection.sendTransaction(signedTransaction);

    const latestBlockHash = await connection.getLatestBlockhash();
    const confirmationPromise = connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    }).then(() => 'Confirmed!');

    return { signature, confirmation: confirmationPromise };
  }
};

export const getAccountBalance = async (payer: PublicKey, account: PublicKey) => {
  const connection = new Connection(RPC_URL, 'finalized');

  try {
    const ligmaAta = await getAssociatedTokenAddress(account, payer);
    const accountInfo = await getAccount(connection, ligmaAta);
    const balance = Number(accountInfo.amount) / 1000000;
    return balance;
  } catch (error) {
    console.error("Account not found or other error:", error);
    return 0;
  }
}