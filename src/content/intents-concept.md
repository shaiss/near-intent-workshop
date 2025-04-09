
# Understanding NEAR Intents

## What Are Intents?

An Intent is a declarative expression of what the user wants to achieve, without specifying how to achieve it. This paradigm shift from imperative to declarative transactions represents a fundamental evolution in blockchain interaction.

### Core Concepts

1. **Declarative Over Imperative**
   - Users express desired outcomes
   - System determines optimal execution path
   - Reduces complexity for end users

2. **Chain Agnostic**
   - Not tied to specific chains
   - Can be resolved across networks
   - Unified user experience

3. **Solver Competition**
   - Multiple solvers can fulfill intents
   - Market-driven efficiency
   - Best execution path wins

```javascript
// Example Intent Structure
{
  "action": "swap",
  "input": {
    "token": "USDC",
    "amount": "100"
  },
  "output": {
    "token": "NEAR",
    "minAmount": "10"
  },
  "constraints": {
    "maxSlippage": "0.5%",
    "deadline": "1h",
    "preferredDex": ["ref_finance", "jumbo"]
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

## Real World Examples

### Token Swaps
```javascript
// Swap Intent
{
  "action": "swap",
  "input": {"token": "USDC", "amount": "100"},
  "output": {"token": "NEAR"}
}
```

### Cross-chain Transfers
```javascript
// Bridge Intent
{
  "action": "bridge",
  "source": {
    "chain": "Ethereum",
    "token": "USDC",
    "amount": "100"
  },
  "destination": {
    "chain": "NEAR"
  }
}
```

### Complex Operations
```javascript
// Multi-step Intent
{
  "action": "compound",
  "operations": [
    {
      "type": "swap",
      "input": {"token": "USDC", "amount": "100"},
      "output": {"token": "NEAR"}
    },
    {
      "type": "stake",
      "pool": "liquid_staking"
    }
  ]
}
```

## Intent Lifecycle

1. **Creation**
   - User generates intent
   - Frontend formats intent object
   - Basic validation

2. **Verification**
   - Intent submitted to verifier
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
