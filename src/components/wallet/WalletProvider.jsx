
import React, { createContext, useContext, useState, useEffect } from 'react';
import { connect, keyStores, KeyPair } from 'near-api-js';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';

const WalletContext = createContext(null);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export default function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selector, setSelector] = useState(null);
  const [sessionWallet, setSessionWallet] = useState(null);

  // Initialize wallet selector on component mount
  useEffect(() => {
    async function initSelector() {
      try {
        const selector = await setupWalletSelector({
          network: 'testnet',
          modules: [setupNearWallet()]
        });
        
        setSelector(selector);
        
        // Check if user is already signed in
        const state = selector.store.getState();
        if (state.accounts && state.accounts.length > 0) {
          setAccount(state.accounts[0]);
          
          // Try to restore session wallet if available
          const sessionKey = getStoredSessionKey(state.accounts[0].accountId);
          if (sessionKey) {
            const sessionWallet = await setupSessionWallet(sessionKey, state.accounts[0].accountId);
            setSessionWallet(sessionWallet);
          }
        }
      } catch (error) {
        console.error("Failed to initialize wallet selector:", error);
      } finally {
        setLoading(false);
      }
    }
    
    initSelector();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    if (!selector) return;
    
    try {
      setLoading(true);
      const wallet = await selector.wallet('near-wallet');
      await wallet.signIn({
        contractId: 'verifier.testnet',
        methodNames: ['verify_intent', 'execute_intent']
      });
      
      // Update account after sign in
      const state = selector.store.getState();
      if (state.accounts && state.accounts.length > 0) {
        setAccount(state.accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnectWallet = async () => {
    if (!selector) return;
    
    try {
      setLoading(true);
      const wallet = await selector.wallet('near-wallet');
      await wallet.signOut();
      setAccount(null);
      setSessionWallet(null);
      
      // Clear session key
      if (account) {
        localStorage.removeItem(`sessionKey:${account.accountId}`);
      }
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create or rotate session key
  const createSessionKey = async () => {
    if (!account || !selector) return null;
    
    try {
      // Generate new key pair
      const keyPair = KeyPair.fromRandom('ed25519');
      const publicKey = keyPair.getPublicKey().toString();
      
      // Get wallet to authorize the key
      const wallet = await selector.wallet('near-wallet');
      
      // Add function call access key to the account
      await wallet.signAndSendTransaction({
        signerId: account.accountId,
        receiverId: account.accountId,
        actions: [
          {
            type: 'AddKey',
            params: {
              publicKey,
              accessKey: {
                nonce: 0,
                permission: {
                  FunctionCall: {
                    allowance: '250000000000000000000000', // 0.25 NEAR
                    receiver_id: 'verifier.testnet',
                    method_names: ['verify_intent', 'execute_intent'],
                  },
                },
              },
            },
          },
        ],
      });
      
      // Store the session key
      storeSessionKey(account.accountId, keyPair);
      
      // Create session wallet
      const sessionWallet = await setupSessionWallet(keyPair, account.accountId);
      setSessionWallet(sessionWallet);
      
      return sessionWallet;
    } catch (error) {
      console.error("Failed to create session key:", error);
      return null;
    }
  };

  // Submit intent using session wallet
  const submitIntent = async (intent) => {
    if (!account) {
      throw new Error("Wallet not connected");
    }
    
    try {
      // Use session wallet if available, otherwise create one
      let wallet = sessionWallet;
      if (!wallet) {
        wallet = await createSessionKey();
        if (!wallet) {
          throw new Error("Failed to create session wallet");
        }
      }
      
      // Call verify_intent on the verifier contract
      const result = await wallet.functionCall({
        contractId: 'verifier.testnet',
        methodName: 'verify_intent',
        args: { intent },
        gas: '30000000000000',
        attachedDeposit: '0',
      });
      
      return result;
    } catch (error) {
      console.error("Failed to submit intent:", error);
      throw error;
    }
  };

  // Helper functions for session key management
  const setupSessionWallet = async (keyPair, accountId) => {
    const keyStore = new keyStores.InMemoryKeyStore();
    await keyStore.setKey("testnet", accountId, keyPair);
    
    const near = await connect({
      networkId: "testnet",
      keyStore,
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
    });
    
    return await near.account(accountId);
  };

  const storeSessionKey = (accountId, keyPair) => {
    localStorage.setItem(
      `sessionKey:${accountId}`,
      JSON.stringify({
        privateKey: Buffer.from(keyPair.secretKey).toString('base64'),
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      })
    );
  };

  const getStoredSessionKey = (accountId) => {
    const item = localStorage.getItem(`sessionKey:${accountId}`);
    if (!item) return null;
    
    const { privateKey, expires } = JSON.parse(item);
    
    // Check expiration
    if (Date.now() > expires) {
      localStorage.removeItem(`sessionKey:${accountId}`);
      return null;
    }
    
    return KeyPair.fromString(Buffer.from(privateKey, 'base64').toString());
  };

  // Check if we have an active session
  const hasActiveSession = () => {
    if (!account) return false;
    
    const item = localStorage.getItem(`sessionKey:${account.accountId}`);
    if (!item) return false;
    
    const { expires } = JSON.parse(item);
    return Date.now() < expires;
  };

  const value = {
    account,
    loading,
    selector,
    sessionWallet,
    connectWallet,
    disconnectWallet,
    submitIntent,
    createSessionKey,
    hasActiveSession
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}
