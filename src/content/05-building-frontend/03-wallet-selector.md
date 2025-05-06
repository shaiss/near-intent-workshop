# Wallet Selector Integration

## Overview of NEAR Wallet Selector

NEAR Wallet Selector is a modular library that simplifies wallet integration for NEAR applications. It provides a unified interface for connecting to various NEAR wallets.

## Setting Up Wallet Selector

First, let's install the necessary packages:

```bash
npm install @near-wallet-selector/core @near-wallet-selector/near-wallet near-api-js
```

## Basic Integration

The core setup involves initializing the wallet selector with appropriate modules:

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

To allow users to connect their wallets, create a simple connection button:

```javascript
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

## Managing Wallet State

Track connection state for a better user experience:

```javascript
import { useEffect, useState } from 'react';

const WalletConnection = ({ selector }) => {
  const [accountId, setAccountId] = useState(null);
  
  useEffect(() => {
    // Subscribe to account changes
    const subscription = selector.store.observable
      .subscribe((state) => {
        const accounts = state.accounts || [];
        if (accounts.length) {
          setAccountId(accounts[0].accountId);
        } else {
          setAccountId(null);
        }
      });
    
    return () => subscription.unsubscribe();
  }, [selector]);
  
  return (
    <div>
      {accountId ? (
        <div>Connected: {accountId}</div>
      ) : (
        <ConnectWallet selector={selector} />
      )}
    </div>
  );
};
```

## Handling Sign Out

Provide a way for users to disconnect:

```javascript
const SignOutButton = ({ selector }) => {
  const handleSignOut = async () => {
    const wallet = await selector.wallet();
    await wallet.signOut();
  };
  
  return <button onClick={handleSignOut}>Sign Out</button>;
};
```

## Integration with Intent Architecture

When using wallet selector with intents, you'll need to:

1. Capture user intent through your UI
2. Use the selected wallet to sign the intent
3. Submit the signed intent to a verifier
4. Track the status of the intent resolution

In the next section, we'll explore how to build a session-based smart wallet that extends this functionality.
