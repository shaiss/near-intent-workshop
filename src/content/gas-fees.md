
# Gas & Fees Model

## Understanding Gas in NEAR

Gas is used to measure computational resources used when executing transactions:

- Each operation costs a specific amount of gas
- Gas is paid in NEAR tokens
- Gas prices can fluctuate based on network demand

## Gas Costs for Intent Operations

Different intent operations have different gas costs:

1. **Intent Submission**
   - Basic validation: ~5 TGas
   - Storage of intent data: ~10 TGas per KB

2. **Intent Execution**
   - Varies widely based on complexity
   - Swap operations: ~20-50 TGas
   - Cross-chain operations: ~100+ TGas

## Fee Models for Intents

There are several fee models that can be implemented for intent execution:

### 1. Fixed Fee Model

```javascript
const FIXED_FEE_PERCENTAGE = 0.1; // 0.1%

function calculateFixedFee(amount) {
  return amount * (FIXED_FEE_PERCENTAGE / 100);
}
```

### 2. Gas-based Fee Model

```javascript
function calculateGasFee(gasUsed, gasPrice) {
  return gasUsed * gasPrice;
}
```

### 3. Competitive Fee Model

```javascript
function calculateCompetitiveFee(baseAmount, marketDemand) {
  const baseFee = baseAmount * 0.001; // 0.1% base fee
  const demandMultiplier = 1 + (marketDemand / 100);
  return baseFee * demandMultiplier;
}
```

## Implementing Fee Collection

Fees can be collected in different ways:

```rust
// In the solver contract
pub fn execute_intent_with_fee(&mut self, intent_id: String) -> Promise {
    let intent = self.get_intent_from_verifier(intent_id.clone());
    
    // Calculate fee amount
    let fee_amount = self.calculate_fee(&intent);
    
    // Execute the intent
    let execution_promise = self.execute_intent(intent);
    
    // Collect the fee
    execution_promise.then(
        Promise::new(self.fee_collector_account.clone())
            .transfer(fee_amount)
    )
}
```

## Fee Distribution

Fees can be distributed to various stakeholders:

```rust
pub struct FeeDistribution {
    pub protocol_share: u64, // e.g., 20%
    pub solver_share: u64,   // e.g., 70%
    pub dao_share: u64,      // e.g., 10%
}

pub fn distribute_fees(&mut self, total_fee: Balance) -> Promise {
    let protocol_amount = total_fee * self.fee_distribution.protocol_share / 100;
    let solver_amount = total_fee * self.fee_distribution.solver_share / 100;
    let dao_amount = total_fee * self.fee_distribution.dao_share / 100;
    
    Promise::new(self.protocol_treasury.clone()).transfer(protocol_amount)
        .and(Promise::new(env::predecessor_account_id()).transfer(solver_amount))
        .and(Promise::new(self.dao_account.clone()).transfer(dao_amount))
}
```

## Gas Efficiency Optimization

To optimize gas usage in your intents:

1. **Batch Operations**
   - Combine multiple operations into a single transaction
   - Reduce overall gas costs

2. **Storage Optimization**
   - Minimize on-chain data storage
   - Use efficient data structures

3. **Compute Optimization**
   - Optimize algorithmic complexity
   - Reduce unnecessary computations

## Fee Transparency for Users

Users should always be informed about fees:

```javascript
// In the frontend
function displayFeeEstimate(intent) {
  const estimatedGas = estimateGasForIntent(intent);
  const estimatedFee = calculateFeeFromGas(estimatedGas);
  
  return {
    estimatedGas,
    estimatedFeeNEAR: formatNearAmount(estimatedFee),
    estimatedFeeUSD: convertNearToUSD(estimatedFee)
  };
}
```

## Economic Sustainability

A well-designed fee model ensures:

1. **Solver Incentives**
   - Solvers are motivated to compete for intent execution
   - More efficient solvers can make more profit

2. **Protocol Sustainability**
   - Protocol can cover operational costs
   - Development can be funded through fees

3. **User Value**
   - Fees remain reasonable for users
   - Value provided exceeds the cost
