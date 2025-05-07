# Debugging Intent Execution on Testnet

**Time**: 30 minutes  
**Pre-requisite**: Deployed contracts from 6.1, basic CLI usage from 6.2

## Debugging in Web3: Applying Familiar Techniques in a New Environment

When your intent architecture is deployed to testnet, debugging becomes an important skill. Unlike Web2 development where you can attach a debugger or directly view console logs, debugging on blockchain requires a different approach - but many concepts remain similar.

> 💡 **Web2 Parallel**: Smart contract logs are similar to server logs in a Web2 application, but they're stored on-chain and accessible through transaction receipts. Think of them as distributed server logs that provide insight into your application's execution.

## Adding Debug Logs to Your Contracts

The primary mechanism for debugging NEAR smart contracts is the `env::log_str` function, which lets you write logs during contract execution:

```rust
// In your Rust contract
use near_sdk::env;

pub fn verify_intent(&mut self, intent: Intent) -> bool {
    // Log information about the incoming intent
    env::log_str(&format!("Verifying intent ID: {}, action: {}", intent.id, intent.action));

    // Log values for debugging
    env::log_str(&format!("Input token: {}, amount: {}", intent.input_token, intent.input_amount));

    // Your verification logic here
    let is_valid = self.validate_intent(&intent);

    // Log the result
    env::log_str(&format!("Intent verification result: {}", is_valid));

    is_valid
}
```

> ⚠️ **Performance Note**: Each log statement consumes gas (approximately 1-3 TGas per log depending on string length). For production contracts, use logging sparingly or conditionally to minimize transaction costs.

## Effective Logging Patterns for Intent Architecture

Let's explore strategic logging patterns to diagnose issues in your intent contracts:

### 1. Log Entry and Exit Points

```rust
// In your Verifier contract
pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
    env::log_str(&format!("ENTRY: verify_and_solve for intent ID: {}", intent.id));

    // Verify the intent
    let is_valid = self.validate_intent(&intent);
    if !is_valid {
        env::log_str(&format!("Intent validation failed for ID: {}", intent.id));
        env::panic_str("Intent validation failed");
    }

    env::log_str(&format!("Intent verified, calling solver: {}", solver_account));

    // Call the solver
    let promise = self.call_solver(intent.id.clone(), solver_account, intent.input_amount);

    env::log_str(&format!("EXIT: verify_and_solve for intent ID: {}", intent.id));
    promise
}
```

### 2. Log Critical Decision Points

```rust
// In your Solver contract
pub fn solve_intent(&mut self, intent_id: String, user: AccountId, input_amount: Balance) -> ExecutionResult {
    env::log_str(&format!("Solving intent: {}", intent_id));

    // Check if we support this intent type
    let intent = self.get_intent(intent_id.clone()).expect("Intent not found");

    if !self.supported_actions.contains(&intent.action) {
        env::log_str(&format!("Action not supported: {}", intent.action));
        return ExecutionResult::Failed { reason: "Action not supported".to_string() };
    }

    // Check if amount is sufficient
    if input_amount < self.minimum_amount {
        env::log_str(&format!("Amount too low: {} < {}", input_amount, self.minimum_amount));
        return ExecutionResult::Failed { reason: "Amount too low".to_string() };
    }

    env::log_str("All validations passed, executing intent...");

    // Execute the intent...
    ExecutionResult::Success {
        output_amount: input_amount,
        fee: self.execution_fee
    }
}
```

### 3. Log State Changes

```rust
pub fn record_intent_execution(&mut self, intent_id: String, result: ExecutionResult) {
    env::log_str(&format!("Recording execution for intent: {}", intent_id));

    let status = match result {
        ExecutionResult::Success { .. } => {
            env::log_str("Execution successful");
            IntentStatus::Completed
        },
        ExecutionResult::Failed { reason } => {
            env::log_str(&format!("Execution failed: {}", reason));
            IntentStatus::Failed
        }
    };

    self.intent_statuses.insert(&intent_id, &status);
    env::log_str(&format!("Updated status for intent {} to {:?}", intent_id, status));
}
```

## Viewing and Analyzing Logs

There are two main ways to view your contract's log output:

### 1. NEAR Explorer

NEAR Explorer provides a visual interface for inspecting transaction results:

1. Visit [https://explorer.testnet.near.org](https://explorer.testnet.near.org)
2. Search for your transaction hash or navigate to your contract's page
3. Find the transaction and click on it to expand details
4. Look for the "Logs" section to see all emitted logs

> 💡 **Web2 Parallel**: This is similar to using application performance monitoring tools like New Relic or Datadog to inspect API request logs.

### 2. NEAR CLI

For a command-line approach, you can view transaction details with NEAR CLI:

```bash
near tx TX_HASH_HERE
```

The output will include a "LOGS" section that displays all logs emitted during transaction execution.

> 💡 **Web2 Parallel**: This is similar to checking server logs via SSH or a logging command-line tool.

## Debugging Common Intent Architecture Issues

### 1. Gas Limit Exceeded

If your transaction fails with an "out of gas" error, you need to increase the gas limit:

```bash
# Original call
near call verifier.yourname.testnet verify_and_solve '{
  "intent": {
    "id": "debug-intent-1",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  },
  "solver_account": "solver.yourname.testnet"
}' --accountId yourname.testnet --gas 100000000000000

# Increased gas (300 TGas)
near call verifier.yourname.testnet verify_and_solve '{
  "intent": {
    "id": "debug-intent-1",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  },
  "solver_account": "solver.yourname.testnet"
}' --accountId yourname.testnet --gas 300000000000000
```

> 💡 **Web2 Parallel**: This is similar to increasing request timeouts or memory limits for a complex API endpoint.

### 2. Contract Access Permission Issues

If you're getting "access key not found" or "method not allowed" errors:

```bash
# Check which keys have access to your account
near keys yourname.testnet

# Check the owner of the contract (to verify you have permission)
near view verifier.yourname.testnet get_owner_id '{}'
```

> 💡 **Web2 Parallel**: This is like troubleshooting API key or OAuth token permissions.

### 3. Malformed or Incorrect Arguments

If your function call is failing due to argument parsing issues:

```bash
# Validate your JSON format first
echo '{
  "intent": {
    "id": "debug-intent-2",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  }
}' | jq
```

Ensure your JSON is valid and matches exactly what your contract expects.

## Debugging Cross-Contract Calls

Cross-contract calls (like Verifier → Solver) are often the trickiest to debug because they involve multiple transactions and callbacks.

### 1. Log Both Sides of the Interaction

```rust
// In Verifier contract
pub fn verify_and_solve(&mut self, intent: Intent, solver_account: AccountId) -> Promise {
    env::log_str(&format!("Verifier: Calling solver at {}", solver_account));

    // Make the cross-contract call to the solver
    ext_solver::solve_intent(
        intent.id.clone(),
        intent.user_account.clone(),
        intent.input_amount,
        &solver_account,  // Contract to call
        0,                // No deposit
        Gas(20 * TGAS)    // Gas for execution
    )
    .then(
        Self::ext(env::current_account_id())
            .with_static_gas(Gas(10 * TGAS))
            .handle_solver_response(intent.id)
    )
}

// In Verifier's callback
pub fn handle_solver_response(&mut self, intent_id: String) -> bool {
    env::log_str(&format!("Verifier: Handling solver response for intent {}", intent_id));

    // Check the promise result from the solver call
    let promise_result = env::promise_result(0);
    match promise_result {
        PromiseResult::Successful(value) => {
            env::log_str(&format!("Solver call succeeded. Result: {}",
                  String::from_utf8(value).unwrap_or("Invalid UTF-8".to_string())));
            // Update intent status...
            true
        },
        PromiseResult::Failed => {
            env::log_str("Solver call failed");
            // Handle failure...
            false
        },
        PromiseResult::NotReady => {
            env::log_str("Solver call not ready - should not happen in callback");
            false
        }
    }
}
```

### 2. Analyze the Transaction Flow

When diagnosing cross-contract issues:

1. Find the initial transaction hash from your CLI command
2. Look for "Receipt generated" sections in the transaction result
3. Follow each receipt to track the execution flow
4. Check logs in each step of the execution

## Recommended Debugging Strategy for Intent Architecture

1. **Start with local testing**: Use unit tests with `MockRuntime` before deploying to testnet
2. **Add strategic logs**: Focus on entry/exit points, decision points, and state changes
3. **Test incrementally**: Start with single-contract calls, then test cross-contract interactions
4. **Inspect transaction results**: Use NEAR Explorer to visualize the transaction flow
5. **Use meaningful intent IDs**: Include timestamps or descriptive tags to easily identify test intents

## Adding Intent-Specific Logging to Contracts

If you want to add more debug logging to your existing contracts, here's how to modify them:

```bash
# First download the current contract code
cd contracts/verifier
cargo build --target wasm32-unknown-unknown --release

# Edit the src/lib.rs file to add logging as shown above

# Rebuild the contract
cargo build --target wasm32-unknown-unknown --release

# Redeploy with your changes
near deploy --accountId verifier.yourname.testnet \
  --wasmFile ./target/wasm32-unknown-unknown/release/verifier.wasm
```

## Next Steps

With effective debugging techniques in place, you're now ready to:

1. Test your complete intent flow on testnet
2. Identify and fix any issues in your contract logic
3. Optimize your implementation based on real-world testing

In the next section, we'll explore how to simulate solver behavior to test more complex intent scenarios.
