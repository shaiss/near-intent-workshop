
# Solver Contract

## What is a Solver?

A Solver is a specialized entity that:
- Monitors the verifier for pending intents
- Calculates execution strategies for intents
- Executes transactions to fulfill intents
- Reports execution results back to the verifier

## Basic Solver Structure

```rust
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen, AccountId, Promise};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Solver {
    pub owner_id: AccountId,
    pub verifier_id: AccountId,
}

#[near_bindgen]
impl Solver {
    #[init]
    pub fn new(owner_id: AccountId, verifier_id: AccountId) -> Self {
        Self {
            owner_id,
            verifier_id,
        }
    }
    
    pub fn solve_intent(&mut self, intent_id: String) -> Promise {
        assert!(env::predecessor_account_id() == self.owner_id, "Not owner");
        
        // 1. Get intent details from verifier
        // 2. Calculate execution strategy
        // 3. Execute transactions
        // 4. Report results back to verifier
        
        // This is a simplified example - actual implementation would be more complex
        Promise::new(self.verifier_id.clone())
            .function_call(
                "mark_intent_executed".to_string(),
                json!({ "intent_id": intent_id }).to_string().into_bytes(),
                0,
                env::prepaid_gas() / 2
            )
    }
}
```

## Solver Operation Modes

Solvers can operate in different modes:

1. **Reactive Mode**
   - Poll the verifier for new intents
   - Process intents on-demand

2. **Proactive Mode**
   - Subscribe to intent submission events
   - Process intents as soon as they arrive

3. **Batch Mode**
   - Collect multiple intents
   - Execute them together for efficiency

## Execution Strategy Calculation

The core of a solver is its strategy calculation:

```rust
fn calculate_execution_strategy(&self, intent: Intent) -> ExecutionStrategy {
    match intent.action.as_str() {
        "swap" => self.calculate_swap_strategy(&intent),
        "bridge" => self.calculate_bridge_strategy(&intent),
        "stake" => self.calculate_stake_strategy(&intent),
        _ => ExecutionStrategy::Unsupported,
    }
}

fn calculate_swap_strategy(&self, intent: &Intent) -> ExecutionStrategy {
    // Parse input and output tokens
    let input_token = serde_json::from_str::<InputToken>(&intent.input).unwrap();
    let output_token = serde_json::from_str::<OutputToken>(&intent.output).unwrap();
    
    // Check available DEXes
    // Calculate prices on each DEX
    // Find the best execution path
    // Return execution plan
    
    ExecutionStrategy::Swap {
        dex: "ref.finance.near".to_string(),
        path: vec![input_token.token, "wrap.near".to_string(), output_token.token],
        expected_output: "12.5".to_string(),
    }
}
```

## Transaction Execution

Solvers need to execute transactions to fulfill intents:

```rust
fn execute_swap(&self, strategy: SwapStrategy, intent: Intent) -> Promise {
    // Create the transaction to execute the swap
    Promise::new(strategy.dex)
        .function_call(
            "swap".to_string(),
            json!({
                "token_in": strategy.path[0],
                "token_out": strategy.path[strategy.path.len() - 1],
                "amount_in": intent.input.amount,
                "min_amount_out": intent.output.min_amount,
            }).to_string().into_bytes(),
            1, // Attach deposit if needed
            env::prepaid_gas() / 2
        )
        .then(
            Promise::new(self.verifier_id.clone())
                .function_call(
                    "mark_intent_executed".to_string(),
                    json!({ "intent_id": intent_id }).to_string().into_bytes(),
                    0,
                    env::prepaid_gas() / 4
                )
        )
}
```

## Competition and MEV

Solvers compete with each other to execute intents:

1. **Price Competition**
   - Better prices attract more users
   - Reputation systems favor efficient solvers

2. **Speed Competition**
   - Faster execution may be preferred for time-sensitive operations
   - Miners/validators may prioritize higher fee transactions

3. **MEV Considerations**
   - Solvers can extract value through ordering
   - Fair sequencing services can mitigate MEV
