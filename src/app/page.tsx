"use client";

import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { connectWallet, unstakeLigmaTokens, stakeLigmaTokens, getAccountBalance } from '../util/unstake';

const Home: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [amount, setAmount] = useState('')
  const [textStake, setTextStake] = useState('')
  const [maxLigma, setMaxLigma] = useState(0)
  const [maxXLigma, setMaxXLigma] = useState(0)
  const [isLoadingStake, setIsLoadingStake] = useState(false);

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
            console.error(error)
          }
        }
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) {
      setWalletAddress(address);
      setMaxBalances();
    }
  };

  const setMaxBalances = async () => {
    if ('solflare' in window) {
      const solana = window as any;
      const ligmaBalance = await getAccountBalance(new PublicKey(solana.solflare.publicKey), LIGMA_ADDRESS);
      setMaxLigma(ligmaBalance);
      const xligmaBalance = await getAccountBalance(new PublicKey(solana.solflare.publicKey), XLIGMA_ADDRESS);
      setMaxXLigma(xligmaBalance);
    }
  }

  const handleUnstakeLigma = async () => {
    if (walletAddress) {
      try {
        const { signature, confirmation } = await unstakeLigmaTokens(new PublicKey(walletAddress), parseFloat(amount));
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
    if (walletAddress) {
      try {
        const { signature, confirmation } = await stakeLigmaTokens(new PublicKey(walletAddress), parseFloat(amount));
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h1>Unstake Your Ligma Tokens</h1>
      {!walletAddress ? (
        <button onClick={handleConnectWallet}>Connect Wallet</button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', padding: 20, gap: 5, maxWidth: 300 }}>
          <label htmlFor="input" style={{marginLeft: "37px"}}>xligma token amount</label>
          <input type="text" value={amount} onChange={e => setAmount(e.target.value)} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleUnstakeLigma} style={{ width: '100px', height: '20px' }}>Unstake Ligma</button>
            <a href="#" onClick={handleSetMaxUnstake} style={{ marginLeft: '10px', color: 'blue', textDecoration: 'underline' }}>Max:{maxXLigma}</a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={handleStakeLigma} style={{ width: '100px', height: '20px' }}>Stake Ligma</button>
            <a href="#" onClick={handleSetMaxStake} style={{ marginLeft: '10px', color: 'blue', textDecoration: 'underline' }}>Max:{String(maxLigma)}</a>
          </div>

          <p style={{ wordWrap: 'break-word' }} dangerouslySetInnerHTML={{ __html: textStake }}></p>
        </div>
      )}
    </div>
  );
};

export default Home;
