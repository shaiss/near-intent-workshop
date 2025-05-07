# Connect Wallet

## Implementing Wallet Connection in Your dApp

A seamless wallet connection experience is crucial for user onboarding in Web3 applications. This section covers how to implement wallet connection with support for intent-centric architecture.

## Wallet Selection Component

```jsx
// src/components/wallet/ConnectButton.jsx
import React, { useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";

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
      <Button onClick={() => setShowModal(true)}>Connect Wallet</Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>Connect your wallet</Dialog.Title>
            <Dialog.Description>
              Choose a wallet to connect to this application
            </Dialog.Description>
          </Dialog.Header>

          <div className="grid gap-4 py-4">
            <Button onClick={() => connect("near-wallet")} className="w-full">
              NEAR Wallet
            </Button>
            <Button
              onClick={() => connect("my-near-wallet")}
              className="w-full"
            >
              MyNEAR Wallet
            </Button>
            <Button onClick={() => connect("sender")} className="w-full">
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
import React, { createContext, useContext, useState, useEffect } from "react";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupNearWallet } from "@near-wallet-selector/near-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import "@near-wallet-selector/modal-ui/styles.css";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [selector, setSelector] = useState(null);
  const [modal, setModal] = useState(null);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const selector = await setupWalletSelector({
        network: "testnet",
        modules: [setupNearWallet(), setupMyNearWallet(), setupSender()],
      });

      const modal = setupModal(selector, {
        contractId: process.env.CONTRACT_ID || "example.testnet",
      });

      const state = selector.store.getState();
      setAccounts(state.accounts);

      // Listen for account changes
      const subscription = selector.store.observable.subscribe((state) => {
        setAccounts(state.accounts);
      });

      setSelector(selector);
      setModal(modal);

      return () => subscription.unsubscribe();
    };

    init().catch((err) => console.error(err));
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
    if (!selector || !connected) throw new Error("Wallet not connected");

    const wallet = await selector.wallet();
    const signedIntent = await wallet.signMessage({
      message: JSON.stringify(intent),
      recipient: process.env.VERIFIER_ID || "verifier.testnet",
    });

    return {
      ...intent,
      signature: signedIntent.signature,
    };
  };

  return (
    <WalletContext.Provider
      value={{
        selector,
        modal,
        accounts,
        accountId,
        connected,
        connect,
        disconnect,
        signIntent,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
```

## Session Key Management

To implement session-based authentication:

```jsx
// src/hooks/useSessionKey.js
import { useState, useEffect, useCallback } from "react";
import { KeyPair } from "near-api-js";
import { useWallet } from "./useWallet";

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
          console.error("Invalid session key in storage");
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
      const newKeyPair = KeyPair.fromRandom("ed25519");

      // Add the public key to the account with function call access
      const wallet = await selector.wallet();
      await wallet.signAndSendTransaction({
        actions: [
          {
            type: "AddKey",
            params: {
              publicKey: newKeyPair.getPublicKey().toString(),
              accessKey: {
                permission: {
                  type: "FunctionCall",
                  contractId: process.env.CONTRACT_ID || "example.testnet",
                  methodNames: ["execute_intent"],
                },
              },
            },
          },
        ],
      });

      // Store key securely
      localStorage.setItem(`session_key_${accountId}`, newKeyPair.toString());
      setSessionKey(newKeyPair);
      return newKeyPair;
    } catch (err) {
      console.error("Failed to create session key:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [connected, accountId, selector]);

  return {
    sessionKey,
    hasSessionKey: !!sessionKey,
    createSessionKey,
    loading,
  };
}
```

# Connecting Wallets with Session Key Authorization

**Time**: 20 minutes  
**Pre-requisite**: Frontend setup from 5.1, understanding of Session Keys from Module 4

## From Traditional Wallet Connection to Session Keys

In traditional Web3 dApps, every user action requires a separate wallet confirmation. Our session-based approach, as developed in Module 4, improves this experience dramatically. In this section, we'll implement the wallet connection flow that leverages session keys for a seamless user experience.

> 💡 **Web2 Parallel**: This is similar to how modern Web2 applications use OAuth or refresh tokens. After an initial sign-in, users don't need to re-enter credentials for each action within the authorized scope.

## Setting Up the Wallet Context

First, let's create a context to manage wallet state throughout our application:

```jsx
// src/context/WalletContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { connect, keyStores, KeyPair } from "near-api-js";
import { getConfig, CONTRACT_ADDRESSES } from "../utils/near";
import { SessionKeyManager } from "../services/SessionKeyManager";

// Context creation
const WalletContext = createContext(null);

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletProvider({ children }) {
  // State variables
  const [accountId, setAccountId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionKey, setSessionKey] = useState(null);
  const [sessionAccount, setSessionAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Instantiate SessionKeyManager from Module 4
  const [keyManager] = useState(() => new SessionKeyManager());

  // Network configuration
  const [networkId] = useState("testnet");
  const config = getConfig(networkId);

  // Load existing session on component mount
  useEffect(() => {
    const loadExistingSession = async () => {
      // Check if we have a saved account ID from previous session
      const savedAccountId = localStorage.getItem("nearAccountId");

      if (savedAccountId) {
        try {
          // Prompt for password - In a real app, you might use a modal for this
          const password = prompt(
            "Enter your session password to unlock your wallet:"
          );

          if (!password) return;

          // Try to get existing session key
          const existingKey = keyManager.getSessionKey(
            savedAccountId,
            password
          );

          if (existingKey) {
            setAccountId(savedAccountId);
            setSessionKey(existingKey);
            await initializeSessionAccount(
              savedAccountId,
              existingKey.privateKey
            );
            setIsConnected(true);
          }
        } catch (err) {
          console.error("Failed to load existing session:", err);
          localStorage.removeItem("nearAccountId");
        }
      }
    };

    loadExistingSession();
  }, []);

  // Initialize a NEAR account using a session key
  const initializeSessionAccount = async (accountId, privateKey) => {
    try {
      // Create an in-memory keystore for the session key
      const keyStore = new keyStores.InMemoryKeyStore();

      // Load the private key into a KeyPair object
      const keyPair = KeyPair.fromString(privateKey);

      // Add the key to the keystore for the account
      await keyStore.setKey(networkId, accountId, keyPair);

      // Connect to NEAR with this keystore
      const nearConnection = await connect({
        ...config,
        keyStore,
        headers: {},
      });

      // Get the account object that will use the session key
      const account = await nearConnection.account(accountId);
      setSessionAccount(account);

      return account;
    } catch (err) {
      console.error("Failed to initialize session account:", err);
      setError("Failed to initialize session: " + err.message);
      throw err;
    }
  };

  // Connect wallet and authorize session key
  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create a full access connection for initial authorization
      const nearConnection = await connect({
        ...config,
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        headers: {},
      });

      // Create and setup temporary wallet connection
      const walletConnection = new nearConnection.WalletConnection(
        nearConnection
      );

      // If not signed in, redirect to NEAR wallet
      if (!walletConnection.isSignedIn()) {
        walletConnection.requestSignIn();
        return; // The page will redirect and this function will exit
      }

      // Get the connected account ID
      const userAccountId = walletConnection.getAccountId();

      // Generate a new session key for this user
      const verifierContractId = CONTRACT_ADDRESSES[networkId].verifierContract;
      const newSessionKey = keyManager.generateSessionKey(
        userAccountId,
        verifierContractId,
        ["verify_intent"], // Methods this key can call
        "0.25" // 0.25 NEAR allowance for gas fees
      );

      // Prompt user for a password to encrypt the session key
      const password = prompt("Create a password to secure your session:");
      if (!password) {
        setLoading(false);
        return;
      }

      // Get publicKey from the session key
      const publicKey = newSessionKey.publicKey;

      // Create access key permissions (function call access key)
      const methodNames = ["verify_intent"];
      const contractId = verifierContractId;

      // Request the wallet to add this session key with function call permissions
      await walletConnection
        .account()
        .addKey(publicKey, contractId, methodNames, newSessionKey.allowance);

      // Store the session key securely
      keyManager.storeSessionKey(newSessionKey, password);

      // Save the account ID
      localStorage.setItem("nearAccountId", userAccountId);

      // Initialize the session account with the new key
      await initializeSessionAccount(userAccountId, newSessionKey.privateKey);

      // Update state
      setAccountId(userAccountId);
      setSessionKey(newSessionKey);
      setIsConnected(true);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setError("Connection failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet and clean up
  const disconnectWallet = () => {
    try {
      // Remove session key if we have one
      if (accountId && sessionKey) {
        keyManager.removeSessionKey(accountId);
      }

      // Clear local storage
      localStorage.removeItem("nearAccountId");

      // Reset state
      setAccountId(null);
      setSessionKey(null);
      setSessionAccount(null);
      setIsConnected(false);
    } catch (err) {
      console.error("Disconnect failed:", err);
      setError("Disconnect failed: " + err.message);
    }
  };

  // Context value
  const value = {
    accountId,
    isConnected,
    sessionKey,
    sessionAccount,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
```

## Creating the Connect Button Component

Now, let's create a button component that triggers the wallet connection:

```jsx
// src/components/WalletConnection/ConnectButton.jsx
import React from "react";
import { useWallet } from "../../context/WalletContext";

function ConnectButton() {
  const {
    accountId,
    isConnected,
    loading,
    error,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  if (loading) {
    return (
      <button className="button loading" disabled>
        Connecting...
      </button>
    );
  }

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <span className="account-id">{accountId}</span>
        <button onClick={disconnectWallet} className="disconnect-button">
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button onClick={connectWallet} className="connect-button">
      Connect NEAR Wallet
    </button>
  );
}

export default ConnectButton;
```

## The Full Session Key Authorization Flow

Let's visualize the complete session key authorization flow:

```mermaid
sequenceDiagram
    participant User
    participant DApp as Our dApp
    participant Wallet as NEAR Wallet
    participant Blockchain as NEAR Blockchain

    User->>DApp: Click "Connect Wallet"
    DApp->>Wallet: Redirect for authorization
    User->>Wallet: Login & approve
    Wallet->>DApp: Redirect back with credentials

    DApp->>DApp: Generate session key pair
    DApp->>User: Prompt for session password
    User->>DApp: Enter password

    DApp->>Wallet: Request to add function call access key
    User->>Wallet: Approve key addition
    Wallet->>Blockchain: Add key to user account
    Blockchain-->>Wallet: Confirm key added
    Wallet-->>DApp: Return success

    DApp->>DApp: Encrypt & store session key
    DApp->>User: Show connection success

    Note over User,DApp: Future actions use session key without wallet prompts
```

## Implementing the Dashboard Page

Let's create a simple dashboard page that uses our wallet connection:

```jsx
// src/pages/Dashboard.jsx
import React from "react";
import ConnectButton from "../components/WalletConnection/ConnectButton";
import { useWallet } from "../context/WalletContext";

function Dashboard() {
  const { isConnected, accountId, sessionKey } = useWallet();

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>NEAR Intent Architecture</h1>
        <ConnectButton />
      </header>

      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-card">
            <h2>Welcome to NEAR Intent Architecture</h2>
            <p>Connect your wallet to get started with intents!</p>
          </div>
        ) : (
          <div className="account-info-card">
            <h2>Account Connected</h2>
            <p>
              <strong>Account ID:</strong> {accountId}
            </p>
            <p>
              <strong>Session Expires:</strong>{" "}
              {sessionKey
                ? new Date(sessionKey.expires).toLocaleString()
                : "Unknown"}
            </p>
            <p className="session-key-info">
              You're using a session key that allows you to submit intents
              without approving each transaction in your wallet!
            </p>

            {/* We'll add more components here in the next sections */}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
```

## Session Key Manager UI

For a complete experience, let's also create a UI to manage session keys:

```jsx
// src/components/WalletConnection/SessionKeyManager.jsx
import React, { useState } from "react";
import { useWallet } from "../../context/WalletContext";

function SessionKeyManagerUI() {
  const { sessionKey, accountId, disconnectWallet } = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  if (!sessionKey) return null;

  // Format expiry time
  const expiryDate = new Date(sessionKey.expires);
  const now = new Date();
  const hoursRemaining = Math.round((expiryDate - now) / (60 * 60 * 1000));

  return (
    <div className="session-key-manager">
      <h3>Active Session</h3>

      <div className="session-info">
        <p>
          <strong>Account:</strong> {accountId}
        </p>
        <p>
          <strong>Expires:</strong> {expiryDate.toLocaleString()} (
          {hoursRemaining} hours remaining)
        </p>
        <p>
          <strong>Authorized Contract:</strong> {sessionKey.contractId}
        </p>

        <button
          className="details-toggle"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>

        {showDetails && (
          <div className="key-details">
            <p>
              <strong>Public Key:</strong> {sessionKey.publicKey}
            </p>
            <p>
              <strong>Created:</strong>{" "}
              {new Date(sessionKey.created).toLocaleString()}
            </p>
            <p>
              <strong>Authorized Methods:</strong>{" "}
              {sessionKey.methodNames.join(", ")}
            </p>
            <p>
              <strong>Authorized Gas Allowance:</strong>{" "}
              {sessionKey.allowance / 10 ** 24} NEAR
            </p>
          </div>
        )}

        <div className="key-actions">
          <button className="revoke-button danger" onClick={disconnectWallet}>
            Revoke Session Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionKeyManagerUI;
```

## Security Considerations for Session Keys

When implementing session keys in your dApp, consider these security best practices:

1. **Never store private keys in plain text** – Always encrypt with a user-provided password
2. **Set appropriate permissions** – Only request the minimal permissions needed
3. **Use reasonable gas allowances** – Limit the maximum amount of NEAR the key can spend
4. **Implement key expiration** – Automatically invalidate keys after a certain period
5. **Provide key management UI** – Allow users to view and revoke active session keys
6. **Use HTTPS** – Protect against network eavesdropping
7. **Implement proper CSP headers** – Prevent XSS attacks that could steal keys

## Direct Connection to Module 4

Notice how our implementation builds directly on the concepts we explored in Module 4:

1. **SessionKeyManager class** – We're reusing the key management class we built in Module 4.2
2. **Key storage and encryption** – We're applying the same security patterns from Module 4.2
3. **Key authorization flow** – We're implementing the complete session key lifecycle discussed in Module 4.1
4. **Access key permissions** – We're using NEAR's Function Call Access Keys as explored in Module 4.1

By following these patterns, we create a wallet connection flow that provides:

1. **One-time authorization** – Users only need to approve the session key once
2. **Seamless transactions** – Future intent submissions won't require additional approvals
3. **Secure key management** – Private keys are protected by user-provided passwords
4. **Limited permissions** – Session keys can only call the specific methods we authorize

## Next Steps

Our wallet connection is now ready! In the next section, we'll explore how to integrate with the NEAR Wallet Selector to provide users with multiple wallet options for authorizing their session keys.

With this wallet connection implementation, we've successfully bridged Module 4's smart wallet concepts to a practical frontend implementation that provides a seamless user experience for Web3 interactions.
