
# Intent Verifier Implementation

## Understanding the Verifier's Role

The Intent Verifier is a critical component in the intent architecture. Its primary responsibilities are:

1. **Validate intent format**: Ensure the intent follows the required structure
2. **Verify constraints**: Check that the intent's constraints (slippage, deadlines, etc.) are reasonable
3. **Authenticate user**: Confirm the intent is coming from an authorized user
4. **Check feasibility**: Determine if the intent can be fulfilled in principle

## Expanding the Verifier Contract

Let's enhance our basic verifier implementation:

```rust
use near_sdk::{env, near_bindgen, AccountId, Promise, serde::{Deserialize, Serialize}};

#[near_bindgen]
#[derive(Default)]
pub struct Verifier {
    pub owner_id: AccountId,
    pub verified_intents: Vec<String>, // Store intent IDs for demo purposes
}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Intent {
    pub id: String,
    pub user_account: String,
    pub action: String,
    pub input_token: String,
    pub input_amount: u128,
    pub output_token: String,
    pub min_output_amount: Option<u128>,
    pub max_slippage: f64,
    pub deadline: Option<u64>,
}

#[near_bindgen]
impl Verifier {
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            verified_intents: Vec::new(),
        }
    }
    
    pub fn verify_intent(&mut self, intent: Intent) -> bool {
        // Basic validation
        assert!(intent.input_amount > 0, "Input amount must be greater than 0");
        assert!(intent.max_slippage >= 0.0 && intent.max_slippage <= 100.0, "Invalid slippage percentage");
        
        // Check deadline if provided
        if let Some(deadline) = intent.deadline {
            let current_timestamp = env::block_timestamp();
            assert!(deadline > current_timestamp, "Intent has expired");
        }
        
        // Log verification details
        env::log_str(&format!("Intent verified: {}", intent.id));
        
        // Store intent ID as verified
        self.verified_intents.push(intent.id);
        
        true
    }
    
    pub fn is_intent_verified(&self, intent_id: String) -> bool {
        self.verified_intents.contains(&intent_id)
    }
}
```

## Testing the Verifier

We can add tests to ensure our verifier is working correctly:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    #[test]
    fn test_verify_valid_intent() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        
        let mut contract = Verifier::new(accounts(0));
        
        let intent = Intent {
            id: "test-intent-1".to_string(),
            user_account: accounts(1).to_string(),
            action: "swap".to_string(),
            input_token: "USDC".to_string(),
            input_amount: 1000,
            output_token: "NEAR".to_string(),
            min_output_amount: Some(95),
            max_slippage: 0.5,
            deadline: None,
        };
        
        assert!(contract.verify_intent(intent));
        assert!(contract.is_intent_verified("test-intent-1".to_string()));
    }
}
```

## Linking Verifier to Solver

The real power comes when we connect our verifier to solvers. Here's how to set up cross-contract calls:

```rust
#[ext_contract(ext_solver)]
trait Solver {
    fn solve_intent(&self, intent_id: String, user: AccountId, input_amount: u128) -> Promise;
}

#[near_bindgen]
impl Verifier {
    // Add this method to the existing implementation
    pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
        // First verify the intent
        assert!(self.verify_intent(intent.clone()), "Intent verification failed");
        
        // Then call the solver
        ext_solver::solve_intent(
            intent.id,
            intent.user_account.parse().unwrap(),
            intent.input_amount,
            solver_account, // contract to call
            0, // no attached deposit
            5_000_000_000_000 // gas
        )
    }
}
```

## Deployment Considerations

When deploying your verifier contract:

1. Make sure to initialize it with the correct owner
2. Consider gas costs for cross-contract calls
3. Implement proper access control for sensitive operations
4. Add proper error handling and recovery mechanisms

In the next section, we'll build a solver contract that can fulfill the intents verified by our contract.
