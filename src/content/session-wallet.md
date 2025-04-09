
# Session-based Smart Wallet

## Understanding Session-based Smart Wallets

Session-based smart wallets allow users to authorize a temporary session key that can perform actions on their behalf without requiring a signature for every transaction. This significantly improves UX by reducing the number of confirmation prompts.

## Advantages of Session Wallets

- Reduced friction for users
- Batch transactions without multiple approvals
- Simplified UX for complex operations
- Better mobile experience

## Implementation Architecture

A session-based smart wallet typically consists of:

1. A main wallet account that the user controls
2. A session key with limited permissions and expiration
3. Authorization logic to verify session validity
4. A recovery mechanism for key rotation

## Creating a Session Key

```javascript
// Generate a new keypair for the session
const keyPair = KeyPair.fromRandom('ed25519');
const publicKey = keyPair.getPublicKey().toString();

// Create a function call access key with limited permissions
const transaction = nearAPI.transactions.createTransaction(
  accountId,
  PublicKey.fromString(publicKey),
  contractId,
  nonce,
  [functionCallAccessKey(
    contractId,
    ['authorized_methods'],
    '0.25' // allowance in NEAR for gas fees
  )],
  recentBlockHash
);

// Have the user sign this transaction to authorize the session key
const signedTransaction = await wallet.signTransaction(transaction);
```

## Managing Session Lifetime

Sessions should have:

- Clear expiration times
- Limited scope of permissions
- Ability to be revoked by the user
- Automatic renewal mechanisms when appropriate

## Security Considerations

- Store session keys securely (e.g., encrypted in localStorage)
- Implement proper key rotation policies
- Allow users to view and revoke active sessions
- Provide clear visibility into session status

In the next section, we'll look at how to manage these keys securely in a web application.
# Session-based Smart Wallet

## Understanding Session Keys in NEAR

Session keys allow users to authorize a temporary key that can perform specific actions without requiring a signature for every transaction. This creates a smoother user experience by reducing the number of confirmation prompts.

## Benefits of Session Keys

- Improved user experience with fewer confirmations
- Support for batched transactions without multiple approvals
- Better mobile experience with less context switching
- Enhanced security through limited scope permissions

## Implementing a Session Wallet

Here's how to implement a session-based wallet using NEAR API JS:

```javascript
import { connect, keyStores, KeyPair } from 'near-api-js';

const setupSessionWallet = async (privateKey) => {
  // Create an in-memory keystore
  const keyStore = new keyStores.InMemoryKeyStore();
  
  // Generate or load a keypair
  const keyPair = KeyPair.fromString(privateKey);
  
  // Add the keypair to the keystore
  await keyStore.setKey("testnet", "your-account.testnet", keyPair);

  // Connect to NEAR
  const near = await connect({
    networkId: "testnet",
    keyStore,
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://wallet.testnet.near.org",
  });

  // Get the account object
  const account = await near.account("your-account.testnet");
  return account;
};
```

## Generating a Session Key

You can generate a new key pair for the session:

```javascript
const generateSessionKey = () => {
  const keyPair = KeyPair.fromRandom('ed25519');
  const publicKey = keyPair.getPublicKey().toString();
  const privateKey = keyPair.secretKey;
  
  return {
    publicKey,
    privateKey,
    keyPair
  };
};
```

## Storing Session Keys Securely

Session keys should be stored securely in the browser:

```javascript
const storeSessionKey = (accountId, keyPair) => {
  // Convert the key to a string format
  const privateKey = keyPair.secretKey;
  
  // Store in localStorage (consider more secure options for production)
  localStorage.setItem(
    `sessionKey:${accountId}`, 
    JSON.stringify({
      privateKey: Buffer.from(privateKey).toString('base64'),
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
    })
  );
};

const getStoredSessionKey = (accountId) => {
  const item = localStorage.getItem(`sessionKey:${accountId}`);
  if (!item) return null;
  
  const { privateKey, expires } = JSON.parse(item);
  
  // Check if the key has expired
  if (Date.now() > expires) {
    localStorage.removeItem(`sessionKey:${accountId}`);
    return null;
  }
  
  // Convert back to buffer
  const keyBuffer = Buffer.from(privateKey, 'base64');
  return KeyPair.fromString(keyBuffer.toString());
};
```

## Using the Session Wallet

Once the session wallet is set up, you can use it to call contract methods without requiring additional user confirmations:

```javascript
const callContractWithSession = async (contractId, method, args) => {
  // Try to get an existing session key
  const accountId = "your-account.testnet"; // This should come from the connected wallet
  let keyPair = getStoredSessionKey(accountId);
  
  // If no valid session key exists, create a new one
  if (!keyPair) {
    keyPair = generateSessionKey();
    storeSessionKey(accountId, keyPair);
    
    // Here you would typically have the user approve this session key
    // through their main wallet
  }
  
  // Set up the session wallet
  const account = await setupSessionWallet(keyPair.secretKey);
  
  // Call the contract method
  return await account.functionCall({
    contractId,
    methodName: method,
    args,
    gas: '30000000000000',
    attachedDeposit: '0',
  });
};
```

In the next section, we'll explore how to manage these keys and implement proper security practices.
