
# Anatomy of a NEAR Intent

## Intent Structure

A NEAR intent is structured as a JSON object with several key components:

```javascript
{
  "action": "swap",          // The primary action the user wants to perform
  "input": {                 // Input parameters for the action
    "token": "USDC",
    "amount": "100"
  },
  "output": {                // Expected output from the action
    "token": "NEAR",
    "minAmount": "10"
  },
  "constraints": {           // Conditions that must be satisfied
    "maxSlippage": "0.5%",
    "deadline": "1h"
  },
  "metadata": {              // Additional information for verifiers/solvers
    "source": "myDApp",
    "userPreferences": {}
  }
}
```

## Key Components Explained

### Action

The action field defines what the user wants to achieve. Common actions include:
- `swap` - Exchange one token for another
- `bridge` - Move tokens across chains
- `stake` - Stake tokens for yields
- `compound` - Perform multiple actions in sequence

### Input and Output

These fields define what the user is providing and what they expect to receive.

### Constraints

Constraints define the conditions under which the intent is valid and can be executed.

### Metadata

Additional information that might be useful for verifiers and solvers.

## Intent Serialization

Intents are serialized to JSON and then typically:
1. Signed by the user
2. Submitted to the intent verifier
3. Picked up by solvers

## Intent Schema Validation

Intent schemas are validated using:
- JSON Schema validation
- Smart contract verification
- Solver-specific validation rules

## Example Intents

### Token Swap Intent
```javascript
{
  "action": "swap",
  "input": {"token": "USDC", "amount": "100"},
  "output": {"token": "NEAR", "minAmount": "10"},
  "constraints": {"maxSlippage": "0.5%", "deadline": "1h"}
}
```

### Staking Intent
```javascript
{
  "action": "stake",
  "input": {"token": "NEAR", "amount": "10"},
  "output": {"receiptToken": "stNEAR"},
  "constraints": {"validator": "validator.near"}
}
```
