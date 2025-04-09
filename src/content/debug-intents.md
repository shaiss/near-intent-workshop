# Debugging Intents

## Overview

Intent verification and execution can fail for various reasons. In this section, you'll learn strategies for debugging your intent infrastructure on NEAR testnet.

## Adding Debug Logs to Your Contracts

Rust's `env::log_str` function is your primary tool for debugging smart contracts on NEAR:

```rust
// In your Rust contract
use near_sdk::env;

pub fn verify_intent(&mut self, intent: Intent) -> VerificationResult {
    env::log_str(&format!("Verifying intent: {:?}", intent));

    // Your verification logic here

    env::log_str("Verification completed successfully");
    // Return result
}
```

These logs will be visible in transaction receipts and can provide crucial insights into contract execution.

## Common Debug Patterns

Here are some effective debug patterns for your intent contracts:

### 1. Log Entry and Exit Points

```rust
pub fn solve_intent(&mut self, user: AccountId, amount: u128) -> ExecutionResult {
    env::log_str(&format!("Solver execution started for user {}, amount {}", user, amount));

    // Solver logic

    env::log_str("Solver execution completed");
    // Return result
}
```

### 2. Log Critical Decision Points

```rust
if amount > self.max_allowed {
    env::log_str(&format!("Amount {} exceeds maximum allowed {}", amount, self.max_allowed));
    return Err("Amount exceeds maximum allowed");
}
```

### 3. Log State Changes

```rust
pub fn update_state(&mut self, intent_id: String, status: IntentStatus) {
    env::log_str(&format!("Updating intent {} status to {:?}", intent_id, status));
    self.intents.insert(&intent_id, &status);
}
```

## Viewing Logs

There are several ways to view the logs from your contract executions:

### Using NEAR Explorer

1. Visit https://explorer.testnet.near.org
2. Search for your transaction hash or contract ID
3. Expand the "Logs" section of any transaction

### Using NEAR CLI

```bash
near tx <transaction-hash>
```

This will display the transaction details, including any logs emitted during execution.

## Common Intent Debug Issues

### 1. Missing Gas

If your transaction fails with an "out of gas" error:

```bash
near call solver.yourname.testnet solve_complex_intent '{...}' \
  --accountId yourname.testnet --gas 30000000000000
```

Increase the gas limit for complex operations, especially those involving cross-contract calls.

### 2. Permission Issues

If you're getting "access key not found" or similar errors:

```bash
# Check which keys have access to your account
near keys yourname.testnet

# Verify contract permissions
near view verifier.yourname.testnet get_allowed_signers '{}'
```

### 3. Malformed Arguments

If your function call is failing due to argument parsing:

```bash
# Validate your JSON format
echo '{...}' | jq

# Call with explicit JSON structure
near call verifier.yourname.testnet verify_intent '{
  "intent": {"action": "swap", "input_token": "USDC"}
}' --accountId yourname.testnet
```

Ensure your JSON is properly formatted and matches the expected struct in your contract.

## Debugging Cross-Contract Calls

For debugging cross-contract calls:

1. Add logs before and after the promise creation
2. Use `promise_result` to inspect the results of the cross-contract call
3. Implement proper error handling for failed promises

```rust
let promise = external_contract.ext(env::current_account_id())
    .with_static_gas(Gas(5 * TGAS))
    .external_function_call();

env::log_str(&format!("Created promise with ID: {:?}", promise));

// Handle promise result
promise.then(
    Self::ext(env::current_account_id())
        .with_static_gas(Gas(5 * TGAS))
        .handle_callback()
)
```

## Next Steps

After implementing proper debugging:

1. Systematically test each part of your intent flow
2. Fix identified issues in your contract logic
3. Optimize your implementation based on debug findings

In the next section, we'll explore how to simulate solver behavior for more comprehensive testing.