
# Smart Wallet Abstraction

## What is a Smart Wallet?

A smart wallet is a contract-based wallet that can:
- Execute complex transactions
- Apply custom logic to transaction validation
- Support advanced features like social recovery
- Enable session-based key management

## Smart Wallet vs. EOA Wallet

Traditional EOA (Externally Owned Account) wallets:
- Simple key-based control
- Limited functionality
- All transactions must be signed directly

Smart wallets provide:
- Multiple authorization methods
- Custom validation logic
- Session-based permissions
- Advanced recovery options

## Smart Wallet Implementation

Smart wallets on NEAR are implemented as:
- Contract-based accounts
- Multi-signature validation
- Key rotation capabilities
- Permission hierarchies

## Session Keys

Session keys are temporary authorization mechanisms that:
1. Allow applications to execute specific actions
2. Have limited scope and duration
3. Can be revoked at any time
4. Don't require full wallet access

```javascript
// Example session key creation
{
  "publicKey": "ed25519:abc123...",
  "allowedActions": ["swap", "bridge"],
  "maxAmount": "100",
  "expiresAt": 1672531200000
}
```

## Account Abstraction Benefits

- Improved UX with fewer confirmations
- More secure with limited permissions
- Better composability with other contracts
- Enhanced recovery options

## Smart Wallet Integration with Intents

Smart wallets enhance the intent architecture by:
1. Storing user preferences for solver selection
2. Managing constraints based on user history
3. Executing complex intent sequences
4. Providing security guardrails

## Implementation Example

```javascript
// Creating a smart wallet instance
const smartWallet = await SmartWalletFactory.create({
  owner: userAccount,
  guardians: [guardian1, guardian2],
  recoveryPeriod: 7 * 24 * 60 * 60 * 1000 // 1 week
});

// Setting up a session key
await smartWallet.addSessionKey({
  publicKey: sessionKey.publicKey,
  allowance: "10 NEAR",
  receiverId: "app.near",
  methodNames: ["executeSwap", "executeBridge"],
  expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
});
```
