# Critique for Section: 05-building-frontend

This section covers the React frontend implementation, including setup, wallet integration using Wallet Selector, intent form creation, solver selection, and intent execution.

## General Issues Across JavaScript/JSX Files:

1.  **Hardcoded Placeholders & Configuration**:

    - **Issue**: Contract IDs (e.g., `"verifier.testnet"`, `"solver.testnet"`) and network details are frequently hardcoded in service files, context providers, and configuration utilities.
    - **Files Affected**: `01-frontend-setup.md` (`near.js`, `contracts.js`), `03-wallet-selector.md` (`WalletProvider.jsx`), `04-submit-intents.md` (`IntentService.js`), etc.
    - **Expected**: Consistently use placeholders (e.g., `<YOUR_CONTRACT_ID>`) or clearly instruct users to configure these values via environment variables (`process.env.REACT_APP_VERIFIER_ID`) or a central configuration file, aligning with `markdown-formatting.mdc` and production best practices.

2.  **User-Facing Error Messages**:

    - **Issue**: Error handling often displays technical error messages directly to the user (e.g., `setError("Connection failed: " + err.message);`).
    - **Files Affected**: `02-connect-wallet.md`, `03-wallet-selector.md`, `04-submit-intents.md`, `06-execute-intent.md`.
    - **Expected**: Map common technical errors (network issues, user rejection, contract panics like allowance exceeded) to more user-friendly, informative messages. Provide clearer feedback on _why_ an operation failed, improving the user experience as per `code-quality-reviewer.mdc`.

3.  **Security Warnings for `localStorage`**:

    - **Issue**: While Module 4 warned about `localStorage` for keys, this module continues to show examples using it (often encrypted). The risks need constant reinforcement.
    - **Files Affected**: `02-connect-wallet.md`, `03-wallet-selector.md`.
    - **Expected**: Reiterate the XSS risks associated with `localStorage` in this module. Emphasize that even password-encrypted keys in `localStorage` are vulnerable if the password or the encryption process itself is compromised client-side. More strongly recommend in-memory session storage as a safer default for purely client-side dApps.

4.  **Password Handling with `prompt()`**:

    - **Issue**: The `prompt()` function is used to get user passwords for session key encryption/decryption.
    - **Files Affected**: `02-connect-wallet.md`, `03-wallet-selector.md`.
    - **Expected**: Clearly state that `prompt()` is **highly insecure and bad UX**, used solely for simplified demonstration. Explain that a real application must use secure input fields within a proper UI modal for password entry.

5.  **Magic Numbers/Strings for Gas/Allowances**:

    - **Issue**: Gas values (e.g., `"30000000000000"`) and allowances (`"0.25"` NEAR) are hardcoded.
    - **Expected**: Define these as named constants (e.g., `const DEFAULT_FUNCTION_CALL_GAS = ...; const SESSION_KEY_ALLOWANCE_NEAR = ...;`) for better readability and maintainability, following `code-quality-reviewer.mdc`.

6.  **Polling/`setTimeout` Usage**:
    - **Issue**: Uses `setInterval` for polling solver updates (`05-solver-options.md`) and `setTimeout` to delay fetching execution results (`06-execute-intent.md`).
    - **Expected**: Add notes explaining that simple polling and fixed timeouts are basic implementations. Mention more robust alternatives for production, such as WebSocket subscriptions (if available), exponential backoff polling, or querying specific blockchain events.

## File-Specific Issues:

### `01-frontend-setup.md`

1.  **Mermaid Diagram Captions**: Diagrams lack captions. _Expected_: Add captions.
2.  **Outdated Dependencies**: `package.json` lists specific versions which may become outdated. _Expected_: Add a note advising users to check for the latest compatible library versions.

### `02-connect-wallet.md`

1.  **Mermaid Diagram Caption**: Diagram lacks caption. _Expected_: Add caption.
2.  **Conflicting Implementations**: Presents two seemingly different implementations of `WalletProvider` and `ConnectButton` – one possibly using Wallet Selector and another using `nearConnection.WalletConnection`. This is confusing.
    - **Expected**: Consolidate into a single, clear implementation for this section, likely focusing on the direct `near-api-js` / `WalletConnection` approach if Wallet Selector is introduced in the _next_ section (`03-wallet-selector.md`). Label clearly if showing evolution.

### `03-wallet-selector.md`

1.  **Mermaid Diagram Caption**: Diagram lacks caption. _Expected_: Add caption.
2.  **Subscription Cleanup in `useEffect`**: The main `useEffect` hook in `WalletProvider` initializes the selector but its cleanup function `() => {}` does not properly return the `unsubscribe` function from the `selector.store.observable.subscribe`. The unsubscribe logic within the subscription handler might also be insufficient if multiple account changes occur rapidly.
    - **Expected**: Modify the main `useEffect` to correctly return the `unsubscribe` function: `return () => subscription.unsubscribe();`. Ensure the logic safely handles potential multiple triggers before unsubscribe.

### `04-submit-intents.md`

1.  **Deadline Unit Mismatch**: The `createSwapIntent` function calculates a deadline in seconds (`Math.floor(... / 1000)`), but NEAR contract timestamps (`env::block_timestamp()`) are in nanoseconds (`u64`).
    - **Expected**: Correct the deadline calculation to produce nanoseconds compatible with the contract. Convert milliseconds (`Date.now()`) to nanoseconds by multiplying by `1_000_000`: `deadline: (params.deadline || Date.now() + 60 * 60 * 1000) * 1_000_000`. Ensure the Rust `Intent` struct's `deadline` field (`Option<u64>`) is consistently treated as nanoseconds.

### `05-solver-options.md`

1.  **Mermaid Diagram Caption**: Diagram lacks caption. _Expected_: Add caption.
2.  **Solver Discovery Mechanism**: `solverService.js` fetches solvers from a base URL (`https://api.example.com`), implying an off-chain API/indexer.
    - **Expected**: Clarify whether solver discovery relies on this off-chain API or if it should primarily use on-chain `viewFunction` calls to the Verifier contract (as demonstrated later in the `IntentService` enhancements within the same file). If an off-chain indexer is required, explain its role and necessity.

### `06-execute-intent.md`

1.  **Assumed Contract Methods**: `IntentService.js` adds `getIntentStatus` and `getExecutionResults` methods, calling corresponding view methods (`get_intent_status`, `get_execution_results`) on the verifier/solver contracts.
    - **Expected**: Ensure these view methods (`get_intent_status` on Verifier, `get_execution_results` on Solver) are actually defined and implemented in the Rust contracts from Module 3. If not, add a note stating they need to be added to the contracts for this frontend functionality to work.
