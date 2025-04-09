# Understanding NEAR Intents

## What Are Intents?

## Definition and Key Characteristics

An **Intent** is a declarative expression of *what* the user wants to happen (e.g., "Swap 10 USDC for NEAR") without specifying *how* it happens (e.g., which DEX, route, or chain).

### Key Characteristics

- **Chain-agnostic**: Can be resolved on multiple chains
- **Outcome-driven**: Describes desired result, not steps
- **Composable**: Can be embedded inside apps, widgets, or bots

## Declarative Over Imperative

Traditional blockchain transactions are imperative:
- Users specify exact contract calls
- Parameters are fixed at submission time
- Execution flow is predetermined

Intents are declarative:
- Users express desired outcomes
- System determines optimal execution path
- Reduces complexity for end users

## Examples of Intents

```javascript
// Simple Transfer Intent
{
  "intent": {
    "action": "transfer",
    "input": {
      "token": "NEAR",
      "amount": "1"
    },
    "recipient": "alice.near"
  }
}
```

```javascript
// Token Swap Intent
{
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
}
```

```javascript
// Cross-chain Bridge Intent
{
  "intent": {
    "action": "bridge",
    "input": {
      "token": "MATIC",
      "amount": "5",
      "sourceChain": "Polygon"
    },
    "output": {
      "token": "wMATIC",
      "destinationChain": "Ethereum"
    }
  }
}
```

## Benefits of Intent Architecture

### 1. Better User Experience
- Users focus on what they want
- No need to understand technical details
- Reduced transaction complexity

### 2. Market Efficiency
- Competitive solver marketplace
- Optimal execution paths
- Better prices and lower fees

### 3. Innovation Space
- New solver strategies
- Cross-chain opportunities
- Composable actions

### 4. Risk Reduction
- Intent verification
- Constraint checking
- Failed transaction protection

## Intent Lifecycle

1. **Creation**
   - User generates intent through UI
   - Frontend formats intent object
   - Basic validation

2. **Verification**
   - Intent submitted to verifier contract
   - Constraints checked
   - Parameters validated

3. **Solver Selection**
   - Solvers analyze intent
   - Compete for execution
   - Best path selected

4. **Execution**
   - Winner executes intent
   - Results verified
   - User notified

## Next Steps

In the next section, we'll dive deeper into the anatomy of a NEAR intent and explore how the verification and solving process works in detail.