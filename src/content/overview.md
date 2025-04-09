# Overview of NEAR Intents & Smart Wallet Abstraction

## What are NEAR Intents?

NEAR Intents represent a paradigm shift in how we think about blockchain interactions. Instead of users specifying exact transaction steps, they declare their desired outcome, and the network figures out how to achieve it.

### Key Concepts

1. **Intent**
   - A declarative goal (e.g., "Swap 10 USDC for NEAR")
   - Focuses on what the user wants, not how to do it
   - Chain-agnostic and outcome-driven

2. **Solver**
   - Competes to fulfill an intent optimally
   - Finds the best route, price, or execution path
   - Can operate across multiple chains or protocols

3. **Verifier**
   - Validates that a Solver's proposed fulfillment meets the intent's constraints
   - Ensures user expectations are met
   - Acts as a security layer between intent and execution

4. **Smart Wallet**
   - Abstracts signing, batching, and multi-chain logic
   - Improves UX by hiding complexity
   - Enables gasless transactions and session-based authentication

## How NEAR Intents Work

Traditional blockchain transactions require users to:
- [Know exact contract addresses
- Understand complex transaction sequences
- Manage gas fees and limits
- Handle cross-chain complexities

Intents simplify this by:
- Focusing on user goals
- Abstracting technical complexity
- Enabling competitive execution
- Supporting cross-chain operations

## Workflow Diagram

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

## Example Intent

```javascript
{
  "intent": {
    "action": "swap",
    "input": {
      "token": "USDC",
      "amount": "100"
    },
    "output": {
      "token": "NEAR"
    }
  },
  "constraints": {
    "maxSlippage": "0.5"
  }
}
```

## Benefits

1. **For Users**
   - Simpler interactions
   - Better prices
   - Improved UX
   - Cross-chain capability

2. **For Developers**
   - Flexible implementation
   - Competitive advantage
   - Enhanced composability
   - Future-proof architecture

In the next sections, we'll dive deeper into implementing this architecture.

TBD: add `Actor overview: dApp, User, Verifier, Solver, Relayer`