# The Intent Verifier - Building a Full-Featured Contract

In the [previous section](mdc:./01-local-contract.md), we created a basic Verifier contract. Now, we'll enhance it with proper state management, robust validation logic, testing capabilities, and crucially, the ability to interact with other contracts on the blockchain.

## Evolving the Verifier's Role in Our Architecture

Let's first revisit and expand on the core responsibilities of the Intent Verifier, which forms a critical trust layer in our intent-centric architecture:

1. **Validate intent format**: Ensure the intent follows the required structure and contains all necessary fields.
2. **Verify constraints**: Check that the intent's constraints (slippage, deadlines, etc.) are reasonable and within acceptable bounds.
3. **Authenticate user**: Confirm the intent is coming from an authorized user by checking if the transaction signer matches the claimed user account in the intent or by validating a signature. _This is comparable to verifying a JWT token in a Web2 backend API._
4. **Check feasibility**: Determine if the intent is conceptually capable of being fulfilled - for example, ensuring the requested tokens exist, checking that requested amounts are reasonable, or verifying that there are registered Solvers that handle this type of intent. _This is a preliminary check that doesn't execute the intent but assesses if it could potentially succeed._

## Expanding the Verifier Contract with State Management

Let's enhance our basic implementation by adding state management, intent tracking, and more comprehensive validation. Here's the expanded contract:

```rust
use near_sdk::{env, near_bindgen, AccountId, Promise, BorshStorageKey, borsh::{self, BorshDeserialize, BorshSerialize}, serde::{Deserialize, Serialize}};
use near_sdk::collections::{LookupMap, UnorderedSet};

// This macro generates serialization/deserialization code for storage keys enum
#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    VerifiedIntents,
}

// Our contract, now with state fields for tracking ownership and verified intents
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Verifier {
    // The account that can perform admin operations
    pub owner_id: AccountId,

    // In our previous version, we used Vec<String> for simplicity
    // Now we're using a more efficient data structure for production use cases
    // LookupMap is a key-value store optimized for O(1) lookups
    pub verified_intents: UnorderedSet<String>,
}

// Default initialization - required by NEAR SDK if we don't use #[derive(Default)]
impl Default for Verifier {
    fn default() -> Self {
        panic!("Verifier should be initialized with owner_id")
    }
}

// The Intent structure - evolved from the basic version with additional fields
#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Intent {
    pub id: String,                    // Unique identifier for this intent
    pub user_account: String,          // The NEAR account ID of the intent originator
    pub action: String,                // Type of intent (e.g., "swap", "transfer")
    pub input_token: String,           // Token the user is providing
    pub input_amount: u128,            // Amount of the input token
    pub output_token: String,          // Token the user wants to receive
    pub min_output_amount: Option<u128>, // Minimum acceptable output (optional)
    pub max_slippage: f64,             // Maximum acceptable price slippage (%)
    pub deadline: Option<u64>,         // Optional: Unix timestamp in nanoseconds (NEAR's block timestamp format)
                                      // after which the intent is no longer valid
}

#[near_bindgen]
impl Verifier {
    // #[init] marks this function as the initialization method for the contract
    // It's called once during deployment to set up the initial state
    #[init]
    pub fn new(owner_id: AccountId) -> Self {
        Self {
            owner_id,
            // Create a new empty set with a unique storage prefix
            verified_intents: UnorderedSet::new(StorageKey::VerifiedIntents),
        }
    }

    // verify_intent now takes &mut self instead of &self because we modify
    // contract state by adding to verified_intents
    pub fn verify_intent(&mut self, intent: Intent) -> bool {
        // Basic validation using assert! which will panic (revert the transaction)
        // if the condition is false
        assert!(intent.input_amount > 0, "Input amount must be greater than 0");
        assert!(intent.max_slippage >= 0.0 && intent.max_slippage <= 100.0,
                "Invalid slippage percentage");

        // Check deadline if provided - an expired intent should be rejected
        if let Some(deadline) = intent.deadline {
            // env::block_timestamp() gets the current NEAR blockchain timestamp
            let current_timestamp = env::block_timestamp();
            assert!(deadline > current_timestamp, "Intent has expired");
        }

        // Authentication check - verify the transaction signer is the intent user
        // In a real implementation, we'd validate signatures or permissions more rigorously
        let caller = env::predecessor_account_id();
        let user_account = intent.user_account.parse::<AccountId>().expect("Invalid account ID");
        assert!(caller == user_account, "Unauthorized: caller doesn't match intent.user_account");

        // Log verification details (similar to console.log in JavaScript)
        env::log_str(&format!("Intent verified: {}", intent.id));

        // Store intent ID as verified in our persistent storage
        self.verified_intents.insert(&intent.id);

        true
    }

    // View method (doesn't modify state, so it takes &self not &mut self)
    // This makes it cheaper to call as it doesn't write to the blockchain
    pub fn is_intent_verified(&self, intent_id: String) -> bool {
        self.verified_intents.contains(&intent_id)
    }

    // Admin method to remove an intent from verified list
    // (For example, after it's been executed)
    pub fn remove_verified_intent(&mut self, intent_id: String) {
        // Only the owner can call this function
        assert_eq!(env::predecessor_account_id(), self.owner_id, "Unauthorized");
        self.verified_intents.remove(&intent_id);
    }
}
```

A few key changes from our basic implementation:

1. **Improved state management**:

   - We've replaced the simple `Vec<String>` with `UnorderedSet` from NEAR SDK, which is optimized for blockchain storage.
   - We added `StorageKey` enum as a way to provide unique prefixes for different storage collections.
   - We implemented proper initialization that requires an `owner_id`.

2. **More robust Intent structure**:

   - Added `id` field to uniquely identify each intent.
   - Added `user_account` to track who originated the intent.
   - Added `min_output_amount` as an option for users to specify minimum acceptable outcomes.
   - Added `deadline` to allow time-bound intents.

3. **Enhanced validation**:

   - Added deadline checking using blockchain timestamps.
   - Added authentication check to verify caller matches the intent's user account.

4. **Access control**:
   - Added admin functionality restricted to the `owner_id`.

## Testing Our Verifier Contract

Testing is critical for smart contracts because fixing bugs after deployment is difficult and costly. Let's add proper unit tests for our Verifier:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    // Helper function to set up a testing context
    // In Web2 terms, this is like mocking the server/API environment
    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))  // The contract account
            .signer_account_id(predecessor_account_id.clone())  // Who signed the transaction
            .predecessor_account_id(predecessor_account_id)  // Who called the contract
            .block_timestamp(100_000_000);  // Current timestamp
        builder
    }

    #[test]
    fn test_verify_valid_intent() {
        // Set up the simulated blockchain environment
        let context = get_context(accounts(1));  // accounts(1) is a test account
        testing_env!(context.build());  // Initialize the environment

        // Create and initialize the contract
        let mut contract = Verifier::new(accounts(0));

        // Create a test intent
        let intent = Intent {
            id: "test-intent-1".to_string(),
            user_account: accounts(1).to_string(),  // Same as our caller
            action: "swap".to_string(),
            input_token: "USDC".to_string(),
            input_amount: 1000,
            output_token: "NEAR".to_string(),
            min_output_amount: Some(95),
            max_slippage: 0.5,
            deadline: Some(200_000_000),  // Later than our block_timestamp
        };

        // Verify it should pass
        assert!(contract.verify_intent(intent));
        assert!(contract.is_intent_verified("test-intent-1".to_string()));
    }

    #[test]
    #[should_panic(expected = "Intent has expired")]
    fn test_expired_intent() {
        let context = get_context(accounts(1));
        // Set a current time AFTER the deadline
        // This would be like testing with a mocked system time in Web2
        let mut builder = context;
        builder.block_timestamp(300_000_000);  // Much later than our intent deadline
        testing_env!(builder.build());

        let mut contract = Verifier::new(accounts(0));

        let intent = Intent {
            id: "test-intent-2".to_string(),
            user_account: accounts(1).to_string(),
            action: "swap".to_string(),
            input_token: "USDC".to_string(),
            input_amount: 1000,
            output_token: "NEAR".to_string(),
            min_output_amount: Some(95),
            max_slippage: 0.5,
            deadline: Some(200_000_000),  // Earlier than our block_timestamp
        };

        // This should panic with "Intent has expired"
        contract.verify_intent(intent);
    }
}
```

This test suite introduces several important concepts:

1. **VMContextBuilder**:

   - This is a simulator for the NEAR blockchain environment, similar to mocking the server environment in Web2 testing.
   - It allows us to set up the testing context with specific account IDs, timestamps, etc.

2. **test_utils::accounts(n)**:

   - Provides test account IDs (e.g., `accounts(0)` might be `test-account-0`)

3. **testing_env!(context.build())**:

   - Initializes the mock environment based on our configuration.

4. **#[should_panic]**:
   - Tests that an operation correctly fails (panics) under certain conditions.
   - In Web2, this would be like testing that an API correctly returns an error code.

## Linking Verifier to Solvers with Cross-Contract Calls

Now for the most powerful part: making our Verifier interact with Solver contracts through cross-contract calls. This is where NEAR's contract interaction model comes into play.

```rust
// Define an interface to the Solver contract
// This is similar to defining an interface/type for an external API in TypeScript
#[ext_contract(ext_solver)]
trait Solver {
    // Define methods of the Solver contract that we can call
    fn solve_intent(&self, intent_id: String, user: AccountId, input_amount: u128) -> Promise;
}

#[near_bindgen]
impl Verifier {
    // Add this method to the existing implementation
    pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
        // First verify the intent
        assert!(self.verify_intent(intent.clone()), "Intent verification failed");

        // Then make an asynchronous call to the solver contract
        ext_solver::solve_intent(
            intent.id,
            intent.user_account.parse().unwrap(),
            intent.input_amount,
            solver_account,        // Contract to call (the solver's account ID)
            0,                     // Amount of NEAR to attach (none in this case)
            5_000_000_000_000      // Gas to allocate for this call (5 TGas)
        )
    }
}
```

### Understanding Cross-Contract Calls

Cross-contract calls in NEAR are fundamentally **asynchronous**, which is significantly different from typical Web2 API calls or function calls.

**Web2 Comparison**: Imagine making an asynchronous API call in a Node.js server without awaiting the result, where you initiate the call and then set up a callback to be triggered when the response comes in.

Here's what's happening:

1. **`#[ext_contract(ext_solver)]` Trait**:

   - This macro defines an interface to another contract, generating code to call its methods.
   - `ext_solver` becomes a module with methods that return `Promise` objects.

2. **`Promise` Object**:

   - When you call `ext_solver::solve_intent(...)`, you're not immediately executing the method and getting its result.
   - Instead, you're scheduling a future execution on the blockchain and getting a `Promise`.
   - This is conceptually similar to JavaScript's `Promise` or `async/await`, but operates at the blockchain transaction level.

3. **Parameters to `solve_intent`**:

   - First parameters (`intent.id`, `intent.user_account.parse().unwrap()`, `intent.input_amount`): These are arguments to the solver's method.
   - `solver_account`: The account ID of the solver contract.
   - `0`: Amount of NEAR tokens to attach to this call (0 in this case).
   - `5_000_000_000_000`: Amount of gas to allocate (5 TGas). This is like reserving computational resources for the call.

4. **Execution Flow**:
   - `verify_and_solve` validates the intent and then initiates a cross-contract call.
   - The method returns a `Promise` immediately, before the solver has executed.
   - The solver's `solve_intent` method will be executed in a subsequent block.
   - If you need to handle the result of the solver's execution, you would need to set up a callback (we'll explore this in [Section 3.4: Cross-Contract Calls](mdc:./04-cross-contract-calls.md)).

Understanding this asynchronous nature is crucial - in blockchain, execution doesn't wait for other contracts to finish their work within the same transaction!

## Deployment Considerations

When deploying your verifier contract to the NEAR testnet or mainnet:

1. **Proper Initialization**: Make sure to call the `new` method with the correct `owner_id` during deployment.

   ```bash
   near dev-deploy --wasmFile target/wasm32-unknown-unknown/release/verifier.wasm \
       --initFunction new --initArgs '{"owner_id": "your-account.testnet"}'
   ```

2. **Gas Budgeting**: For cross-contract calls like `verify_and_solve`, ensure you allocate sufficient gas. The amount needed depends on the complexity of both your verification logic and the solver's execution.

3. **Access Control**: For production, implement more sophisticated access control mechanisms. The basic owner check (`assert_eq!(env::predecessor_account_id(), self.owner_id)`) is just a starting point.

4. **Error Handling**: Add more detailed error messages and consider how to handle various failure modes, especially for cross-contract calls.

5. **Storage Considerations**: As your verified intents list grows, be mindful of storage costs. You might want to implement cleanup mechanisms to remove old, completed intents.

## Next Steps

You now have a robust Verifier contract capable of validating intents and initiating cross-contract calls to Solvers. In the next section, [3.3 Solver Contract](mdc:./03-solver-contract.md), we'll implement the Solver contract that will receive and execute these verified intents.
