
# Connect Wallet

## Implementing Wallet Connection in Your dApp

A seamless wallet connection experience is crucial for user onboarding in Web3 applications. This section covers how to implement wallet connection with support for intent-centric architecture.

## Wallet Selection Component

```jsx
// src/components/wallet/ConnectButton.jsx
import React, { useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

export function ConnectButton() {
  const { connected, accountId, connect, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);
  
  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm">{accountId}</span>
        <Button variant="outline" size="sm" onClick={disconnect}>
          Disconnect
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Connect Wallet
      </Button>
      
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>Connect your wallet</Dialog.Title>
            <Dialog.Description>
              Choose a wallet to connect to this application
            </Dialog.Description>
          </Dialog.Header>
          
          <div className="grid gap-4 py-4">
            <Button onClick={() => connect('near-wallet')} className="w-full">
              NEAR Wallet
            </Button>
            <Button onClick={() => connect('my-near-wallet')} className="w-full">
              MyNEAR Wallet
            </Button>
            <Button onClick={() => connect('sender')} className="w-full">
              Sender
            </Button>
          </div>
        </Dialog.Content>
      </Dialog>
    </>
  );
}
```

## Wallet Provider Context

```jsx
// src/components/wallet/WalletProvider.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';
import { setupSender } from '@near-wallet-selector/sender';
import '@near-wallet-selector/modal-ui/styles.css';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [selector, setSelector] = useState(null);
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);
  
  useEffect(() => {
    const init = async () => {
      const selector = await setupWalletSelector({
        network: 'testnet',
        modules: [
          setupNearWallet(),
          setupMyNearWallet(),
          setupSender()
        ],
      });
      
      const modal = setupModal(selector, {
        contractId: process.env.CONTRACT_ID || 'example.testnet',
      });
      
      const state = selector.store.getState();
      setAccounts(state.accounts);
      
      // Listen for account changes
      const subscription = selector.store.observable
        .subscribe(state => {
          setAccounts(state.accounts);
        });
      
      setSelector(selector);
      setModal(modal);
      
      return () => subscription.unsubscribe();
    };
    
    init().catch(err => console.error(err));
  }, []);
  
  const connected = accounts.length > 0;
  const accountId = connected ? accounts[0].accountId : null;
  
  const connect = async (walletId) => {
    if (!selector) return;
    
    if (walletId) {
      await selector.wallet(walletId).signIn();
    } else {
      modal.show();
    }
  };
  
  const disconnect = async () => {
    if (!selector) return;
    
    const wallet = await selector.wallet();
    await wallet.signOut();
  };
  
  const signIntent = async (intent) => {
    if (!selector || !connected) throw new Error('Wallet not connected');
    
    const wallet = await selector.wallet();
    const signedIntent = await wallet.signMessage({
      message: JSON.stringify(intent),
      recipient: process.env.VERIFIER_ID || 'verifier.testnet',
    });
    
    return {
      ...intent,
      signature: signedIntent.signature,
    };
  };
  
  return (
    <WalletContext.Provider value={{
      selector,
      modal,
      accounts,
      accountId,
      connected,
      connect,
      disconnect,
      signIntent
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
```

## Session Key Management

To implement session-based authentication:

```jsx
// src/hooks/useSessionKey.js
import { useState, useEffect, useCallback } from 'react';
import { KeyPair } from 'near-api-js';
import { useWallet } from './useWallet';

export function useSessionKey() {
  const { connected, accountId, selector } = useWallet();
  const [sessionKey, setSessionKey] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Load existing session key from storage
  useEffect(() => {
    if (connected && accountId) {
      const storedKey = localStorage.getItem(`session_key_${accountId}`);
      if (storedKey) {
        try {
          setSessionKey(KeyPair.fromString(storedKey));
        } catch (err) {
          console.error('Invalid session key in storage');
          localStorage.removeItem(`session_key_${accountId}`);
        }
      }
    } else {
      setSessionKey(null);
    }
  }, [connected, accountId]);
  
  // Create a new session key
  const createSessionKey = useCallback(async () => {
    if (!connected || !accountId || !selector) return null;
    
    setLoading(true);
    try {
      // Generate new keypair
      const newKeyPair = KeyPair.fromRandom('ed25519');
      
      // Add the public key to the account with function call access
      const wallet = await selector.wallet();
      await wallet.signAndSendTransaction({
        actions: [{
          type: 'AddKey',
          params: {
            publicKey: newKeyPair.getPublicKey().toString(),
            accessKey: {
              permission: {
                type: 'FunctionCall',
                contractId: process.env.CONTRACT_ID || 'example.testnet',
                methodNames: ['execute_intent']
              }
            }
          }
        }]
      });
      
      // Store key securely
      localStorage.setItem(`session_key_${accountId}`, newKeyPair.toString());
      setSessionKey(newKeyPair);
      return newKeyPair;
    } catch (err) {
      console.error('Failed to create session key:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, accountId, selector]);
  
  return {
    sessionKey,
    hasSessionKey: !!sessionKey,
    createSessionKey,
    loading
  };
}
```

In the next section, we'll implement the interface for submitting intents using these wallet components.
