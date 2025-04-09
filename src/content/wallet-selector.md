
# Wallet Selector

## Introduction to NEAR Wallet Selector

The NEAR Wallet Selector is a flexible, modular library that simplifies wallet integration for NEAR dApps. When combined with intents, it provides a powerful foundation for building seamless user experiences.

## Key Features

- Unified interface for multiple wallet providers
- Modal UI for wallet selection
- Responsive design that works on mobile and desktop
- Support for different authentication methods

## Implementation Steps

1. Install the wallet selector packages
2. Configure available wallets
3. Create a wallet context provider
4. Build the connect button component
5. Handle wallet events and state

## Code Example

```javascript
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

// Setup the wallet selector
const selector = await setupWalletSelector({
  network: 'testnet',
  modules: [setupMyNearWallet()],
});

// Setup the modal UI
const modal = setupModal(selector, {
  contractId: 'example.testnet',
});

// Handle wallet connection
document.getElementById('connect-button').addEventListener('click', () => {
  modal.show();
});
```

## Integration with Intent Architecture

When using wallet selector with intents, you'll need to:

1. Capture user intent through your UI
2. Use the selected wallet to sign the intent
3. Submit the signed intent to a verifier
4. Track the status of the intent resolution

In the next section, we'll explore how to build a session-based smart wallet that extends this functionality.
# Integrating NEAR Wallet Selector

## What is NEAR Wallet Selector?

NEAR Wallet Selector is a library that provides a unified way to connect to multiple NEAR wallets. It offers a standardized interface for wallet connection, signing transactions, and other wallet operations.

## Installing Wallet Selector

To get started with NEAR Wallet Selector, install the required packages:

```bash
npm install @near-wallet-selector/core @near-wallet-selector/near-wallet near-api-js
```

## Basic Integration

First, set up the wallet selector in your application:

```javascript
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupNearWallet } from '@near-wallet-selector/near-wallet';

export const initWallet = async () => {
  const selector = await setupWalletSelector({
    network: 'testnet',
    modules: [setupNearWallet()],
  });

  return selector;
};
```

## Creating a Connect Button

Next, implement a button component to trigger wallet connection:

```jsx
const ConnectWallet = ({ selector }) => {
  const handleConnect = async () => {
    const wallet = await selector.wallet('near-wallet');
    await wallet.signIn({
      contractId: 'your-contract.testnet',
      methodNames: ['verify_intent'],
    });
  };

  return <button onClick={handleConnect}>Connect Wallet</button>;
};
```

## Checking Connection Status

You'll also want to check if the user is already connected:

```javascript
const checkConnection = async (selector) => {
  const state = selector.store.getState();
  const accounts = state.accounts || [];
  
  if (accounts.length > 0) {
    return accounts[0];
  }
  
  return null;
};
```

## Implementing a Wallet Provider

For a React application, it's useful to create a context provider for wallet functionality:

```jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initWallet } from '../services/walletService';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [selector, setSelector] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function setup() {
      const selector = await initWallet();
      setSelector(selector);
      
      const state = selector.store.getState();
      if (state.accounts && state.accounts.length > 0) {
        setAccount(state.accounts[0]);
      }
      
      setLoading(false);
    }
    
    setup();
  }, []);

  return (
    <WalletContext.Provider value={{ selector, account, loading }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
```

By implementing the Wallet Selector, we've created the foundation for user authentication in our intent-based application. In the next section, we'll build on this by creating a session-based smart wallet abstraction.
