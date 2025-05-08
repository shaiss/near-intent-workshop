# Critique for Section: 06-testnet-deployment

This section guides users through deploying contracts to the testnet, interacting via NEAR CLI, debugging techniques, and simulating solver behavior.

## General Issues Across Files:

1.  **Placeholder Formatting in Shell Commands**:

    - **Issue**: Commands in `01-testnet-deploy.md` and `02-near-cli.md` frequently use account ID formats like `yourname.testnet`, `verifier.yourname.testnet`.
    - **Expected**: Consistently use the angle-bracket placeholder convention (e.g., `<YOUR_ACCOUNT_ID>.testnet`, `verifier.<YOUR_ACCOUNT_ID>.testnet`) as specified in the `markdown-formatting.mdc` rule.

2.  **Multi-line JSON in Shell Commands**:
    - **Issue**: Several `near call` commands embed multi-line JSON arguments within single quotes, which can be unreliable across different shells.
    - **Files Affected**: `01-testnet-deploy.md`, `02-near-cli.md`.
    - **Expected**: Recommend using `--argsFile` with a JSON file for complex arguments, or ensure inline JSON is minimized and tested. Add a note about potential shell quoting issues, as per `code-quality-reviewer.mdc` guidelines on clarity and usability.

## File-Specific Issues:

### `01-testnet-deploy.md`

1.  **Mermaid Diagram Caption**: Diagram lacks a caption. _Expected_: Add caption.
2.  **Smart Wallet Contract (`smart_wallet.wasm`) Origin**:
    - **Issue**: Includes deployment steps for `smart-wallet.yourname.testnet` using `smart_wallet.wasm`. Module 4 focused on client-side wallet abstractions (JS code) and did not cover building or obtaining this specific WASM file.
    - **Expected**: Clarify the source and purpose of `smart_wallet.wasm`. Is it a pre-requisite users need to obtain elsewhere? Is it built from code not shown? Or is its deployment here purely illustrative? If it's integral to the client-side session key logic, its absence in Module 4's build process creates a continuity gap according to `code-continuity-reviewer.mdc`.
3.  **Frontend Config Update**: Mentions updating `CONTRACT_ADDRESSES` to include `smartWalletContract`. _Expected_: This depends on the clarification of the `smart_wallet.wasm`'s role. If it's not a user-deployed contract central to the flow, this configuration update might be misleading.

### `02-near-cli.md`

1.  **Deadline Timestamp Unit in JSON**:
    - **Issue**: The `intent.json` example uses `"deadline": 1698523278`. This appears to be a Unix timestamp (seconds). However, previous analysis (critique for `04-submit-intents.md`) indicated that the Rust contract expects nanoseconds (`u64`). The accompanying note mentions using a numeric value for `u64` but doesn't specify the unit.
    - **Expected**: Ensure consistency in timestamp units. If the contract expects nanoseconds, update the example JSON to use a nanosecond value (e.g., `1698523278000000000`). Explicitly state the expected unit (seconds or nanoseconds) for the `deadline` field in CLI examples to avoid user error.
2.  **Smart Wallet Test Call**: Shows calling `add_session_key` on `smart-wallet.yourname.testnet`. _Expected_: This critique point is linked to the clarification needed in `01-testnet-deploy.md` regarding the smart wallet contract.

### `03-debug-intents.md`

1.  **Deserializing Promise Results**:
    - **Issue**: The `handle_solver_response` Rust example extracts the successful promise result using `String::from_utf8(value).unwrap_or(...)`. If the solver returns structured data (like `ExecutionResult`), this will not deserialize it correctly.
    - **Expected**: If the solver function called is expected to return structured data (like the `ExecutionResult` struct defined in Module 3), the callback example should demonstrate proper deserialization, e.g., using `near_sdk::serde_json::from_slice(&value).expect("Failed to deserialize solver result")`, instead of just treating it as a string. This ensures code correctness as per `code-quality-reviewer.mdc`.
2.  **Missing Imports for Gas Constants**:
    - **Issue**: Uses `Gas(20 * TGAS)` but doesn't show the necessary imports (`use near_sdk::Gas; const TGAS: u64 = 1_000_000_000_000;`).
    - **Expected**: Include necessary imports or definitions for `Gas` and `TGAS` if the code snippet is intended to be complete or easily runnable, improving code quality and usability.

### `04-simulate-solvers.md`

1.  **Network Simulator (`NetworkSimulator` class)**:
    - **Issue**: Implements `fetch` wrapping for simulating network conditions.
    - **Expected**: Add a strong warning that this technique modifies global browser behavior, should only be used for testing in development, and will not simulate blockchain-specific network conditions (like consensus delays or RPC node issues) accurately.
2.  **Backend Solver Simulation (`simulate-solver.js`)**:
    - **Issue**: Assumes a specific key path (`/home/user/...`) which is platform-dependent.
    - **Expected**: Note that the key path is OS-dependent and provide guidance or use a more generic placeholder like `<PATH_TO_NEAR_CREDENTIALS>`.
3.  **NEAR Lake Framework Snippet**:
    - **Issue**: Mentions extracting intents from receipts but doesn't detail how (`const intent = /* extract intent from receipt */;`).
    - **Expected**: Acknowledge that parsing intent data from transaction receipts/actions requires specific knowledge of how the intent was submitted (e.g., base64 encoded arguments) and is non-trivial. Point users to NEAR Lake documentation or examples for receipt/action parsing techniques.
