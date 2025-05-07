# Interacting with Deployed Contracts Using NEAR CLI

**Time**: 25 minutes  
**Pre-requisite**: Deployed contracts from 6.1, understanding of contract methods from Module 3

## NEAR CLI: Your Command-Line Interface to the Blockchain

NEAR CLI is a powerful tool for interacting with the NEAR blockchain directly from your terminal. For Web2 developers, think of it as a combination of cURL for API testing, AWS CLI for infrastructure management, and console-based database clients - all in one tool for blockchain interaction.

> 💡 **Web2 Parallel**: If you've used tools like cURL to test REST APIs, Heroku CLI to manage deployments, or MongoDB shell to query databases, NEAR CLI serves similar purposes but for blockchain interactions.

## Basic NEAR CLI Commands

Let's start with some fundamental commands that help you navigate the blockchain:

```bash
# Check your account balance and state
near state yourname.testnet

# View transaction details (like checking HTTP request/response logs)
near tx TX_HASH_HERE

# List access keys for your account (similar to checking API keys)
near keys yourname.testnet
```

## Testing the Verifier Contract

To test your deployed verifier contract, you'll need to call its methods with the correct parameters. Note that these must match the Rust struct definitions we created in Module 3:

```bash
# Call verify_intent with a complete intent structure
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "id": "cli-intent-1",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  }
}' --accountId yourname.testnet
```

**Expected output**: This should return `true` if the intent is valid. You'll also see a transaction hash that you can check in NEAR Explorer for execution details and logs.

## Checking Intent Verification Status

After submitting an intent, check if it's been verified:

```bash
# Check if an intent has been verified
near view verifier.yourname.testnet is_intent_verified '{
  "intent_id": "cli-intent-1"
}'
```

**Expected output**: `true` if the intent has been verified, `false` otherwise.

## Testing the Solver Contract

Once an intent is verified, you can test your solver contract by calling its `solve_intent` method:

```bash
# Call solve_intent with the correct parameters
near call solver.yourname.testnet solve_intent '{
  "intent_id": "cli-intent-1",
  "user": "yourname.testnet",
  "input_amount": "1000000000"
}' --accountId yourname.testnet --gas 100000000000000
```

**Expected output**: You should receive a structured result with the execution outcome. This method makes cross-contract calls, so we allocate extra gas (100 TGas) to ensure it has enough resources to complete.

## Testing with Different Parameters

Testing with various parameter values helps ensure your contracts handle edge cases properly:

```bash
# Test with invalid token
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "id": "cli-intent-2",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "INVALID",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  }
}' --accountId yourname.testnet
```

**Expected output**: This might fail with an error message about invalid token, helping you test your validation logic.

```bash
# Test with different slippage
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "id": "cli-intent-3",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 1.5,
    "deadline": null
  }
}' --accountId yourname.testnet
```

## Testing Cross-Contract Calls

If your contract uses cross-contract calls (like our verifier calling the solver), test this flow:

```bash
# Call verify_and_solve on the verifier
near call verifier.yourname.testnet verify_and_solve '{
  "intent": {
    "id": "cli-intent-4",
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

**Gas management**: Notice the `--gas 300000000000000` flag. Cross-contract calls need significantly more gas than simple calls. This is similar to how complex database transactions or API calls that trigger multiple services might need longer timeouts in Web2.

## View Contract State

Examining your contract's state helps debug issues:

```bash
# View all state entries (like querying a database table)
near view-state verifier.yourname.testnet --finality final

# Check the Solver information
near view solver.yourname.testnet get_solver_info '{}'

# See what solvers are registered with the verifier
near view verifier.yourname.testnet get_solvers '{}'
```

## Managing Complex Arguments with JSON Files

For complex function calls, using JSON files keeps your commands clean:

```bash
# Create intent.json
echo '{
  "intent": {
    "id": "cli-intent-5",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": "1000000000",
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": 1698523278
  }
}' > intent.json

# Call with file
near call verifier.yourname.testnet verify_intent "$(cat intent.json)" --accountId yourname.testnet
```

> ⚠️ **Important**: Ensure the JSON structure exactly matches what the contract expects. For numbers like `deadline`, use a numeric value (not a string) as required by the Rust `u64` type.

## Testing Smart Wallet Integration

To test the smart wallet contract we deployed from Module 4:

```bash
# Add a session key to the smart wallet
near call smart-wallet.yourname.testnet add_session_key '{
  "public_key": "ed25519:AbCdEf123456...",
  "allowance": "250000000000000000000000",
  "receiver_id": "verifier.yourname.testnet",
  "method_names": ["verify_intent", "verify_and_solve"]
}' --accountId yourname.testnet
```

**Expected output**: `true` if the key was added successfully.

## Checking Transaction Results and Logs

After executing a transaction, examine its details to debug issues:

```bash
# View transaction details
near tx TX_HASH_HERE
```

Look for the `LOGS` section, which contains any messages output via `env::log_str()` in your contracts. These are like console logs in Web2 debugging.

## Common CLI Errors and Solutions

| Error                         | Possible Cause                                | Solution                                                |
| ----------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `Invalid args`                | JSON syntax error or wrong argument structure | Check JSON structure against contract method parameters |
| `Cannot borrow`               | Method called with wrong mutability           | Check if method should be `view` or `call`              |
| `Exceeded the prepaid gas`    | Complex method needs more gas                 | Add `--gas` flag with higher value                      |
| `Method not found`            | Wrong method name or contract ID              | Verify method exists on target contract                 |
| `Exceeded the maximum amount` | Trying to attach too much deposit             | Check deposit amount or omit if not needed              |

## Next Steps

Now that you can interact with your contracts via CLI, you can:

1. Create automated tests for key contract interactions
2. Debug intent processing flows using transaction logs
3. Verify that your contract integrations work as expected

In the next section, we'll explore adding debug logs to your contracts to better understand execution flow and troubleshoot issues when they arise.
