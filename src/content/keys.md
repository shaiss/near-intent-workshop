
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
# Managing Keys

## Key Management in Smart Wallet Abstraction

Proper key management is essential for security in any blockchain application. When implementing a session-based smart wallet, we need to handle several types of keys:

- Master keys (controlled by the user's wallet)
- Session keys (temporary, limited-permission keys)
- Function-call access keys (for specific contract calls)

## Session Key Lifecycle

A well-designed session key system should include:

1. **Creation**: Generate new keys when needed
2. **Storage**: Securely store keys in the browser
3. **Expiration**: Automatically invalidate keys after a time period
4. **Rotation**: Allow users to manually invalidate and regenerate keys
5. **Revocation**: Provide a way to revoke compromised keys

## Implementing Key Rotation

Here's a sample implementation for key rotation:

```javascript
const rotateSessionKey = async (accountId, selector) => {
  // Remove the old key
  localStorage.removeItem(`sessionKey:${accountId}`);
  
  // Generate a new key
  const { keyPair, publicKey } = generateSessionKey();
  
  // Get the wallet interface
  const wallet = await selector.wallet('near-wallet');
  
  // Add the new key to the account with limited access
  // This requires user confirmation via their wallet
  await wallet.signAndSendTransaction({
    signerId: accountId,
    receiverId: accountId,
    actions: [
      {
        type: 'AddKey',
        params: {
          publicKey,
          accessKey: {
            nonce: 0,
            permission: {
              receiver_id: 'verifier.testnet',
              method_names: ['verify_intent', 'execute_intent'],
            },
          },
        },
      },
    ],
  });
  
  // Store the new key
  storeSessionKey(accountId, keyPair);
  
  return keyPair;
};
```

## Function Call Access Keys

NEAR provides a special type of key called "function call access key" that limits permissions to calling specific methods on specific contracts:

```javascript
// Example of adding a function call access key
async function addFunctionCallKey(accountId, wallet, publicKey) {
  await wallet.signAndSendTransaction({
    signerId: accountId,
    receiverId: accountId,
    actions: [
      {
        type: 'AddKey',
        params: {
          publicKey,
          accessKey: {
            nonce: 0,
            permission: {
              FunctionCall: {
                allowance: '25000000000000000000000', // 0.25 NEAR
                receiver_id: 'verifier.testnet',
                method_names: ['verify_intent', 'execute_intent'],
              },
            },
          },
        },
      },
    ],
  });
}
```

## Security Considerations

When implementing session keys, consider these security best practices:

1. **Limited permissions**: Keys should only have access to the specific contracts and methods they need
2. **Limited funds**: Set a reasonable allowance for gas fees
3. **Limited lifespan**: Keys should expire after a reasonable time period
4. **Encrypted storage**: Consider encrypting keys in localStorage
5. **Visual indicators**: Show users when they're using a session key
6. **Emergency revocation**: Provide a clear way for users to revoke all session keys

## UI for Key Management

Provide users with a clear interface for managing their session keys:

```jsx
const KeyManagement = ({ accountId, onRotateKey }) => {
  const [sessionExists, setSessionExists] = useState(false);
  const [expiryTime, setExpiryTime] = useState(null);
  
  useEffect(() => {
    const item = localStorage.getItem(`sessionKey:${accountId}`);
    if (item) {
      const { expires } = JSON.parse(item);
      setSessionExists(true);
      setExpiryTime(new Date(expires));
    }
  }, [accountId]);
  
  return (
    <div className="key-management">
      <h3>Session Key Management</h3>
      
      {sessionExists ? (
        <>
          <div className="session-status active">
            <span>Active Session</span>
            <span>Expires: {expiryTime.toLocaleString()}</span>
          </div>
          <button onClick={onRotateKey}>Revoke & Rotate Key</button>
        </>
      ) : (
        <div className="session-status inactive">
          <span>No active session</span>
          <button onClick={onRotateKey}>Create Session Key</button>
        </div>
      )}
    </div>
  );
};
```

In the next section, we'll explore how to abstract complex blockchain actions using these session keys.
