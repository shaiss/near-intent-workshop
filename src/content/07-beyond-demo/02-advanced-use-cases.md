# Advanced Use Cases for Intent Architecture

**Time**: 30 minutes  
**Pre-requisite**: Understanding of composability from 7.1

## Extending Your Workshop Implementation to Real-World Scenarios

The basic intent architecture we've built in this workshop demonstrates core concepts, but production applications often require more sophisticated capabilities. In this section, we'll explore how our workshop implementation could be extended to support real-world use cases.

> 💡 **Extension Note**: The use cases in this section would require additional components and infrastructure beyond what we've built in the workshop. We'll clearly indicate what extensions would be needed for each scenario.

## Use Case 1: Unified DeFi Access

### The Problem

In traditional DeFi, users must manually choose which DEX to use and navigate different interfaces. This creates friction and often results in suboptimal trades.

> 💡 **Web2 Parallel**: This is similar to how travel aggregators like Kayak or Expedia compare flights across multiple airlines, letting users simply specify their destination and dates without choosing a specific airline.

### Extended Intent Structure

Building on our workshop implementation, we would extend the Intent structure to support additional parameters for DeFi swaps:

```javascript
{
  "id": "defi-intent-123",
  "user_account": "alice.near",
  "action": "swap",
  "input_token": "USDC",
  "input_amount": "10000000000", // 10 USDC with 6 decimals
  "output_token": "wNEAR",
  "min_output_amount": null,
  "max_slippage": 0.5,
  // Extensions for DeFi-specific parameters
  "routing_preference": "best_price", // Options: best_price, lowest_gas, fastest
  "max_gas_usage": "100000000000000", // Maximum gas to spend
  "execution_deadline": 1692381924
}
```

### Implementation Requirements

To support this use case, you would need to extend your workshop implementation with:

1. **On-chain extensions**:

   - Enhanced Verifier contract that understands the additional parameters
   - Specialized DeFi Solver contracts that connect to various DEXes

2. **Off-chain components**:
   - Price discovery service to find the best routes across DEXes
   - Gas estimation service to calculate expected costs

### Code Example: DeFi Solver Extensions

```rust
// Extension to workshop's Solver contract for DeFi routing
impl DeFiSolver {
    // Find the best execution route across multiple DEXes
    pub fn find_optimal_route(&self, intent: &Intent) -> Option<ExecutionRoute> {
        let routes = self.get_possible_routes(
            intent.input_token.clone(),
            intent.output_token.clone(),
            intent.input_amount
        );

        // Sort routes based on user preference
        match intent.routing_preference.as_str() {
            "best_price" => self.sort_by_output_amount(routes),
            "lowest_gas" => self.sort_by_gas_usage(routes),
            "fastest" => self.sort_by_execution_time(routes),
            _ => self.sort_by_output_amount(routes) // Default to best price
        }
        .first()
        .cloned()
    }

    // Execute the optimal route
    pub fn execute_swap(&mut self, intent: Intent) -> Promise {
        let route = self.find_optimal_route(&intent)
            .expect("No valid route found");

        // Log the selected route
        env::log_str(&format!("Executing via route: {:?}", route));

        // Execute the route
        match route.dex.as_str() {
            "ref_finance" => self.execute_on_ref_finance(route, intent),
            "jumbo" => self.execute_on_jumbo(route, intent),
            _ => env::panic_str("Unsupported DEX")
        }
    }
}
```

## Use Case 2: Cross-Chain Token Swaps

### The Problem

Blockchain ecosystems exist in silos - assets on one chain can't easily be used on another without complex bridging processes that often require multiple steps and wallet approvals.

> 💡 **Web2 Parallel**: This is like offering a unified checkout experience across multiple e-commerce sites where users don't need to create separate accounts or enter payment details on each site.

### Extended Intent Structure

This use case would require a specialized intent structure that extends our base implementation to include cross-chain parameters:

```javascript
{
  "id": "cross-chain-intent-456",
  "user_account": "alice.near",
  "action": "cross_chain_swap",
  // Source chain details
  "source_chain": "near",
  "input_token": "USDC",
  "input_amount": "10000000000", // 10 USDC
  // Destination chain details
  "destination_chain": "ethereum",
  "output_token": "ETH",
  "min_output_amount": "500000000000000000", // 0.5 ETH
  "max_slippage": 1.0,
  // Security parameters
  "timeout_seconds": 1800, // 30 minutes
  "fallback_action": "refund" // What to do if the swap fails
}
```

### Implementation Requirements

This advanced use case would require substantial extensions:

1. **On-chain components**:

   - Cross-chain aware Verifier contract
   - Bridge-integrated Solver contracts
   - Chain-specific adapters for each supported blockchain

2. **Off-chain infrastructure**:
   - Relayer network to monitor and execute cross-chain transactions
   - Bridge monitoring service for transaction verification
   - Security fallback mechanisms

### Technology Spotlight: Chain Signatures

To enable cross-chain operations, you'd need Chain Signatures, a NEAR protocol feature that lets users sign messages that can be verified on other blockchains.

```javascript
// Front-end code using Chain Signatures (not part of workshop implementation)
async function createCrossChainIntent(userAccount, sourceParams, destParams) {
  // Initialize Chain Signatures client
  const chainSignatures = new ChainSignatures({
    network: "mainnet",
    wallet: connectedWallet,
  });

  // Create the intent
  const intent = {
    id: generateUniqueId(),
    user_account: userAccount,
    action: "cross_chain_swap",
    source_chain: sourceParams.chain,
    input_token: sourceParams.token,
    input_amount: sourceParams.amount,
    destination_chain: destParams.chain,
    output_token: destParams.token,
    min_output_amount: destParams.minAmount,
    max_slippage: 1.0,
    timeout_seconds: 1800,
    fallback_action: "refund",
  };

  // Sign the intent for cross-chain verification
  const signedIntent = await chainSignatures.signIntent(intent);

  return signedIntent;
}
```

### 1. Chain Signatures: Signing for Other Chains

**Concept**: Allow users to create intents that require actions on _other_ blockchains (e.g., Ethereum, Solana) by using NEAR's Chain Signatures feature.

**How it Works**: NEAR validators can collectively generate threshold signatures for other chains. An intent could request such a signature to authorize an action (like an Ethereum transaction) originating from the user's NEAR account, executed via a specialized relayer.

```javascript
// Conceptual Frontend Snippet (highly simplified)
// Assumes existence of ChainSignatures class/library and Verifier support

async function submitEthereumTransferIntent(amount, recipient) {
  const intent = {
    action: "transfer_eth", // Special action type understood by Verifier/Solver
    params: {
      target_chain: "ethereum",
      token: "USDC", // ERC-20 on Ethereum
      amount: amount, // Amount in USDC's decimals
      recipient: recipient, // Ethereum address
    },
    // ... other intent fields (user, constraints)
  };

  // 1. Submit intent to NEAR Verifier
  const verifiedIntent = await verifier.verify_intent({ intent });

  // 2. Request Chain Signature for the Ethereum transaction payload
  // This is the complex part involving NEAR's Chain Signatures MPC network
  // Assumes a library abstracts this interaction.
  const ethPayload = createEthereumTransferPayload(amount, recipient);
  // NOTE: ChainSignatures depends on a specific NEAR protocol feature.
  const chainSignatures = new ChainSignatures(nearConnection); // Hypothetical library
  const ethSignature = await chainSignatures.requestSignature(
    "ethereum",
    ethPayload
  );

  // 3. Solver/Relayer uses ethSignature to execute on Ethereum
  // A specialized solver would pick up the verified intent AND the corresponding ethSignature
  // and submit the transaction to Ethereum via a relayer.
  console.log(
    "Submitted intent and obtained Ethereum signature:",
    ethSignature
  );
}
```

**Extension Notes (Chain Signatures):**

- **Feasibility**: Requires Future Protocol Features (Chain Signatures must be fully deployed & accessible) & Significant Infrastructure (Specialized Solvers/Relayers).
- **Complexity**: Very high. Involves understanding MPC networks, threshold signatures, specific chain transaction formats (e.g., Ethereum RLP encoding), and building relayers capable of submitting transactions on target chains.
- **Security**: Relies heavily on the security of NEAR's Chain Signature implementation and the relayer infrastructure.
- **Current Status**: Chain Signatures are an advanced, potentially experimental feature on NEAR. Check official NEAR documentation for current status and availability.

## Use Case 3: Enhanced Wallet Experience with Session Keys

### The Problem

Regular blockchain transactions require wallet confirmation for every action, creating friction in user experience. Session keys can dramatically improve this.

> 💡 **Web2 Parallel**: This is similar to how apps use OAuth refresh tokens or "Keep me logged in" functionality to avoid requiring password re-entry for every operation.

### How This Extends Our Workshop Implementation

Module 4 of our workshop already introduced session keys. Here's how we can extend that foundation to support more advanced patterns:

```javascript
// Enhanced session key configuration (extends Module 4 implementation)
const sessionKeyConfig = {
  // Basic configuration from our workshop
  publicKey: "ed25519:AbCdEf123456...",
  allowance: "250000000000000000000000", // 0.25 NEAR

  // Extended permissions for multiple contracts
  receiverId: ["verifier.near", "defi.near", "nft.near"],

  // Fine-grained method controls
  methodNames: {
    "verifier.near": ["verify_intent", "verify_and_solve"],
    "defi.near": ["swap", "deposit", "withdraw"],
    "nft.near": ["transfer", "mint"],
  },

  // Transaction limits
  maxTransactionsPerDay: 20,

  // Time-based expiration
  expirationTimestamp: 1692381924,
};
```

### Implementation Requirements

1. **On-chain extensions**:

   - Enhanced smart wallet contract with support for complex permission patterns
   - Integration with authentication providers

2. **Off-chain components**:
   - Session management service
   - Transaction simulation for security checks

### Code Example: Meta-Transactions for Gasless UX

Building on session keys, meta-transactions allow users to perform actions without having NEAR tokens for gas - a relay pays for gas on their behalf:

```javascript
// Client-side code for creating a meta-transaction
async function createMetaTransaction(userAccount, action) {
  // 1. User signs the transaction data but doesn't submit it
  const transaction = {
    signerId: userAccount,
    receiverId: "verifier.near",
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: "verify_intent",
          args: {
            intent: {
              id: "meta-tx-intent-789",
              user_account: userAccount,
              action: "swap",
              // Other intent parameters...
            },
          },
          gas: "300000000000000",
          deposit: "0",
        },
      },
    ],
  };

  // User signs the transaction data
  const signedData = await wallet.signMessage({
    message: JSON.stringify(transaction),
    recipient: "relay.near",
  });

  // 2. Send the signed data to a relayer service
  const response = await fetch("https://relay.near.org/submit", {
    method: "POST",
    body: JSON.stringify({
      signedTransaction: signedData,
      userAccount: userAccount,
    }),
  });

  // 3. Relayer executes the transaction, paying gas
  return await response.json();
}
```

> 💡 **Implementation Note**: True meta-transactions require a specialized relayer service and contract modifications to verify the user's signature within the contract.

### 2. Meta-Transactions: Gasless Experiences

**Concept**: Allow users to submit intents without needing NEAR tokens for gas. A third-party relayer pays the gas fees.

**How it Works**: The user signs the _intent data itself_ (off-chain). This signed intent is sent to a Relayer service. The Relayer wraps the intent and the user's signature into an actual NEAR transaction (calling the Verifier), paying the gas fees itself. The Verifier contract must be modified to accept this structure and validate the embedded user signature instead of relying solely on `env::predecessor_account_id()`.

```javascript
// Conceptual Frontend Snippet

async function submitGaslessIntent(intentObject) {
  // Assume nearConnection is set up, but user might not have gas tokens.
  // Assume `keyPair` holds the user's keypair (e.g., from a session).
  const keyPair = await getKeyPairForUser(); // Hypothetical function

  // 1. Sign the intent data payload directly (off-chain)
  const intentJson = JSON.stringify(intentObject);
  const messageBytes = Buffer.from(intentJson);
  const signature = keyPair.sign(messageBytes);

  // 2. Prepare data for the relayer
  const relayerPayload = {
    intent: intentObject,
    signature: {
      publicKey: keyPair.publicKey.toString(),
      signatureBytes: Buffer.from(signature).toString("base64"),
    },
  };

  // 3. Send to a trusted Relayer service endpoint
  // WARNING: Relayer selection involves trust!
  const RELAYER_URL = "<YOUR_RELAYER_ENDPOINT_URL>"; // Placeholder for Relayer API
  try {
    const response = await fetch(RELAYER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(relayerPayload),
    });

    if (!response.ok) {
      throw new Error(`Relayer error: ${await response.text()}`);
    }
    const result = await response.json(); // e.g., { transactionHash: "..." }
    console.log(
      "Gasless intent submitted via relayer:",
      result.transactionHash
    );
    return result;
  } catch (error) {
    console.error("Failed to submit gasless intent:", error);
    throw error;
  }
}
```

```rust
// Conceptual Verifier Contract Modification (Rust)

// Structure to receive relayed intent
#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct SignedIntent {
    intent: Intent,         // The original intent object
    signature: NearSignature, // User's signature over the intent
}

// Modified Verifier method
#[near_bindgen]
impl Verifier {
    // New method for relayers to call
    pub fn submit_relayed_intent(&mut self, signed_intent: SignedIntent) -> bool {
        // Log who the relayer is (predecessor)
        let relayer_id = env::predecessor_account_id();
        env::log_str(&format!("Received relayed intent from: {}", relayer_id));

        // Extract user account ID from the intent payload
        let user_account_id: AccountId = signed_intent.intent.user_account.parse()
            .expect("Invalid user account ID in intent");

        // Verify the embedded user signature against the intent data
        let intent_bytes = near_sdk::serde_json::to_vec(&signed_intent.intent).expect("Failed to serialize intent");
        let signature_valid = signed_intent.signature.verify(&intent_bytes, &user_account_id);

        assert!(signature_valid, "Invalid user signature on intent");
        env::log_str(&format!("User signature verified for: {}", user_account_id));

        // Now perform standard intent verification (deadlines, constraints etc.)
        // NOTE: Use `user_account_id` from the *intent payload* for checks, NOT `relayer_id`.
        let is_valid = self.validate_intent_logic(&signed_intent.intent, &user_account_id);

        if is_valid {
            self.store_verified_intent(&signed_intent.intent);
        }
        is_valid
    }

    // Extracted validation logic reused by direct and relayed submissions
    fn validate_intent_logic(&self, intent: &Intent, user_account_id: &AccountId) -> bool {
        // ... perform deadline checks, constraint checks, etc. ...
        // Example: Check if user is allowed to perform this action
        // assert!(self.is_user_authorized(user_account_id), "User not authorized");
        true // Placeholder for actual logic
    }

    fn store_verified_intent(&mut self, intent: &Intent) {
        // ... logic to store intent ...
    }
}

// Placeholder for signature structure (adapt based on actual library used)
#[derive(Deserialize, Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct NearSignature {
    publicKey: String, // Base58 encoded public key
    signatureBytes: String // Base64 encoded signature bytes
    // Method to verify signature (implementation depends on crypto library)
    // fn verify(&self, message: &[u8], user_account_id: &AccountId) -> bool { ... }
}
```

**Extension Notes (Meta-Transactions):**

- **Feasibility**: Requires Contract Modifications (Verifier) & Off-Chain Services (Relayer).
- **Complexity**: Moderate. Requires building/hosting a reliable Relayer service and modifying the Verifier contract to handle signature verification within arguments.
- **Relayer Trust**: Users must trust the Relayer service not to censor or tamper with their signed intents before submitting them on-chain (though the signature prevents tampering with the intent _content_).
- **Cost Model**: The Relayer needs a business model (e.g., dApp sponsorship, taking a small fee from the execution).
- **Placeholders**: `<YOUR_RELAYER_ENDPOINT_URL>` is illustrative.

## Use Case 4: DAO and Multisig Integration

### The Problem

Traditional DAO operations often require complex governance processes for financial decisions. Intent-based architecture can streamline this flow.

> 💡 **Web2 Parallel**: This is similar to how enterprise systems use approval workflows where transactions require multiple authorizations based on predefined rules.

### Extended Intent Structure

This use case leverages the composability we discussed in 7.1, with additional DAO-specific parameters:

```javascript
{
  "id": "dao-intent-101112",
  "user_account": "dao.near", // The DAO account is the sender
  "action": "compose",
  "compose_type": "sequential",
  "steps": [
    {
      "action": "swap",
      "input_token": "USDC",
      "input_amount": "1000000000000", // 1M USDC
      "output_token": "ETH",
      "min_output_amount": null,
      "max_slippage": 0.5
    },
    {
      "action": "bridge",
      "input_token": "ETH",
      "input_amount": "$PREVIOUS_OUTPUT",
      "destination_chain": "ethereum",
      "recipient": "dao-treasury.eth"
    }
  ],
  // DAO-specific parameters
  "approval_threshold": 3, // Number of approvals needed
  "approved_by": ["council-1.near", "council-2.near"], // Current approvals
  "execution_window_start": 1692381924,
  "execution_window_end": 1692468324
}
```

### Implementation Requirements

1. **On-chain extensions**:

   - Multisig contract with intent execution capabilities
   - DAO governance contract integration
   - Threshold signature schemes

2. **Off-chain components**:
   - Approval collection and verification system
   - Execution monitoring and reporting tools

### Code Example: DAO Integration

```rust
// Rust contract code for DAO intent execution
#[near_bindgen]
impl DAOContract {
    pub fn propose_intent(&mut self, intent: Intent) -> ProposalId {
        // Verify the caller is a DAO member
        self.assert_is_member(env::predecessor_account_id());

        // Create a proposal with the intent
        let proposal_id = self.next_proposal_id;
        self.next_proposal_id += 1;

        let proposal = Proposal {
            id: proposal_id,
            proposer: env::predecessor_account_id(),
            intent: intent,
            votes_for: vec![env::predecessor_account_id()], // Proposer automatically votes yes
            votes_against: vec![],
            status: ProposalStatus::Active,
            created_at: env::block_timestamp(),
        };

        self.proposals.insert(&proposal_id, &proposal);

        proposal_id
    }

    pub fn vote(&mut self, proposal_id: ProposalId, vote: Vote) {
        // Implementation of voting logic
        // ...
    }

    pub fn execute_proposal(&mut self, proposal_id: ProposalId) -> Promise {
        let proposal = self.proposals.get(&proposal_id).expect("Proposal not found");

        // Verify proposal passed and is ready for execution
        assert_eq!(proposal.status, ProposalStatus::Approved, "Proposal not approved");

        // Execute the intent using the Verifier contract
        ext_verifier::verify_and_solve(
            proposal.intent.clone(),
            self.solver_account_id.clone(),
            &self.verifier_account_id,
            0, // No deposit
            Gas(100 * TGAS)
        )
    }
}
```

## Getting Started with Advanced Use Cases

While the full implementation of these use cases goes beyond our workshop, you can begin exploring them by:

1. **Start small**: Pick one extension (e.g., adding routing_preference to your Intent structure)
2. **Modify your Verifier**: Update it to accept and validate the extended parameters
3. **Build a specialized Solver**: Create a solver that demonstrates the new capability
4. **Test incrementally**: Begin with simple extensions before moving to complex cross-chain scenarios

## Implementation Resources

For developers interested in extending their workshop implementation to support these advanced use cases:

- [NEAR Chain Signatures Documentation](https://docs.near.org/chain-signatures)
- [Meta Transactions Guide](https://docs.near.org/meta-transactions)
- [FastAuth Documentation](https://docs.near.org/fastauth)
- [NEAR <> Ethereum Bridge Guide](https://docs.near.org/bridge)
- [AstroDAO Integration](https://docs.near.org/astrodao)

> 💡 **Timeline Note**: Some of these advanced features (like Chain Signatures) are rapidly evolving. Check the NEAR documentation for the latest implementation details.

In the next section, we'll explore how intent architecture can be applied to cross-chain use cases, enabling truly interoperable decentralized applications.
