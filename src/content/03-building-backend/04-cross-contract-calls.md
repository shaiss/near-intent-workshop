## Connecting Verifier to Solver (Cross-Contract Calls)

### Overview

Now that we have both the **Verifier** and **Solver** smart contracts implemented and deployed, we’ll connect them using a **cross-contract call**. This allows the Verifier to automatically delegate intent execution to a Solver after successful validation.

In NEAR, cross-contract calls are asynchronous and require defining an external contract interface using the `#[ext_contract]` macro.

---

### Step 1: Add the External Solver Interface

Inside your Verifier contract (`verifier/src/lib.rs`), add the following import and external trait at the top of the file:

```rust
use near_sdk::ext_contract;

#[ext_contract(ext_solver)]
trait Solver {
    fn solve_intent(&self, intent_id: String, user: AccountId, input_amount: u128) -> Promise;
}
```

This defines the `solve_intent` function interface on the remote Solver contract.

---

### Step 2: Add `verify_and_solve` Method

Add the new method to your existing `#[near_bindgen] impl Verifier` block:

```rust
#[near_bindgen]
impl Verifier {
    pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
        // First verify the intent
        assert!(self.verify_intent(intent.clone()), "Intent verification failed");

        // Delegate execution to solver via cross-contract call
        ext_solver::solve_intent(
            intent.id,
            intent.user_account.parse().expect("Invalid user_account format"),
            intent.input_amount,
            solver_account, // Account ID of the deployed Solver contract
            0,              // No deposit
            5_000_000_000_000 // Gas allocation
        )
    }
}
```

This new `verify_and_solve` method allows you to send a full intent and a solver's contract address, and automatically trigger fulfillment if the intent is valid.

---

### Step 3: Deploy and Test

After adding this logic:

- **Rebuild the verifier contract**:

```bash
cargo build --target wasm32-unknown-unknown --release
```

- **Deploy the updated verifier**:

```bash
near deploy --accountId verifier.yourname.testnet \
  --wasmFile ./target/wasm32-unknown-unknown/release/verifier.wasm
```

- **Call the new method** from CLI or frontend:

```bash
near call verifier.yourname.testnet verify_and_solve '{
  "intent": {
    "id": "intent-123",
    "user_account": "alice.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 1000,
    "output_token": "NEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  },
  "solver_account": "solver.yourname.testnet"
}' --accountId alice.testnet
```

---

### Best Practices

- Ensure the `Intent` struct is consistent between Verifier and Solver contracts.
- Handle failed promise resolutions with callbacks (covered in future sections).
- Use NEAR Explorer to debug logs and view cross-contract traces.

---

In the next section, we’ll simulate real-world scenarios using testnet transactions to validate end-to-end flows across both contracts.
