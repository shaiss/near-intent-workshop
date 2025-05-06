# Testing with NEAR CLI

## Overview

NEAR CLI (Command Line Interface) is a powerful tool for interacting with the NEAR blockchain. In this section, you'll learn how to use NEAR CLI to test your deployed intent verifier and solver contracts directly from the command line.

## Basic NEAR CLI Commands

Before diving into specific contract interactions, here are some useful NEAR CLI commands:

```bash
# Check your account balance
near state yourname.testnet

# View transaction details
near tx <transaction-hash>

# List access keys for your account
near keys yourname.testnet
```

## Testing the Verifier Contract

To test your verifier contract, you'll need to submit an intent to be verified:

```bash
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 100,
    "output_token": "wNEAR",
    "max_slippage": 0.5
  }
}' --accountId yourname.testnet
```

The response should include:
- A verification ID
- A success/failure status
- Any additional validation details

## Testing the Solver Contract

Once an intent is verified, you can test your solver contract:

```bash
near call solver.yourname.testnet solve_intent '{
  "user": "yourname.testnet",
  "input_amount": 100
}' --accountId yourname.testnet
```

The solver should respond with execution details and a transaction result.

## Testing with Different Parameters

It's important to test your contracts with various parameters to ensure robust handling:

```bash
# Test with invalid token
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "action": "swap",
    "input_token": "INVALID",
    "input_amount": 100,
    "output_token": "wNEAR",
    "max_slippage": 0.5
  }
}' --accountId yourname.testnet

# Test with different slippage
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 100,
    "output_token": "wNEAR",
    "max_slippage": 1.5
  }
}' --accountId yourname.testnet
```

## Testing Cross-Contract Calls

If your contracts make cross-contract calls, you can trigger and trace these calls:

```bash
near call verifier.yourname.testnet execute_with_solver '{
  "solver_id": "solver.yourname.testnet",
  "intent_id": "12345"
}' --accountId yourname.testnet --gas 300000000000000
```

Use the `--gas` flag to allocate additional gas for complex operations.

## View Contract State

To examine the internal state of your contracts:

```bash
# View all state entries
near view-state verifier.yourname.testnet --finality final

# View specific state with keys
near view verifier.yourname.testnet get_intent '{"intent_id": "12345"}'
```

## Working with Arguments

For more complex function calls, you can place your arguments in a JSON file:

```bash
# Create intent.json
echo '{
  "intent": {
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 100,
    "output_token": "wNEAR",
    "max_slippage": 0.5,
    "deadline": "1698523278000"
  }
}' > intent.json

# Call with file
near call verifier.yourname.testnet verify_intent "$(cat intent.json)" --accountId yourname.testnet
```

## Next Steps

After testing your contracts with NEAR CLI, you'll want to:

1. Analyze any failed transactions
2. Debug issues in your contract logic
3. Optimize gas usage and execution flow

In the next section, we'll look at strategies for debugging intent execution issues.