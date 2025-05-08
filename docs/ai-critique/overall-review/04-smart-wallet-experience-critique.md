# Critique for Section: 04-smart-wallet-experience

This section covers the client-side implementation of a smart wallet, focusing on session keys, secure storage, action abstractions, UI components, and testing. It is primarily JavaScript/JSX based.

## General Issues Across JavaScript/JSX Files:

1.  **Security of Private Keys in `localStorage`**:

    - **Issue**: Multiple files (`01-session-wallet.md`, `02-keys.md`) demonstrate patterns for storing session private keys in `localStorage`. While `02-keys.md` introduces password-based encryption for this, and warnings about XSS are present, relying on `localStorage` for sensitive key material is inherently risky in production environments.
    - **Expected**: The `code-quality-reviewer.mdc` rule emphasizes security. The existing warnings should be strengthened. More prominently recommend against `localStorage` for private keys in production settings. Elevate in-memory storage (sacrificing persistence for security for purely client-side dApps) or server-side sessions (if a trusted backend exists) as more secure alternatives. The discussion of alternatives in `02-keys.md` is good; its emphasis should be increased.

2.  **User-Friendly Error Messages in UI**:

    - **Issue**: UI components, like `SwapForm` in `03-action-abstraction.md`, display errors using raw `error.message` (e.g., `setStatus(Error: ${err.message});`). These messages can be technical and unhelpful to end-users.
    - **Expected**: Implement more user-friendly error handling. Map known technical error messages (e.g., "Exceeded the allowance", "User rejected the request") to clearer, actionable messages for the user, aligning with the `code-quality-reviewer` rule for clear error messages.

3.  **Hardcoded Placeholders and Configuration**:

    - **Issue**: Account IDs (e.g., `"user.testnet"`) and contract IDs (e.g., `"verifier.testnet"`) are often hardcoded in example snippets across files like `01-session-wallet.md` and `03-action-abstraction.md`.
    - **Expected**: Clearly label these as placeholders (e.g., using `<YOUR_ACCOUNT_ID>.testnet`, `<YOUR_VERIFIER_CONTRACT_ID>`) or state that they should be loaded from a configuration file/environment variables in a real application, as per `markdown-formatting.mdc` for placeholders.

4.  **Magic Numbers for Gas and Allowances**:
    - **Issue**: Specific values for gas (e.g., `"30000000000000"`) and allowances (e.g., `"0.25"` NEAR) are used directly in function calls.
    - **Expected**: For better readability and maintainability, define these as named constants (e.g., `const DEFAULT_FUNCTION_CALL_GAS = "30000000000000"; const SESSION_KEY_ALLOWANCE_NEAR = "0.25";`), as suggested by the `code-quality-reviewer.mdc` rule.

## File-Specific Issues:

### `01-session-wallet.md` & `02-keys.md` (Key Authorization Logic)

1.  **Mermaid Diagram Captions**:

    - **Issue**: Diagrams in both files lack captions.
    - **Expected**: Add descriptive captions as per `mermaid-diagrams` rule.

2.  **`wallet.requestAddKey` API Clarity and Consistency**:
    - **Issue**: The method signature/usage for adding a key seems to vary or could be clearer. `01-session-wallet.md` shows `walletConnection.requestAddKey(publicKey, actions)`. `02-keys.md` uses `wallet.requestAddKey(sessionKey.publicKey, keyManager.createAddKeyActions(sessionKey))`. The standard `Account.addKey` in `near-api-js` takes `publicKey`, `contractId`, `methodNames`, and `allowance` directly.
    - **Expected**: Clarify which wallet interaction library/abstraction is assumed (e.g., `WalletConnection` from `near-api-js`, or a higher-level library like `@near-wallet-selector`). Ensure the arguments passed to `requestAddKey` are consistent with the actual API being used/illustrated. If `createAddKeyActions` is creating a specific structure, detail what that structure is and why it's needed for `requestAddKey`.

### `02-keys.md` (`SessionKeyManager.test.js`)

1.  **Missing `id` Property in SessionKey Test**:
    - **Issue**: The unit test `SessionKeyManager.test.js` (in `04-wallet-testing.md` but tests code from `02-keys.md`) includes `expect(sessionKey).toHaveProperty("id");`. However, the `generateSessionKey` method in `SessionKeyManager` (defined in `02-keys.md`) does not add an `id` field to the `sessionKey` object it returns.
    - **Expected**: Either remove the `expect(sessionKey).toHaveProperty("id");` assertion from the test, or add an `id` field to the object returned by `generateSessionKey` in `02-keys.md` if such an identifier for the session key itself is intended.

### `03-action-abstraction.md`

1.  **`IntentBuilder` for Non-Swap Actions**:

    - **Issue**: `IntentBuilder` includes methods `createTransferIntent` and `createStakeIntent`. The Verifier contract developed in Module 3 primarily focused on validating "swap" actions and its `Intent` struct was tailored for swaps.
    - **Expected**: Clarify that `createTransferIntent` and `createStakeIntent` are illustrative of future expansions and that the Verifier/Solver contracts would require corresponding updates to handle these new action types and their specific fields (e.g., `recipient`, `validator_id`).

2.  **Missing `userPassword` in `SmartWalletInterface`**:
    - **Issue**: The `SmartWalletInterface` component calls `keyManager.getSessionKey(userAccountId, userPassword)` but `userPassword` is not defined or passed into the component.
    - **Expected**: Illustrate how `userPassword` would be obtained (e.g., from a state variable linked to a password input field) if this component is meant to be a complete example of password-protected key retrieval.

### `04-wallet-testing.md`

1.  **Source of `authorizeNewSessionKey` in Tests**:

    - **Issue**: `keyAuthorization.test.js` tests a function `authorizeNewSessionKey` imported from `../src/wallet/keyAuthorization`. This source file was not provided for reading in the context. Previous files (`01-session-wallet.md`, `02-keys.md`) define similar functions.
    - **Expected**: Ensure the testing critiques are internally consistent. If `keyAuthorization.js` is a new file centralizing this, it's fine. If not, the test should import from the file where `authorizeNewSessionKey` (or its equivalent being tested) is actually defined.

2.  **Clarity on Test Environment for Integration Tests**:
    - **Issue**: `walletIntegration.test.js` correctly notes it needs a real testnet setup. It uses `keyManager.storeSessionKey(sessionKey, "userPassword");` with a hardcoded password.
    - **Expected**: Add a note that for actual automated integration tests running against a live testnet, sensitive data like account private keys or passwords used for encrypting session keys should be managed securely (e.g., via environment variables or a secure CI/CD store) and not hardcoded in test files.
