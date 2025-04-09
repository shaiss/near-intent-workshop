
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
