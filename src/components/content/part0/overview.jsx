export default `# Overview of NEAR Intents

## What are NEAR Intents?

NEAR Intents represent a paradigm shift in how we think about blockchain interactions. Instead of users specifying exact transaction steps, they declare their desired outcome, and the network figures out how to achieve it.

### Key Concepts

1. **Intent-Centric Architecture**
   - User expresses what they want
   - System determines how to fulfill it
   - Multiple possible execution paths

2. **Smart Wallet Abstraction**
   - Session-based keys
   - Delegated execution
   - Improved UX with fewer confirmations

3. **Verifiers & Solvers**
   - Verifiers validate intent validity
   - Solvers compete to execute intents
   - Market-driven execution

## Why Intents Matter

Traditional blockchain transactions require users to:
- Know exact contract addresses
- Understand complex transaction sequences
- Manage gas fees and limits
- Handle cross-chain complexities

Intents simplify this by:
- Focusing on user goals
- Abstracting technical complexity
- Enabling competitive execution
- Supporting cross-chain operations

## Example Intent

\`\`\`javascript
{
  "action": "swap",
  "input_token": "USDC",
  "input_amount": "100",
  "output_token": "NEAR",
  "min_output_amount": "10",
  "deadline": "1h"
}
\`\`\`

This simple intent could be fulfilled through:
- Different DEXes
- Multiple chains
- Various routing paths

The solver network determines the best execution strategy.

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

In the next sections, we'll dive deeper into implementing this architecture.`;