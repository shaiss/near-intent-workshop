# Project Ideas & Next Steps

**Time**: 20 minutes  
**Pre-requisite**: Completed workshop implementation

## From Workshop Implementation to Your Own Projects

You've built a solid foundation with your intent architecture implementation. Now, let's explore how you can extend and apply what you've learned to create your own projects. Each idea below builds directly on specific components you've already implemented.

## Beginner Projects (1-2 days)

### 1. Extend Your Intent Verifier with Additional Intent Types

**Builds on**: Module 3 - Verifier Contract  
**Skills**: Rust, Smart Contract Development  
**Files to modify**: `contracts/verifier/src/lib.rs`

In the workshop, we implemented support for basic swap and transfer intents. Extend your Verifier to support additional intent types like staking or voting.

**Sample Code**:

```rust
// Add to your Intent enum in contracts/verifier/src/lib.rs
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum IntentAction {
    Swap,
    Transfer,
    Stake,  // New intent type
    Vote,   // New intent type
}

// Add validation logic for the new intent types
impl IntentVerifier {
    pub fn validate_stake_intent(&self, intent: &Intent) -> bool {
        // Validate stake-specific parameters
        if intent.action != IntentAction::Stake {
            return false;
        }

        // Verify the validator account exists
        if let Some(validator) = &intent.validator {
            // Check if validator is in the whitelist
            self.valid_validators.contains(validator)
        } else {
            false
        }
    }
}
```

### 2. Create a Transaction History UI Component

**Builds on**: Module 5 - Frontend  
**Skills**: React, JavaScript/TypeScript, CSS  
**Files to modify**: `frontend/components/` (add new component)

Add a transaction history component to your frontend that displays past intents and their execution status.

**Sample Code**:

```jsx
// Create a new file: frontend/components/IntentHistory.jsx
import React, { useEffect, useState } from "react";
import { useNear } from "../contexts/NearContext";

export const IntentHistory = () => {
  const { nearConnection, accountId } = useNear();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!accountId) return;

    async function fetchHistory() {
      // Fetch the user's intent history from your backend or local storage
      const result = await nearConnection.contract.get_user_intents({
        user_account: accountId,
      });
      setHistory(result || []);
    }

    fetchHistory();
  }, [accountId, nearConnection]);

  return (
    <div className="intent-history">
      <h2>Your Intent History</h2>
      {history.length === 0 ? (
        <p>No intent history found</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Intent ID</th>
              <th>Action</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {history.map((intent) => (
              <tr key={intent.id}>
                <td>{intent.id}</td>
                <td>{intent.action}</td>
                <td>{intent.status}</td>
                <td>{new Date(intent.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

## Intermediate Projects (3-7 days)

### 1. Build a Specialized Solver for a DeFi Protocol

**Builds on**: Module 3 - Solver Contract  
**Skills**: Rust, DeFi Integration, NEAR Cross-contract Calls  
**Files to modify**: Create a new solver contract

Create a specialized solver that interacts with a specific DeFi protocol like [Ref Finance](https://www.ref.finance/) to provide optimized swaps.

**Implementation Steps**:

1. Clone your workshop solver contract as a starting point
2. Add integration with the DeFi protocol's contracts
3. Implement specialized routing logic for the best execution path
4. Extend your Verifier to recognize and route intents to this new solver

**Sample Code for Ref Finance Integration**:

```rust
#[near_bindgen]
impl RefFinanceSolver {
    // Find the best swap route on Ref Finance
    pub fn find_optimal_route(&self, intent: &Intent) -> Promise {
        // Query Ref Finance for available pools
        ext_ref_finance::get_pools(
            intent.input_token.clone(),
            intent.output_token.clone(),
            &self.ref_finance_contract,
            0,
            Gas(10 * TGAS)
        )
        .then(
            Self::ext(env::current_account_id())
                .with_static_gas(Gas(10 * TGAS))
                .process_pools_result(intent.clone())
        )
    }

    #[private]
    pub fn process_pools_result(&mut self, intent: Intent, #[callback] pools: Vec<Pool>) -> Promise {
        // Find the pool with the best exchange rate
        if let Some(best_pool) = self.select_best_pool(pools) {
            // Execute the swap on the selected pool
            ext_ref_finance::swap(
                intent.input_token.clone(),
                intent.output_token.clone(),
                intent.input_amount,
                best_pool.id,
                &self.ref_finance_contract,
                1, // Attach 1 yoctoNEAR for access key verification
                Gas(40 * TGAS)
            )
        } else {
            // No suitable pool found
            Promise::new(env::current_account_id()).then(
                Self::ext(env::current_account_id())
                    .with_static_gas(Gas(5 * TGAS))
                    .return_failure("No suitable pool found")
            )
        }
    }
}
```

### 2. Add Meta-Transaction Support for Gasless UX

**Builds on**: Module 4 - Smart Wallet  
**Skills**: Rust, Cryptography, Relay Infrastructure  
**Files to modify**: `contracts/smart-wallet/src/lib.rs` and add a relay service

Extend your smart wallet to support meta-transactions, allowing users to perform transactions without needing NEAR tokens for gas.

**Implementation Steps**:

1. Enhance your smart wallet contract to validate signatures for meta-transactions
2. Create a simple relay server that submits transactions on behalf of users
3. Update your frontend to support signing messages without submitting transactions

**Project Resources**:

- [NEAR Meta Transactions Guide](https://docs.near.org/concepts/abstraction/meta-transactions)
- [Example Meta TX Relay](https://github.com/near-examples/meta-transactions-relay)

## Advanced Projects (1-3 weeks)

### 1. Cross-Chain Intent Execution System

**Builds on**: Modules 3, 6, and 7.3  
**Skills**: Rust, JavaScript, Cross-Chain Communication, Bridge Integration  
**Files to modify**: Multiple contracts and frontend components

Create a system that can accept intents on NEAR and execute them on other chains like Aurora or Ethereum.

**Implementation Resources**:

- [Rainbow Bridge Documentation](https://rainbowbridge.app/docs)
- [NEAR Chain Signatures](https://docs.near.org/concepts/abstraction/chain-signatures)
- [Aurora Engine](https://doc.aurora.dev/)

### 2. Intent-Driven DAO Treasury Management

**Builds on**: Modules 3, 5, and 7.2  
**Skills**: Rust, React, DAO Governance  
**Files to modify**: Create new contracts and frontend components

Build a DAO treasury management system that uses intents to propose and execute financial operations like investments, swaps, and yield farming.

**Implementation Resources**:

- [AstroDAO GitHub](https://github.com/near-daos/astro-dao)
- [NEAR SputnikDAO Documentation](https://docs.near.org/build/dapps/dao)

## Hackathon Project Ideas

Planning to join a hackathon? Here are some innovative ideas that could stand out:

1. **Intent-Driven Social Recovery Wallet** - Build a smart wallet with social recovery using intents to initiate and approve recovery actions
2. **AI-Powered Intent Optimizer** - Create a system that uses AI to suggest optimal parameters for intents based on market conditions
3. **Cross-App Intent Framework** - Develop a framework that allows intents to span multiple dApps in a single transaction

## Sharing Your Projects

The NEAR community is eager to see what you build:

- [Join the NEAR Developer Discord](https://near.chat): Share your project in the #show-and-tell channel
- [Post on the NEAR Developer Forum](https://gov.near.org/c/dev/6): Get feedback and connect with potential collaborators
- [Participate in NEAR Hackathons](https://near.org/hackathons): Apply your skills in competitive events
- [Submit to the NEAR Grants Program](https://near.org/grants): Get funding for promising projects

## Open Source Contributions

Want to contribute to the ecosystem? These projects actively welcome contributions:

- [NEAR Intent Framework](https://github.com/near/intents): Help improve the core intent infrastructure
- [NEAR Wallet Selector](https://github.com/near/wallet-selector): Enhance wallet connection UX
- [Intent Documentation](https://github.com/near/docs/tree/master/docs/3.tutorials/integrations/intents): Improve educational resources about intents

---

Remember that the most important next step is to start building. Take what you've learned in this workshop, choose a project that excites you, and begin extending your implementation. The NEAR community is here to support your journey.

In the next section, we'll wrap up the workshop with a summary of what you've learned.
