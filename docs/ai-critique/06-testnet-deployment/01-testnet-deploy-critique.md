# Critique for 06-testnet-deployment/01-testnet-deploy.md (Web2 dev perspective)

## Overall Impression

This section provides a clear, step-by-step guide to deploying the Verifier and Solver contracts to the NEAR testnet. It covers prerequisites, creating subaccounts (a good practice), deploying, and initializing contracts. This is a crucial practical step, analogous to deploying to a staging environment in Web2.

## What Doesn't Work / Needs Clarification

1.  **Prerequisites**: Clear and refers back to earlier setup.

2.  **Creating Dedicated Subaccounts**:

    - **Critique**: Recommending subaccounts (`verifier.yourname.testnet`, `solver.yourname.testnet`) is excellent for organization and mirrors real-world deployment patterns where different services might have their own identities.
    - **Suggestion**: Briefly mention _why_ `near create-account` requires the `--masterAccount` to have funds (for the subaccount's initial storage). "Your main account `yourname.testnet` will fund the creation of these subaccounts, covering their initial storage costs on the network."

3.  **Deploying the Verifier Contract / Deploying the Solver Contract**:

    - **Critique**: The `near deploy` commands are shown. Paths to WASM files (`./contracts/verifier/...`) are given.
    - **Suggestion**:
      - **Missing Initialization in `deploy`**: The critique for `03-building-backend/05-deploy-to-testnet.md` highlighted that `near deploy` can take `--initFunction` and `--initArgs` to deploy _and_ initialize in one step. This section separates deployment and initialization into two steps (`near deploy` then `near call ... new`). While both approaches work, using the `deploy --initFunction ...` pattern is often cleaner and ensures the contract is initialized atomically with deployment.
        - If the two-step approach is preferred for pedagogical reasons (to show `near call` for initialization explicitly), then it's fine, but it might be worth mentioning the combined option as an alternative: "Alternatively, `near deploy` can initialize the contract in the same command using the `--initFunction` and `--initArgs` flags, which can be useful to ensure atomic deployment and initialization."
      - **WASM File Paths**: The paths `./contracts/verifier/...` assume the commands are run from the project root, one level above the `contracts` directory which itself contains `verifier` and `solver` subdirectories. This should be explicitly stated: "Ensure these commands are run from your main project root directory."

4.  **Initializing Your Contracts (If Required)**:

    - **Critique**: Shows `near call ... new '...'` for both Verifier and Solver. This is correct if initialization is done separately.
    - **Suggestion**:
      - **Verifier `new` args**: `'{"owner_id": "yourname.testnet"}'` matches the Verifier contract. Good.
      - **Solver `new` args**: `'{"verifier_account": "verifier.yourname.testnet"}'`. This is problematic because the Solver contract defined in `03-building-backend/03-solver-contract.md` has `pub fn new(owner_id: AccountId, execution_fee: Balance) -> Self`. It does _not_ take a `verifier_account` argument in its `new` method, nor does it store it. It takes `owner_id` and `execution_fee`. This initialization call will fail or not set up the Solver as intended.
        - **This is a critical inconsistency.** The `initArgs` for the Solver must match its actual `new` method signature. E.g., `near call solver.yourname.testnet new '{"owner_id": "yourname.testnet", "execution_fee": 20}' --accountId yourname.testnet` (using `20` as an example fee).
      - `--accountId yourname.testnet`: This correctly specifies who is paying for the initialization call.

5.  **Verifying Successful Deployment**:

    - **Critique**: Suggests `near view-state` and checking NEAR Explorer.
    - **Suggestion**: Good methods. For `near view-state`, briefly mention what the user might look for in the output (e.g., seeing the contract's code hash, and if state was initialized, seeing some initial state variables if they are simple enough to be displayed directly).

6.  **Next Steps**: Clear and logical follow-up actions.

## How to Present Content Better for a Web2 Developer

1.  **Consistency in Initialization**: The most critical fix is to ensure the `near call ... new` arguments for the Solver match its Rust `new` method signature. Using incorrect initialization arguments will prevent the contract from being set up correctly.
2.  **Clarify Deployment Path**: Be explicit about the current working directory when running `near deploy` commands so that relative paths to WASM files are correct.
3.  **One-Step vs. Two-Step Deployment/Initialization**: If sticking with separate `deploy` and `call new` steps, briefly acknowledge the combined `deploy --initFunction` option as an alternative for efficiency.
4.  **Subaccount Rationale**: Reinforce why subaccounts are a good pattern (e.g., for separate logical services, easier permissioning if one contract needs to call another with its own identity, resource management).
5.  **Troubleshooting Deployment**: Briefly mention common deployment/initialization issues and how to debug: incorrect account IDs, insufficient balance in the deploying account for storage, WASM file not found, init arguments not matching contract signature, or contract panicking during initialization.

This section is fundamental for getting the developed backend contracts onto a live (test) network. Ensuring the deployment and initialization commands are accurate and match the previously developed contract code is paramount for student success and avoiding frustration.
