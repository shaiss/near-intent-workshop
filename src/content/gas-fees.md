# Gas & Fees Model

## Understanding the Economics of Intent Systems

Intent-based systems have a unique economic model with several fee components:

1. **Gas Fees**: NEAR network fees for contract execution
2. **Solver Fees**: Fees charged by solvers for fulfilling intents
3. **Protocol Fees**: Optional fees for the intent protocol itself
4. **DEX/Protocol Fees**: Fees paid to the underlying protocols used during execution

## Gas Optimization Techniques

Optimizing gas usage in intent contracts:

```rust
// Instead of storing full intents
pub struct Verifier {
    // Store only intent IDs and minimal metadata
    pub verified_intents: LookupMap<String, IntentStatus>,
}

// Use efficient storage patterns
#[derive(BorshDeserialize, BorshSerialize)]
pub struct IntentStatus {
    pub verified: bool,
    pub timestamp: u64,
    pub user: AccountId,
}

// Batch operations when possible
pub fn verify_multiple_intents(&mut self, intents: Vec<Intent>) -> Vec<bool> {
    let mut results = Vec::with_capacity(intents.len());

    for intent in intents {
        results.push(self.verify_intent(intent));
    }

    results
}
```

## Fee Models for Solvers

Solvers can implement various fee models:

1. **Fixed Fee**: Charge a fixed fee per intent
2. **Percentage Fee**: Charge a percentage of the swap amount
3. **Tiered Fee**: Different fees based on intent size
4. **Dynamic Fee**: Adjust fees based on market conditions
5. **Success Fee**: Charge only for successful executions

Example implementation:

```rust
pub enum FeeModel {
    Fixed(Balance),
    Percentage(u32), // Basis points (1/100 of a percent)
    Tiered(Vec<(Balance, u32)>), // (threshold, fee_bps) pairs
}

impl Solver {
    pub fn calculate_fee(&self, amount: Balance) -> Balance {
        match &self.fee_model {
            FeeModel::Fixed(fee) => *fee,
            FeeModel::Percentage(bps) => (amount * (*bps as u128)) / 10_000,
            FeeModel::Tiered(tiers) => {
                for (threshold, fee_bps) in tiers.iter().rev() {
                    if amount >= *threshold {
                        return (amount * (*fee_bps as u128)) / 10_000;
                    }
                }
                0 // No fee for amounts below the lowest tier
            }
        }
    }
}
```

## Incentive Alignment

For a healthy intent ecosystem:

1. **Solver Competition**: Multiple solvers compete to provide the best execution
2. **Fee Transparency**: Users clearly see all fees before submission
3. **Performance Incentives**: Reward solvers for better execution prices
4. **Reputation Systems**: Track solver performance over time

## MEV Protection

Miner/Validator Extractable Value (MEV) protection:

1. **Private Intents**: Keep intents private until execution
2. **Batch Execution**: Group intents together to reduce MEV opportunities
3. **Slippage Protection**: Enforce strict slippage limits
4. **Time Locks**: Prevent last-minute intent changes

## Cost Comparison

When designing your intent system, consider these costs:

| Approach | Gas Costs | UX | Implementation Complexity |
|----------|-----------|----|-----------------------------|
| Direct Smart Contract | Low | Complex | Simple |
| Basic Intent System | Medium | Better | Medium |
| Advanced Intent System | High | Best | Complex |

## Optimizing User Costs

Strategies to reduce costs for users:

1. **Batching**: Combine multiple user intents into a single transaction
2. **Offchain Verification**: Perform preliminary verification off-chain
3. **Gasless Transactions**: Use meta-transactions with relayers
4. **Session Keys**: Enable multiple intents without multiple signatures

These optimizations create a better user experience while keeping the system economically viable.

In the next section, we'll start building the Smart Wallet layer that will interact with our intent infrastructure.