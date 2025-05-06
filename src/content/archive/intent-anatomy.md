# Anatomy of a NEAR Intent

## Intent Flow Architecture

The flow of a NEAR intent transaction follows this path:

```
User → UI → Intent Object
                   ↓
            Verifier Contract
                   ↓
            Solver Submission
                   ↓
           Fulfillment Evaluation
                   ↓
        Execution on-chain (via Smart Wallet)
```

## Intent Object Structure

A NEAR intent is structured as a JSON object with several key components:

```javascript
{
  "intent": {
    "action": "swap",          // The primary action the user wants to perform
    "input": {                 // Input parameters for the action
      "token": "USDC",
      "amount": "100"
    },
    "output": {                // Expected output from the action
      "token": "wNEAR"
    }
  },
  "constraints": {           // Conditions that must be satisfied
    "maxSlippage": "0.5",
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
- `transfer` - Send tokens to another account
- `swap` - Exchange one token for another
- `bridge` - Move tokens across chains
- `stake` - Stake tokens for yields
- `compound` - Perform multiple actions in sequence

### Input and Output

These fields define what the user is providing and what they expect to receive:

- **Input**: Resources the user is contributing (tokens, NFTs, etc.)
- **Output**: What the user expects to receive in return

### Constraints

Constraints define the conditions under which the intent is valid:

- **maxSlippage**: Maximum acceptable price difference
- **deadline**: Time after which the intent expires
- **minOutput**: Minimum acceptable return amount
- **preferredDex**: Optional preferred execution venue

### Metadata

Additional information that might be useful for verifiers and solvers:
- Source application
- User preferences
- Context information

## Intent Verification Process

When an intent reaches the verifier contract, it undergoes these checks:

1. **Structural validation** - Is the intent properly formatted?
2. **Parameter validation** - Are the inputs valid and sufficient?
3. **Constraint checking** - Can the constraints be satisfied?
4. **Authorization** - Is the sender authorized to submit this intent?

## Solver Interaction

Solvers analyze verified intents by:

1. **Evaluating feasibility** - Can they fulfill the intent?
2. **Planning execution** - How will they execute it?
3. **Estimating outcome** - What result can they achieve?
4. **Submitting proposal** - Detailing how they'll fulfill the intent

## Transaction Execution

The final execution involves:

1. **Selecting winning solver** - Based on best proposed outcome
2. **Token transfers** - Moving tokens from user to solver
3. **Action execution** - Performing the requested action
4. **Result verification** - Ensuring constraints were satisfied
5. **Token delivery** - Returning output tokens to user

## Example: Complete Swap Intent Lifecycle

```javascript
// 1. User creates intent
const userIntent = {
  "intent": {
    "action": "swap",
    "input": {
      "token": "USDC",
      "amount": "100"
    },
    "output": {
      "token": "wNEAR"
    }
  },
  "constraints": {
    "maxSlippage": "0.5"
  }
};

// 2. Intent is verified by contract
// verifier.near.verify_intent(userIntent)

// 3. Solvers submit proposals
// solver1.near.propose_solution(intentId, { expectedReturn: "25.2" })
// solver2.near.propose_solution(intentId, { expectedReturn: "25.5" })

// 4. Best solution is selected
// verifier.near.select_solution(intentId, solver2.near)

// 5. Intent is executed
// solver2.near.execute_solution(intentId)