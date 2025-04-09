
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
