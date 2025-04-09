
# Solver Contract Development

## Understanding Solvers

Solvers are the workhorses of the intent system. They:

1. Take verified intents from the verifier
2. Execute the necessary actions to fulfill those intents
3. Report the results back to users and the verifier
4. Compete with other solvers for the best execution

## Creating a Basic Solver

Let's implement a simple solver contract:

```bash
cd contracts
cargo new --lib solver --vcs none
cd solver
```

Update the `Cargo.toml` file:

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

Now, let's implement the solver in `src/lib.rs`:

```rust
use near_sdk::{env, near_bindgen, AccountId, Promise, Balance, serde::{Deserialize, Serialize}};

#[near_bindgen]
#[derive(Default)]
pub struct Solver {
    pub owner_id: AccountId,
    pub execution_fee: Balance, // Fee charged by this solver
    pub executions: Vec<String>, // Track executed intents
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ExecutionResult {
    pub intent_id: String,
    pub success: bool,
    pub output_amount: Balance,
    pub fee_amount: Balance,
}

#[near_bindgen]
impl Solver {
    #[init]
    pub fn new(owner_id: AccountId, execution_fee: Balance) -> Self {
        Self {
            owner_id,
            execution_fee,
            executions: Vec::new(),
        }
    }
    
    pub fn solve_intent(&mut self, intent_id: String, user: AccountId, input_amount: Balance) -> ExecutionResult {
        // In a real solver, this would:
        // 1. Call DEX/protocol contracts to execute the requested swap/action
        // 2. Track execution progress
        // 3. Handle failures and retries
        
        // For demo purposes, we just simulate a successful execution
        env::log_str(&format!("Executing intent {} for user {}", intent_id, user));
        
        // Calculate fees (in a real scenario this would be more complex)
        let fee_amount = (input_amount * self.execution_fee) / 10_000; // fee in basis points
        let actual_input = input_amount - fee_amount;
        
        // Simulate a swap with 3% slippage from expected rate
        let expected_rate = 10; // 10 output tokens per input token
        let actual_rate = 9.7; // 3% worse than expected
        let output_amount = (actual_input as f64 * actual_rate) as u128;
        
        // Record the execution
        self.executions.push(intent_id.clone());
        
        ExecutionResult {
            intent_id,
            success: true,
            output_amount,
            fee_amount,
        }
    }
    
    pub fn has_executed(&self, intent_id: String) -> bool {
        self.executions.contains(&intent_id)
    }
    
    pub fn get_fee(&self) -> Balance {
        self.execution_fee
    }
    
    pub fn set_fee(&mut self, new_fee: Balance) {
        assert_eq!(env::predecessor_account_id(), self.owner_id, "Only owner can set fee");
        self.execution_fee = new_fee;
    }
}
```

## Building More Advanced Solvers

Real-world solvers would implement:

1. **Direct DEX Integration**: Call specific DEX contracts to execute trades
2. **Multi-hop Routing**: Find optimal paths across multiple liquidity sources
3. **Liquidity Aggregation**: Combine liquidity from multiple sources
4. **MEV Protection**: Prevent value extraction by miners/validators
5. **Failure Recovery**: Handle partial executions and rollbacks

Example of a more advanced swap implementation:

```rust
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
        dex_contract_id, // The DEX contract address
        1, // Attached deposit of 1 yoctoNEAR for security
        20_000_000_000_000 // Gas
    )
}
```

## Building and Deploying the Solver

Compile the solver contract:

```bash
cargo build --target wasm32-unknown-unknown --release
```

Deploy to NEAR testnet:

```bash
near deploy --accountId solver.your-account.testnet --wasmFile ./target/wasm32-unknown-unknown/release/solver.wasm --initFunction new --initArgs '{"owner_id": "your-account.testnet", "execution_fee": 20}'
```

## Solver Competition Mechanism

In a complete intent system, multiple solvers can compete:

1. Solvers observe intents from a shared pool
2. Each solver proposes their execution plan
3. The best offer (lowest fee, best execution price) wins
4. The winner gets to execute the intent

This competition drives efficiency and better prices for users.

In the next section, we'll explore how to test your intent contracts to ensure they work correctly.
