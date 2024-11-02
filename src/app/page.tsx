"use client";

import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { connectWallet, unstakeLigmaTokens, stakeLigmaTokens, getAccountBalance } from '../util/unstake';
import styles from "./page.module.css";

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('')
  const [textStake, setTextStake] = useState('')
  const [maxLigma, setMaxLigma] = useState(0)
  const [maxXLigma, setMaxXLigma] = useState(0)
  const [isLoadingStake, setIsLoadingStake] = useState(false);
  const [RPC_URL, setRPC_URL] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const LIGMA_ADDRESS = new PublicKey("node3SHFNF7h6N9jbztfVcXrZcvAJdns1xAV8CbYFLG");
  const XLIGMA_ADDRESS = new PublicKey("xNodeyB1u8WNrKQJqfucbKDMq7LYcAQfYXmqVdDj9M5");

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if ('solflare' in window) {
        const solana = window as any;
        if (solana.solflare.isConnected) {
          try {
            const response = await solana.solflare.connect({ onlyIfTrusted: true });
            console.log('Wallet already connected')
            setWalletAddress(response.publicKey.toString());
          } catch (error) {
            console.log(error)
          }
        }
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const handleConnectWallet = async () => {
    try {
      const connection = new Connection(RPC_URL, 'finalized');
      await connection.getVersion();

      const address = await connectWallet();
      if (address) {
        setWalletAddress(address);
        setMaxBalances();
      }
    } catch (error) {
      console.log(error)
      alert('Invalid RPC Connection')
    }
  };

  const setMaxBalances = async () => {
    const connection = new Connection(RPC_URL, 'finalized');

    if ('solflare' in window) {
      const solana = window as any;
      const ligmaBalance = await getAccountBalance(new PublicKey(solana.solflare.publicKey), LIGMA_ADDRESS, connection);
      setMaxLigma(ligmaBalance);
      const xligmaBalance = await getAccountBalance(new PublicKey(solana.solflare.publicKey), XLIGMA_ADDRESS, connection);
      setMaxXLigma(xligmaBalance);
    }
  }

  const handleUnstakeLigma = async () => {
    const connection = new Connection(RPC_URL, 'finalized');

    if (walletAddress) {
      try {
        const { signature, confirmation } = await unstakeLigmaTokens(new PublicKey(walletAddress), parseFloat(amount), connection);
        console.log(signature)
        setTextStake('https://solscan.io/tx/' + signature + '<br /><br />Confirming Transaction...');
        const confirmationStatus = await confirmation;
        setTextStake('https://solscan.io/tx/' + signature + '<br /><br />' + confirmationStatus);
        await setMaxBalances();
      } catch (err) {
        console.error('Transaction failed!', err);
      }
    }
  };

  const handleStakeLigma = async () => {
    const connection = new Connection(RPC_URL, 'finalized');

    if (walletAddress) {
      try {
        const { signature, confirmation } = await stakeLigmaTokens(new PublicKey(walletAddress), parseFloat(amount), connection);
        setTextStake('https://solscan.io/tx/' + signature + '<br /><br />Confirming Transaction...');
        const confirmationStatus = await confirmation;
        setTextStake('https://solscan.io/tx/' + signature + '<br /><br />' + confirmationStatus);
        await setMaxBalances();
      } catch (err) {
        console.error('Transaction failed!', err);
      }
    }
  };

  const handleSetMaxUnstake = async () => {
    if (walletAddress) {
      try {
        setAmount(String(maxXLigma)); // Update the amount state variable
      } catch (err) {
        console.error('Transaction failed!', err);
      }
    }
  };

  const handleSetMaxStake = async () => {
    if (walletAddress) {
      try {
        setAmount(String(maxLigma)); // Update the amount state variable
      } catch (err) {
        console.error('Transaction failed!', err);
      }
    }
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>Ligma Staking Tool</h1>
      <br />
      {!walletAddress ? (
        <>

          <div className={styles.httpContainer}>
            <input
              type="text"
              value={RPC_URL}
              onChange={(e) => setRPC_URL(e.target.value)}
              placeholder="HTTP RPC URL"
              className={styles.input}
            />

            <button
              onClick={handleConnectWallet}
              className={styles.buttonConnect}
            >
              Connect Wallet
            </button>
          </div>


          <br />

          <h4 style={{maxWidth: "330px"}}>Connect Using Your Own Node or the Official Public Endpoint Below</h4>
          <br />
          <h2 style={{maxWidth: "330px", fontSize: "20px"}}>https://solana.publicnode.com</h2>


          <br />


        </>
      ) : (

        <div style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 5, maxWidth: 300, justifyContent: "center", alignItems: 'center' }}>
          <h2 style={{ textDecoration: "underline" }}>My Staked Balance</h2>
          <h3>{maxXLigma} $LIGMA</h3>
          <br />
          <h4 style={{ color: "gray", textDecoration: "underline" }}>My Available Balance</h4>
          <h5 style={{ color: "gray" }}>{maxLigma} $LIGMA</h5>
          <br />
          <label className={styles.tokenAmount} htmlFor="input">token amount</label>
          <input type="text" value={amount} onChange={e => setAmount(e.target.value)} className={styles.input} />

          <br />

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={handleUnstakeLigma} className={styles.button} >Unstake Ligma</button>
            </div>
            <a href="#" onClick={handleSetMaxUnstake} style={{ color: 'blue', textDecoration: 'underline' }}>Max:{maxXLigma}</a>

            <br />
            <br />
            <br />
            <br />
            <br />

            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={handleStakeLigma} className={styles.button} >Stake Ligma</button>
            </div>
            <a href="#" onClick={handleSetMaxStake} style={{ color: 'blue', textDecoration: 'underline' }}>Max:{String(maxLigma)}</a>
          </div>

          <br />

          <p style={{ overflowWrap: 'anywhere', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: textStake }}></p>
        </div>
      )}
    </div>
  );
};

export default Home;
