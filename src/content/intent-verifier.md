
# Intent Verifier

## What is an Intent Verifier?

An Intent Verifier is a smart contract that:
- Validates the structure and content of an intent
- Ensures the intent can be executed legally
- Confirms the user has the necessary permissions
- Stores the verified intent for solvers to pick up

## Basic Verifier Structure

```rust
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::{env, near_bindgen, AccountId, Balance, Promise};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct IntentVerifier {
    pub owner_id: AccountId,
    pub intents: UnorderedMap<String, Intent>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct Intent {
    pub creator: AccountId,
    pub action: String,
    pub input: String,
    pub output: String,
    pub constraints: String,
    pub status: IntentStatus,
    pub created_at: u64,
}

#[derive(BorshDeserialize, BorshSerialize, PartialEq)]
pub enum IntentStatus {
    Pending,
    Executed,
    Cancelled,
    Expired,
}

#[near_bindgen]
impl IntentVerifier {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            intents: UnorderedMap::new(b"i"),
        }
    }

    pub fn submit_intent(&mut self, action: String, input: String, output: String, constraints: String) -> String {
        // Validation logic here
        let intent_id = env::sha256(format!("{}{}{}{}{}", 
            env::signer_account_id(), 
            action, 
            input,
            output,
            env::block_timestamp()
        ).as_bytes());
        
        let intent = Intent {
            creator: env::signer_account_id(),
            action,
            input,
            output,
            constraints,
            status: IntentStatus::Pending,
            created_at: env::block_timestamp(),
        };
        
        self.intents.insert(&hex::encode(&intent_id), &intent);
        hex::encode(&intent_id)
    }
    
    pub fn get_intent(&self, intent_id: String) -> Option<Intent> {
        self.intents.get(&intent_id)
    }
    
    // Other verifier methods will be added here
}
```

## Validation Logic

The core of the verifier is its validation logic, which should:

1. Verify the intent structure is correct
2. Check that constraints are reasonable
3. Ensure the user has sufficient balance for the operation
4. Validate any permissions required

Example validation for a swap intent:

```rust
fn validate_swap_intent(&self, input: &str, output: &str, constraints: &str) -> bool {
    let input_data: InputToken = serde_json::from_str(input).unwrap();
    let output_data: OutputToken = serde_json::from_str(output).unwrap();
    let constraints_data: SwapConstraints = serde_json::from_str(constraints).unwrap();
    
    // Check input token exists
    // Verify user has enough balance
    // Validate output token exists
    // Check if slippage is reasonable
    // Verify deadline is in the future
    
    true // Return validation result
}
```

## Intent Storage

Verified intents need to be stored for solvers to access:

```rust
pub fn get_pending_intents(&self) -> Vec<(String, Intent)> {
    self.intents
        .iter()
        .filter(|(_, intent)| intent.status == IntentStatus::Pending)
        .collect()
}
```

## Intent Status Management

The verifier also manages the lifecycle of intents:

```rust
pub fn mark_intent_executed(&mut self, intent_id: String) {
    // Only callable by approved solvers
    assert!(self.is_approved_solver(env::predecessor_account_id()), "Not an approved solver");
    
    let mut intent = self.intents.get(&intent_id).expect("Intent not found");
    assert!(intent.status == IntentStatus::Pending, "Intent is not pending");
    
    intent.status = IntentStatus::Executed;
    self.intents.insert(&intent_id, &intent);
}

pub fn cancel_intent(&mut self, intent_id: String) {
    // Only callable by intent creator
    let intent = self.intents.get(&intent_id).expect("Intent not found");
    assert!(intent.creator == env::predecessor_account_id(), "Not intent creator");
    assert!(intent.status == IntentStatus::Pending, "Intent is not pending");
    
    intent.status = IntentStatus::Cancelled;
    self.intents.insert(&intent_id, &intent);
}
```

## Solver Management

The verifier needs to manage which solvers are allowed to execute intents:

```rust
pub fn add_solver(&mut self, solver_id: AccountId) {
    assert!(env::predecessor_account_id() == self.owner_id, "Not owner");
    self.approved_solvers.insert(&solver_id);
}

pub fn remove_solver(&mut self, solver_id: AccountId) {
    assert!(env::predecessor_account_id() == self.owner_id, "Not owner");
    self.approved_solvers.remove(&solver_id);
}

pub fn is_approved_solver(&self, solver_id: AccountId) -> bool {
    self.approved_solvers.contains(&solver_id)
}
```
