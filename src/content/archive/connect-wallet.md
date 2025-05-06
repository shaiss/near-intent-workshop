
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
# Connecting Wallets

## Implementing Wallet Connection

The first step in our frontend is to allow users to connect their NEAR wallets. We'll use the NEAR Wallet Selector library for this purpose.

## Creating the Wallet Provider

Let's create a provider component to manage wallet connections across the application:

```jsx
// src/components/wallet/WalletProvider.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const selector = await setupWalletSelector({
          network: 'testnet',
          modules: [setupNearWallet()],
        });

        const wallet = await selector.wallet('near-wallet');
        setWallet(wallet);
        
        // Get accounts if user is already signed in
        const state = selector.store.getState();
        if (state.accounts.length > 0) {
          setAccounts(state.accounts);
        }
      } catch (error) {
        console.error('Failed to initialize wallet selector:', error);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);

  const connect = async () => {
    if (!wallet) return;
    
    try {
      const accountIds = await wallet.signIn({ contractId: 'verifier.testnet' });
      setAccounts(accountIds.map(accountId => ({ accountId })));
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  const disconnect = async () => {
    if (!wallet) return;
    
    try {
      await wallet.signOut();
      setAccounts([]);
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <WalletContext.Provider 
      value={{ 
        wallet, 
        accounts, 
        connected: accounts.length > 0,
        accountId: accounts[0]?.accountId || '',
        loading, 
        connect, 
        disconnect 
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
```

## Creating a Connect Button

Now, let's create a button component for connecting wallets:

```jsx
// src/components/wallet/ConnectButton.jsx
import { useWallet } from './WalletProvider';

export const ConnectButton = () => {
  const { connected, loading, connect, disconnect, accountId } = useWallet();

  if (loading) {
    return <button className="btn btn-primary" disabled>Loading...</button>;
  }

  if (connected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">{accountId}</span>
        <button 
          onClick={disconnect}
          className="px-4 py-2 bg-red-500 text-white rounded-md"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={connect}
      className="px-4 py-2 bg-blue-500 text-white rounded-md"
    >
      Connect Wallet
    </button>
  );
};
```

## Using the Wallet Provider

Make sure to wrap your application with the `WalletProvider`:

```jsx
// src/App.jsx
import { WalletProvider } from './components/wallet/WalletProvider';
import { ConnectButton } from './components/wallet/ConnectButton';

function App() {
  return (
    <WalletProvider>
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">NEAR Intents Demo</h1>
          <ConnectButton />
        </header>
        {/* Other components */}
      </div>
    </WalletProvider>
  );
}

export default App;
```

## Creating the Intent Form

Now that we have wallet connectivity, let's create a form for users to submit intents:

```jsx
// src/components/intent/IntentForm.jsx
import { useState } from 'react';
import { useWallet } from '../wallet/WalletProvider';

export const IntentForm = () => {
  const [input, setInput] = useState('USDC');
  const [output, setOutput] = useState('wNEAR');
  const [amount, setAmount] = useState('');
  const { wallet, accountId, connected } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected || !wallet) {
      alert('Please connect your wallet first');
      return;
    }

    const intent = {
      action: 'swap',
      input_token: input,
      input_amount: parseFloat(amount),
      output_token: output,
      max_slippage: 0.5,
    };

    try {
      await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: 'verifier.testnet',
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'verify_intent',
              args: { intent: JSON.stringify(intent) },
              gas: '30000000000000',
              deposit: '0',
            },
          },
        ],
      });
    } catch (error) {
      console.error('Failed to submit intent:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Submit Swap Intent</h2>
      
      <div className="mb-4">
        <label className="block mb-1">Amount</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded" 
          placeholder="Enter amount" 
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block mb-1">Input Token</label>
          <select 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="USDC">USDC</option>
            <option value="DAI">DAI</option>
            <option value="USDT">USDT</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-1">Output Token</label>
          <select 
            value={output} 
            onChange={(e) => setOutput(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="wNEAR">wNEAR</option>
            <option value="USDT">USDT</option>
            <option value="ETH">ETH</option>
          </select>
        </div>
      </div>
      
      <button 
        type="submit" 
        className="w-full py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        disabled={!connected || !amount}
      >
        Submit Intent
      </button>
    </form>
  );
};
```

With these components in place, users can now connect their wallets and submit intents to the verifier contract.
