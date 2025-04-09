import React, { createContext, useContext, useEffect, useState } from 'react';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import { connect, keyStores, KeyPair } from 'near-api-js';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default function WalletProvider({ children }) {
  const [selector, setSelector] = useState(null);
  const [sessionWallet, setSessionWallet] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initWallet();
  }, []);

  const initWallet = async () => {
    try {
      // Initialize wallet selector
      const selector = await setupWalletSelector({
        network: 'testnet',
        modules: [setupNearWallet()],
      });
      setSelector(selector);

      // Check for existing session
      const existingSession = localStorage.getItem('nearSessionKey');
      if (existingSession) {
        await initializeSessionWallet(existingSession);
      }
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSessionWallet = async (privateKey) => {
    try {
      const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      const keyPair = KeyPair.fromString(privateKey);
      
      // Store the key in keyStore
      await keyStore.setKey("testnet", account?.accountId, keyPair);

      const near = await connect({
        networkId: "testnet",
        keyStore,
        nodeUrl: "https://rpc.testnet.near.org",
        walletUrl: "https://wallet.testnet.near.org",
        headers: {}
      });

      const account = await near.account(account?.accountId);
      setSessionWallet(account);
      return account;
    } catch (error) {
      console.error('Failed to initialize session wallet:', error);
      return null;
    }
  };

  const createSessionKey = async () => {
    try {
      const keyPair = KeyPair.fromRandom('ed25519');
      const publicKey = keyPair.getPublicKey().toString();
      const privateKey = keyPair.secretKey;

      // Store session key securely
      localStorage.setItem('nearSessionKey', privateKey);

      // Add access key to the account with limited permissions
      await account.addKey(
        publicKey,
        'verifier.testnet', // contract ID
        ['verify_intent', 'execute_intent'], // allowed methods
        '0.1' // allowance in NEAR for transactions
      );

      await initializeSessionWallet(privateKey);
      return true;
    } catch (error) {
      console.error('Failed to create session key:', error);
      return false;
    }
  };

  const clearSession = () => {
    localStorage.removeItem('nearSessionKey');
    setSessionWallet(null);
  };

  const connectWallet = async () => {
    try {
      const wallet = await selector.wallet('near-wallet');
      await wallet.signIn({
        contractId: 'verifier.testnet',
        methodNames: ['verify_intent', 'execute_intent'],
      });
      const accounts = await wallet.getAccounts();
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        await createSessionKey();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    try {
      const wallet = await selector.wallet();
      await wallet.signOut();
      setAccount(null);
      clearSession();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const submitIntent = async (intent) => {
    try {
      if (!sessionWallet) {
        throw new Error('No session wallet available');
      }

      const result = await sessionWallet.functionCall({
        contractId: 'verifier.testnet',
        methodName: 'verify_intent',
        args: { intent },
        gas: '30000000000000',
        attachedDeposit: '0',
      });

      return result;
    } catch (error) {
      console.error('Failed to submit intent:', error);
      throw error;
    }
  };

  const value = {
    selector,
    sessionWallet,
    account,
    loading,
    connectWallet,
    disconnectWallet,
    submitIntent,
    clearSession,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}