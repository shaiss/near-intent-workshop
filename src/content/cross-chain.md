
# Cross-chain UX

## The Challenge of Cross-chain Interactions

Traditional cross-chain operations require users to:
- Understand different chain mechanics
- Manage multiple wallets/accounts
- Execute complex bridging processes
- Track assets across chains
- Pay gas fees in multiple tokens

## Intent-Based Cross-chain UX

The intent architecture simplifies cross-chain operations by:
1. Abstracting chain-specific details
2. Converting user goals into optimal execution paths
3. Managing gas fees behind the scenes
4. Providing a unified experience

## Cross-chain Intent Example

```javascript
{
  "action": "bridge",
  "source": {
    "chain": "Ethereum",
    "token": "USDC",
    "amount": "100"
  },
  "destination": {
    "chain": "NEAR",
    "token": "USDC.near"
  },
  "constraints": {
    "maxFees": "5 USDC",
    "deadline": "30m"
  }
}
```

## Implementation Architecture

A cross-chain intent system typically includes:

1. **Chain Adapters**
   - Normalize chain-specific interactions
   - Handle signature generation
   - Manage RPC connections

2. **Bridge Interfaces**
   - Connect to popular bridge protocols
   - Optimize for speed and cost
   - Handle security verifications

3. **Gas Relayers**
   - Pay for transactions on destination chains
   - Optimize gas consumption
   - Recover costs through the intent system

## Solving Cross-chain Intents

Solvers for cross-chain intents:
1. Monitor intents on source chains
2. Calculate optimal bridge routes
3. Execute source chain transactions
4. Monitor and confirm destination chain completion
5. Report back to the verifier

## User Experience Improvements

With intent-based cross-chain UX:
- Users only need to express their goal
- No need to switch wallets or chains
- Single transaction approval
- Consistent interface regardless of chains involved
- Simplified tracking of cross-chain assets

## Future Directions

- Cross-chain composability beyond asset transfers
- Interoperable dApp experiences
- Chain-agnostic identity and authentication
- Multi-chain intent execution
