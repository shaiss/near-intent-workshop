
# Testing with NEAR CLI

## Using NEAR CLI to Test Your Intent Contracts

The NEAR Command Line Interface (CLI) is a powerful tool for interacting with the NEAR blockchain. You can use it to test your intent contracts deployed on testnet.

## Setting Up NEAR CLI

Make sure you have NEAR CLI installed and configured:

```bash
# Install NEAR CLI
npm install -g near-cli

# Configure for testnet
export NEAR_ENV=testnet
```

## Basic NEAR CLI Commands

Here are some basic commands to interact with the NEAR blockchain:

```bash
# Check account state
near state YOUR_ACCOUNT_NAME.testnet

# View account balance
near state YOUR_ACCOUNT_NAME.testnet | grep total

# Create a subaccount
near create-account subaccount.YOUR_ACCOUNT_NAME.testnet --masterAccount YOUR_ACCOUNT_NAME.testnet --initialBalance 5
```

## Interacting with Your Intent Verifier

Test your intent verifier contract with these commands:

```bash
# View all registered solvers
near view verifier.YOUR_ACCOUNT_NAME.testnet get_solvers

# Check pending intents
near view verifier.YOUR_ACCOUNT_NAME.testnet get_pending_intents '{
  "limit": 10,
  "skip": 0
}'

# View intent by ID
near view verifier.YOUR_ACCOUNT_NAME.testnet get_intent '{
  "intent_id": "abc123"
}'
```

## Creating an Intent

To create and submit an intent:

```bash
# Submit transfer intent
near call verifier.YOUR_ACCOUNT_NAME.testnet submit_intent '{
  "intent": {
    "type": "transfer",
    "params": {
      "receiver_id": "receiver.testnet",
      "amount": "1000000000000000000000000",
      "token": "near"
    }
  }
}' --accountId YOUR_ACCOUNT_NAME.testnet --deposit 0.01
```

## Testing Your Solver

Interact with your solver contract:

```bash
# Register solver with verifier
near call solver.YOUR_ACCOUNT_NAME.testnet register_with_verifier '{
  "verifier_id": "verifier.YOUR_ACCOUNT_NAME.testnet",
  "supported_intents": ["transfer", "swap"]
}' --accountId YOUR_ACCOUNT_NAME.testnet

# Manually trigger intent execution (typically done by solver)
near call solver.YOUR_ACCOUNT_NAME.testnet execute_intent '{
  "intent_id": "abc123"
}' --accountId YOUR_ACCOUNT_NAME.testnet --gas 300000000000000
```

## Scripting Complex Scenarios

For more complex testing scenarios, you can create bash scripts:

```bash
#!/bin/bash
set -e

# Configuration
ACCOUNT_ID="your_account_name.testnet"
VERIFIER_ID="verifier.$ACCOUNT_ID"
SOLVER_ID="solver.$ACCOUNT_ID"
RECEIVER_ID="receiver.testnet"

# Submit an intent
echo "Submitting transfer intent..."
RESULT=$(near call $VERIFIER_ID submit_intent '{
  "intent": {
    "type": "transfer",
    "params": {
      "receiver_id": "'$RECEIVER_ID'",
      "amount": "1000000000000000000000000",
      "token": "near"
    }
  }
}' --accountId $ACCOUNT_ID --deposit 0.01)

# Extract intent ID from result
INTENT_ID=$(echo $RESULT | grep -oP 'Intent ID: \K[a-zA-Z0-9]+')
echo "Created intent with ID: $INTENT_ID"

# Wait a moment
sleep 2

# Check intent status
echo "Checking intent status..."
near view $VERIFIER_ID get_intent '{
  "intent_id": "'$INTENT_ID'"
}'

# Manually execute the intent (in practice, solver would do this automatically)
echo "Executing intent..."
near call $SOLVER_ID execute_intent '{
  "intent_id": "'$INTENT_ID'"
}' --accountId $ACCOUNT_ID --gas 300000000000000

# Check final intent status
echo "Checking final status..."
near view $VERIFIER_ID get_intent '{
  "intent_id": "'$INTENT_ID'"
}'

echo "Test completed!"
```

## Monitoring Transaction Status

After submitting transactions, you can monitor their status:

```bash
# Get transaction status by hash
near tx-status TX_HASH --accountId YOUR_ACCOUNT_NAME.testnet
```

## Testing Cross-Chain Functionality

For testing cross-chain intents:

```bash
# Submit cross-chain intent
near call verifier.YOUR_ACCOUNT_NAME.testnet submit_intent '{
  "intent": {
    "type": "cross_chain_transfer",
    "params": {
      "receiver_id": "0xYourEthereumAddress",
      "amount": "1000000000000000000",
      "source_chain": "near",
      "target_chain": "aurora",
      "token": "near"
    }
  }
}' --accountId YOUR_ACCOUNT_NAME.testnet --deposit 0.01 --gas 300000000000000
```

## Performance Testing

For performance testing, you can use scripts to submit multiple intents:

```bash
#!/bin/bash

# Configuration
ACCOUNT_ID="your_account_name.testnet"
VERIFIER_ID="verifier.$ACCOUNT_ID"
COUNT=10

echo "Submitting $COUNT intents..."

for i in $(seq 1 $COUNT); do
  echo "Submitting intent $i..."
  near call $VERIFIER_ID submit_intent '{
    "intent": {
      "type": "transfer",
      "params": {
        "receiver_id": "receiver.testnet",
        "amount": "1000000000000000000000000",
        "token": "near"
      }
    }
  }' --accountId $ACCOUNT_ID --deposit 0.01 &
  
  # Wait a bit between submissions to avoid rate limiting
  sleep 0.5
done

# Wait for all background processes to complete
wait

echo "All intents submitted!"
```

In the next section, we'll cover debugging techniques for intent-based applications.
