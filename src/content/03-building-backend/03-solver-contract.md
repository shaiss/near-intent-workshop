# 3.3: The Solver Contract - Fulfilling User Intents

In the [previous section](mdc:./02-intent-verifier.md), we built a Verifier contract that validates intents and initiates cross-contract calls. Now, we'll implement the **Solver** contract - the component that actually executes the user's intent.

## Solvers - The Intent Execution Engines

Solvers are the workhorses of the intent architecture. In Web2 terms, they're similar to specialized service providers that execute business logic based on validated requests. Where Verifiers act as gatekeepers/validators, Solvers are the action-takers.

Solvers handle these key responsibilities:

1. **Take verified intents from the verifier**: Receive intent details through cross-contract calls.
2. **Execute the necessary actions**: Interact with decentralized exchanges (DEXs), lending protocols, or other contracts to fulfill the intent.
3. **Report the results back**: Return execution details including success/failure, output amounts, and fees.
4. **Compete with other solvers for the best execution**: In a mature intent system, multiple solvers compete to provide the best execution (lowest fees, best rates) for users. This competition happens either through dedicated auction mechanisms or by monitoring a public list of verified intents and submitting execution proposals to the Verifier or user's Smart Wallet.

## Setting Up a Solver Contract Project

Let's create a new Rust project for our Solver contract:

```bash
cd contracts  # Navigate to the contracts directory
cargo new --lib solver --vcs none  # Create a new library, without version control
cd solver  # Navigate into the new project
```

Update the `Cargo.toml` file with the necessary dependencies:

```toml
[package]
name = "solver"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
near-sdk = "4.0.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## Implementing a Basic Solver Contract

Now, let's implement the solver in `src/lib.rs`. Note the similarities and differences compared to our Verifier contract:

```rust
use near_sdk::{env, near_bindgen, AccountId, Promise, Balance, serde::{Deserialize, Serialize}};

// A Solver contract that executes intents that have been verified
#[near_bindgen]
#[derive(Default)]
pub struct Solver {
    pub owner_id: AccountId,           // Account that can perform administrative actions
    pub execution_fee: Balance,        // Fee charged by this solver (in basis points, 1bp = 0.01%)
                                      // Balance is a NEAR SDK type alias for u128, used for token amounts
    pub executions: Vec<String>,       // Track executed intent IDs (in production, would use more efficient collection)
}

// Structure to represent the result of executing an intent
// This is returned to the calling contract (Verifier) and/or stored for later retrieval
#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ExecutionResult {
    pub intent_id: String,       // Which intent was executed
    pub success: bool,           // Whether the execution was successful
    pub output_amount: Balance,  // How many tokens were received/produced
    pub fee_amount: Balance,     // How much fee was charged
}

#[near_bindgen]
impl Solver {
    // Initialization function, called once when deploying the contract
    #[init]
    pub fn new(owner_id: AccountId, execution_fee: Balance) -> Self {
        Self {
            owner_id,
            execution_fee,  // Fee in basis points (e.g., 20 = 0.2%)
            executions: Vec::new(),
        }
    }

    // Main function that will be called by the Verifier
    // In a real-world Solver, this would initiate a series of cross-contract calls
    // to external protocols to fulfill the intent, and would return a Promise
    // For this example, we'll simulate the execution synchronously
    pub fn solve_intent(&mut self, intent_id: String, user: AccountId, input_amount: Balance) -> ExecutionResult {
        // Log the execution (similar to console.log in JavaScript)
        env::log_str(&format!("Executing intent {} for user {}", intent_id, user));

        // Calculate fees (in a real scenario this would be more complex)
        // execution_fee is in basis points (1/100th of a percent)
        let fee_amount = (input_amount * self.execution_fee) / 10_000;
        let actual_input = input_amount - fee_amount;

        // Simulate a swap with 3% slippage from expected rate
        // Note: In production contracts, floating-point calculations like this should be avoided
        // due to precision issues. Fixed-point libraries or integer-based calculations are preferred
        // for financial operations to ensure deterministic behavior.
        let expected_rate = 10; // 10 output tokens per input token
        let actual_rate = 9.7;  // 3% worse than expected

        // Convert to floating point for the calculation, then back to u128
        // This is a simplification - production code would use safer arithmetic
        let output_amount = (actual_input as f64 * actual_rate) as u128;

        // Record the execution in our contract state
        self.executions.push(intent_id.clone());

        // Return the execution result
        // In a real cross-contract scenario, this would likely be returned
        // via a callback to the calling contract (the Verifier)
        ExecutionResult {
            intent_id,
            success: true,
            output_amount,
            fee_amount,
        }
    }

    // Helper view method to check if an intent has been executed
    // View methods are read-only (take &self, not &mut self)
    pub fn has_executed(&self, intent_id: String) -> bool {
        self.executions.contains(&intent_id)
    }

    // Getter for current fee (view method)
    pub fn get_fee(&self) -> Balance {
        self.execution_fee
    }

    // Admin method to update the fee
    pub fn set_fee(&mut self, new_fee: Balance) {
        // Access control - only the owner can change the fee
        assert_eq!(
            env::predecessor_account_id(),
            self.owner_id,
            "Only owner can set fee"
        );
        self.execution_fee = new_fee;
    }
}
```

### Key Aspects of the Solver Implementation

1. **State Management**:

   - `owner_id`: For administrative access control (similar to the Verifier)
   - `execution_fee`: The fee this Solver charges (in basis points)
   - `executions`: A simple list of executed intent IDs (in production, would use `UnorderedSet` or another optimized collection)

2. **ExecutionResult Structure**:

   - Represents the outcome of an intent execution
   - In our simplified example, it's returned directly from `solve_intent`
   - In a production environment with asynchronous cross-contract calls, this might be:
     - Returned as part of a callback mechanism
     - Stored in contract state for later retrieval
     - Emitted in logs for off-chain monitoring

3. **`solve_intent` Method**:

   - This is the method called by the Verifier's `verify_and_solve` function via a cross-contract call
   - Our simplified implementation:
     - Calculates a fee based on the input amount and the configured fee rate
     - Simulates a token swap with some price slippage
     - Returns results immediately (synchronously)

4. **Administrative Functions**:
   - `set_fee`: Allows the owner to adjust the fee rate
   - Demonstrates proper access control with `assert_eq!(env::predecessor_account_id(), self.owner_id, ...)`

## Real-World Solver Implementation Considerations

In a production environment, Solvers are significantly more complex. A real-world Solver would implement:

1. **Direct DEX Integration**: Call specific DEX contracts on NEAR or other chains to execute trades.

2. **Multi-hop Routing**: Find optimal paths across multiple liquidity sources to get the best rates for users.

3. **Liquidity Aggregation**: Combine liquidity from multiple sources to minimize slippage and improve execution.

4. **MEV Protection**: Prevent value extraction by validators. MEV (Maximal Extractable Value) refers to profit that can be made by reordering, inserting, or censoring transactions within a block, which may harm users through front-running or other techniques.

5. **Failure Recovery**: Handle partial executions, failed transactions, and provide rollback mechanisms.

### Example of a More Realistic Swap Implementation

Here's how a more realistic cross-contract swap might look:

```rust
// This method initiates a token swap on a DEX
// It returns a Promise because this is an asynchronous cross-contract call
pub fn execute_swap(&self,
    from_token: AccountId,
    to_token: AccountId,
    amount: Balance,
    min_return: Balance
) -> Promise {
    // Call a DEX contract to perform the swap
    ext_dex::swap(
        from_token,
        to_token,
        amount,
        min_return,
        dex_contract_id,          // The DEX contract address
        1,                        // Attached deposit of 1 yoctoNEAR
                                 // This tiny deposit (smallest unit of NEAR) is a security
                                 // practice to prevent unintended function calls
        20_000_000_000_000        // Gas allocation (20 TGas)
                                 // Enough to cover the cross-contract execution
    )
    // We could add a callback to handle the result
    .then(ext_self::on_swap_complete(
        env::current_account_id(),
        5_000_000_000_000       // Gas for the callback
    ))
}

// Callback function to handle the result of the swap
#[private] // Only callable by the contract itself
pub fn on_swap_complete(&mut self) -> ExecutionResult {
    // Process the swap results
    // Update contract state
    // Return the final execution result
    // ...
}
```

This pattern of making a cross-contract call and then handling the result in a callback is similar to how you'd make an asynchronous API call in a Web2 backend (like Node.js) and handle the response when it arrives.

## Solver Competition Mechanism: An Open Market for Intent Execution

In a mature intent-centric system, multiple Solvers compete to provide the best execution for users. This creates an efficient market that drives down costs and improves execution quality.

Here's how this competition typically works:

1. **Intent Broadcasting**: Verified intents are made available to multiple Solvers, either:

   - Through a public intent pool or marketplace contract
   - By direct queries to the Verifier contract
   - Via off-chain indexing of on-chain intent events

2. **Solver Bidding**: Solvers analyze each intent and calculate:

   - Whether they can fulfill it
   - What rate/output they can provide
   - What fee they will charge
   - The estimated gas cost of execution

3. **Selection Process**: The best Solver is selected either:
   - Automatically by the Verifier using predefined criteria
   - By the user's Smart Wallet based on preferences
   - Through an auction mechanism where Solvers submit bids
4. **Intent Execution**: The winning Solver executes the intent and receives compensation (usually a portion of the output tokens or a fee).

This competition creates a Web3 service marketplace similar to how ride-sharing apps match drivers to riders, but in a permissionless, transparent, and decentralized manner. Instead of a centralized platform taking a cut, the protocol facilitates direct transactions between users and Solvers.

## Building and Deploying Your Solver

Compile the solver contract:

```bash
cargo build --target wasm32-unknown-unknown --release
```

Deploy to NEAR testnet, specifying the initialization function and arguments:

```bash
near deploy --accountId solver.your-account.testnet \
  --wasmFile ./target/wasm32-unknown-unknown/release/solver.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "your-account.testnet", "execution_fee": 20}'
```

The `--initFunction new` parameter tells NEAR to call the `new` function immediately after deployment to initialize the contract state. The `--initArgs` parameter provides the JSON-formatted arguments for this initialization.

In this case, we're:

- Setting the `owner_id` to your account
- Setting the `execution_fee` to 20 basis points (0.2%)

## Connecting the Verifier and Solver

For our system to work, the Verifier needs to know how to call the Solver. The `verify_and_solve` method we implemented in the previous section does exactly this:

```rust
pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
    // First verify the intent
    assert!(self.verify_intent(intent.clone()), "Intent verification failed");

    // Then call the solver
    ext_solver::solve_intent(
        intent.id,
        intent.user_account.parse().unwrap(),
        intent.input_amount,
        solver_account,        // Contract to call (the solver's account ID)
        0,                     // Amount of NEAR to attach
        5_000_000_000_000      // Gas
    )
}
```

With both contracts deployed, a complete intent flow would involve:

1. A user submitting an intent to the Verifier
2. The Verifier validating the intent
3. The Verifier calling the Solver
4. The Solver executing the intent
5. Results being reported back to the user (directly or via the Verifier)

## Next Steps

You've now implemented both the Verifier and Solver contracts! These form the core backend infrastructure of your intent-based application. In the next section, [3.4 Cross-Contract Calls](mdc:./04-cross-contract-calls.md), we'll dive deeper into the asynchronous nature of contract interactions in NEAR and implement more sophisticated callback patterns to handle complex intent execution flows.
