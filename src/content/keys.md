
# Managing Keys

## Key Management in Intent-Centric Architecture

Proper key management is crucial for secure and user-friendly dApps, especially when using intents and smart wallet abstraction. This section covers best practices for managing various types of keys.

## Types of Keys

1. **Account Keys**: Full access keys controlled by the user's wallet
2. **Function Call Keys**: Limited-permission keys for specific contracts
3. **Session Keys**: Temporary keys with time and scope limits
4. **Intent Verification Keys**: Keys used to validate intent authenticity

## Key Storage Options

### Browser Storage
```javascript
// Store encrypted session key in localStorage
const encryptedKey = await encryptWithPassword(sessionKeyPair, userPassword);
localStorage.setItem('sessionKey', encryptedKey);

// Retrieve and decrypt when needed
const encryptedKey = localStorage.getItem('sessionKey');
const sessionKeyPair = await decryptWithPassword(encryptedKey, userPassword);
```

### Key Derivation
```javascript
// Derive deterministic keys from a master key
const derivationPath = "m/44'/397'/0'/0'/1'";
const derivedKey = await deriveKeyFromPath(masterKey, derivationPath);
```

## Key Rotation Policies

- Automatic rotation after expiration
- Rotation on security events
- User-triggered rotation
- Gradual migration to new keys

## Backup and Recovery

- Backup strategies for session keys
- Recovery mechanisms for lost keys
- Multi-factor authentication options

## Security Best Practices

1. Never expose private keys in logs or APIs
2. Use encryption for any key storage
3. Implement proper access controls
4. Monitor for suspicious key usage
5. Provide clear user interfaces for key management

## Example: Safe Key Rotation

```javascript
async function rotateSessionKey(accountId, oldKey, contractId) {
  // Generate new key
  const newKeyPair = KeyPair.fromRandom('ed25519');
  
  // Create transaction to add new key
  const addKeyTx = createAddKeyTransaction(accountId, newKeyPair.publicKey, contractId);
  await wallet.signAndSendTransaction(addKeyTx);
  
  // Store new key securely
  await securelyStoreKey(accountId, newKeyPair);
  
  // Create transaction to remove old key
  const removeKeyTx = createDeleteKeyTransaction(accountId, oldKey.publicKey);
  await wallet.signAndSendTransaction(removeKeyTx);
  
  return newKeyPair;
}
```

In the next section, we'll explore how to abstract complex blockchain actions to provide a simpler interface for users.
