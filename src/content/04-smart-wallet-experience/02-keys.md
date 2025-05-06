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

## Session Key Implementation

Here's a practical implementation of session key management:

```javascript
import { KeyPair } from 'near-api-js';
import CryptoJS from 'crypto-js';

class SessionKeyManager {
  constructor() {
    this.keyPrefix = 'near_session_key_';
  }
  
  // Generate a new session key
  generateSessionKey(accountId) {
    const keyPair = KeyPair.fromRandom('ed25519');
    return {
      accountId,
      privateKey: keyPair.secretKey,
      publicKey: keyPair.publicKey.toString(),
      created: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
  }
  
  // Encrypt and store session key
  storeSessionKey(sessionKey, password) {
    const encryptedKey = CryptoJS.AES.encrypt(
      JSON.stringify(sessionKey),
      password
    ).toString();
    
    localStorage.setItem(
      this.keyPrefix + sessionKey.accountId,
      encryptedKey
    );
  }
  
  // Retrieve and decrypt session key
  getSessionKey(accountId, password) {
    const encryptedKey = localStorage.getItem(this.keyPrefix + accountId);
    if (!encryptedKey) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encryptedKey, password).toString(CryptoJS.enc.Utf8);
      const sessionKey = JSON.parse(decrypted);
      
      // Check expiration
      if (sessionKey.expires < Date.now()) {
        this.removeSessionKey(accountId);
        return null;
      }
      
      return sessionKey;
    } catch (e) {
      console.error('Failed to decrypt session key:', e);
      return null;
    }
  }
  
  // Remove session key
  removeSessionKey(accountId) {
    localStorage.removeItem(this.keyPrefix + accountId);
  }
}
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
