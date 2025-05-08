# Critique for Section: 03-building-backend

This section details the Rust implementation of Verifier and Solver smart contracts, their deployment, and testing. It's code-intensive and forms the backbone of the workshop's practical part.

## General Issues Across Rust Code Files (`01-local-contract.md`, `02-intent-verifier.md`, `03-solver-contract.md`, `04-cross-contract-calls.md`):

1.  **JSON Serialization Casing Inconsistency**:

    - **Issue**: Rust struct fields (e.g., in `Intent`) are typically `snake_case` (e.g., `input_token`, `user_account`). However, JSON examples in Module 2 (e.g., `02-intent-anatomy.md`) often used `camelCase` for fields (e.g., `fromAsset`, `maxSlippagePercent`). This creates an inconsistency between the conceptual JSON presented to the user and the actual JSON that would be produced by or consumed by the Rust structs using default `serde` behavior.
    - **Expected**: To ensure consistency and meet expectations set by `code-quality-reviewer.mdc`:
      - Option A (Recommended for Rust idiomatic field names): Keep Rust struct fields as `snake_case` and add `#[serde(rename_all = "camelCase")]` to the structs if `camelCase` is the desired JSON format. This will make the serialized JSON match the `camelCase` examples from Module 2.
      - Option B: Change Rust struct fields to `camelCase` (less idiomatic for Rust struct fields but directly produces `camelCase` JSON).
      - Option C: Revise all JSON examples in Module 2 to use `snake_case` to match the Rust struct field names.
        The key is to make the on-chain contract's JSON interface consistent with what learners have seen in conceptual examples.

2.  **Floating-Point Numbers in Financial Logic (`f64`)**:

    - **Issue**: The `Intent` struct uses `max_slippage: f64` (`01-local-contract.md`, `02-intent-verifier.md`). The `solve_intent` function in `03-solver-contract.md` uses `f64` for `actual_rate` and performs floating-point multiplication for `output_amount`. While comments correctly warn about the risks of `f64` in production financial calculations, relying on it extensively even in examples can set a problematic precedent.
    - **Expected**: While the existing cautionary comments are good, to better align with `code-quality-reviewer`'s emphasis on correctness for financial operations:
      - Strengthen the warnings: Emphasize that these `f64` implementations are **strictly for educational illustration of logic flow** and **must not be used in production contracts**.
      - Consider introducing or linking to a simple fixed-point arithmetic library or pattern if the workshop aims to guide towards production-readiness.
      - Alternatively, refactor examples to use integer-based arithmetic for critical financial calculations (e.g., representing slippage in basis points and performing calculations with scaled integers).

3.  **`BorshDeserialize` Typo**:
    - **Issue**: In `02-intent-verifier.md` (for `Verifier` struct) and `07-gas-fees.md` (for `IntentStatus` struct), the derive macro `borschDeserialize` is used. The correct casing is `BorshDeserialize`.
    - **Expected**: Correct the typo to `#[derive(BorshDeserialize, BorshSerialize)]` in all instances to ensure the code compiles and follows correct macro usage.

## File-Specific Issues:

### `01-local-contract.md`

1.  **Mermaid Diagram Caption**:

    - **Issue**: The `graph LR` diagram illustrating Verifier's role lacks a caption.
    - **Expected**: Add a descriptive caption below the diagram as per `mermaid-diagrams` rule.

2.  **`println!` Usage in Rust Primer**:
    - **Issue**: The "Rust for Web2 Developers" primer shows `println!("Hi, {}", self.name);` in an `impl User` block. While correct for general Rust, `println!` does not work for on-chain output in NEAR contracts; `env::log_str` is used instead.
    - **Expected**: Add a note clarifying that `println!` is for off-chain Rust applications, and for smart contract logging, `env::log_str` (as used later in the actual contract code) is the appropriate function. This will prevent confusion for learners.

### `03-solver-contract.md` & `04-cross-contract-calls.md` & `05-deploy-to-testnet.md`

1.  **Placeholder Formatting in Shell Commands**:

    - **Issue**: Deployment and testing commands use account ID formats like `solver.your-account.testnet`, `yourname.testnet`, or `verifier.yourname.testnet`.
    - **Expected**: Consistently use the angle-bracket placeholder convention (e.g., `solver.<YOUR_ACCOUNT_ID>.testnet`, `<YOUR_ACCOUNT_ID>.testnet`) as specified in the `markdown-formatting.mdc` rule for all user-specific parts of commands.

2.  **Multi-line JSON in Shell Commands**:
    - **Issue**: Several `near call` commands embed multi-line JSON arguments within single quotes (e.g., in `04-cross-contract-calls.md` and `05-deploy-to-testnet.md`). This can be error-prone across different shell environments due to escaping and line break handling.
    - **Expected**: For better robustness and user experience:
      - Option A: Minify the JSON into a single line if it's short.
      - Option B (Recommended): Advise users to save the JSON arguments into a file (e.g., `intent_args.json`) and use the `--argsFile intent_args.json` option with `near call`. This is more reliable for complex JSON.
      - Option C: If keeping it inline, ensure it's tested on common shells (Bash, Zsh) or provide specific escaping instructions.

### `06-testing.md`

1.  **JavaScript Integration Test Configuration**:

    - **Issue**: `config.js` uses hardcoded account names like `verifier.your-account.testnet`.
    - **Expected**: Clearly comment that these are placeholders the user must replace with their actual deployed contract account IDs.

2.  **Key File Assumption in JS Tests**:

    - **Issue**: `near-connection.js` uses `fs.readFileSync(config.testUserKey)` assuming `your-account.testnet.json` exists. While common for developers, the origin of this key file (from `near login` or `~/.near-credentials`) isn't explicitly mentioned in this context.
    - **Expected**: Add a brief note reminding users where to find or how to generate the required key file for `config.testUserKey`.

3.  **`setTimeout` for Asynchronous Test Steps**:

    - **Issue**: The JS integration test `intent-integration.test.js` uses `await new Promise((resolve) => setTimeout(resolve, 5000));` to wait for asynchronous cross-contract calls to complete.
    - **Expected**: While a common workaround, this fixed delay can make tests flaky (too short) or slow (too long). Add a comment acknowledging this and suggest that for more robust testing, one might implement polling for the expected state change (e.g., repeatedly calling `solverContract.has_executed`) with a timeout, instead of a fixed delay.

4.  **Undefined Function in `testSolverCompetition` Example**:
    - **Issue**: The conceptual `testSolverCompetition` JS function calls `await solver.get_execution_result(...)`. The `Solver` contract implemented in `03-solver-contract.md` does not have a `get_execution_result` view method; its `solve_intent` method directly returns `ExecutionResult` (though in a real async cross-contract call, this result would come via a callback).
    - **Expected**: Either align the example with the existing `Solver` contract (e.g., by showing how to get the result from the promise resolution if `verify_and_solve` was designed to return it, or by querying state set by a callback) or add a note that `get_execution_result` is a hypothetical method the Solver would need for this test scenario.

### `07-gas-fees.md`

1.  **Mermaid Diagram Caption**:
    - **Issue**: The `flowchart TD` diagram illustrating Smart Wallet Architecture lacks a caption.
    - **Expected**: Add a descriptive caption below the diagram.
