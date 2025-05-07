# 2.2: Anatomy of an Intent - Peeling Back the Layers

**Estimated Time:** 30 minutes
**Prerequisites:** Understanding of intent concepts from section 2.1
**Learning Objectives:**

- Understand the structure and components of an intent object
- Identify how constraints and preferences work in intent-based systems
- Recognize the roles of verifiers and solvers in processing intents

In the [previous section (2.1)](mdc:./01-intents-concept.md), we established that an intent is a user's declarative statement of _what_ they want to achieve. Now, let's dissect the typical structure of an intent object to understand _how_ it formally captures those desires and constraints. This anatomy is crucial for Verifiers to validate intents and for Solvers to find ways to fulfill them.

## Core Intent Object Structure

> 💡 **Web2 Analogy**: You can think of an intent as a structured API request in Web2 development. Just as a REST API might expect a specific JSON structure with certain required fields, an intent requires specific properties like action type, parameters, and authentication details. The difference is that an intent focuses on the desired outcome rather than the specific API endpoints to call.

A NEAR intent is generally represented as a JSON object. While specific implementations can vary, a common structure includes the following key parts. The comments explain each field's purpose.

```json
{
  "schemaVersion": "1.0.0", // Optional: Version of the intent structure itself
  "intentId": "user-generated-unique-id-or-hash", // Optional: A unique identifier for this specific intent instance
  "originator": "user.near", // The account initiating the intent

  "action": {
    "type": "swap", // The primary category of action (e.g., swap, transfer, stake)
    "details": {
      // Specifics for this action type
      "fromToken": "usdc.token.near",
      "fromAmount": "100000000", // 100 USDC (assuming 6 decimals)
      "toToken": "wnear.token.near" // wNEAR (Wrapped NEAR) is often used in DeFi protocols
    }
  },

  "constraints": {
    // Conditions that MUST be satisfied for the intent to be valid and executable
    "maxSlippagePercent": "0.5", // Maximum acceptable price difference from the quoted/oracle price at execution
    "deadlineTimestamp": "1678889400", // Unix timestamp (seconds) after which the intent expires and should not be executed.
    // Important for time-sensitive operations like trades, to avoid execution under stale market conditions.
    "minOutputAmount": "84000000000000000000000000" // Optional: Minimum amount of 'toToken' the user must receive
  },

  "preferences": {
    // Optional: User's preferences that Solvers MAY consider
    "solverPreference": "fastest", // e.g., "fastest", "cheapest", "most_reputable_solver"
    "routePriority": ["direct_pool_A", "aggregator_B"] // e.g., preferred DEXes or paths
  },

  "metadata": {
    // Optional: Additional non-critical information for context or off-chain processing
    "sourceDApp": "MyAwesomeDeFiApp",
    "uiVersion": "1.2.3",
    "notes": "User initiated swap for weekly rebalance."
  },

  "signature": "user_signature_over_hash_of_above_fields" // Cryptographic signature of the originator, ensuring authenticity and integrity
}
```

### Dissecting the Key Sections:

- **`schemaVersion`, `intentId`, `originator`**: Basic envelope information. The `originator` is key for Verifiers to check ownership and permissions.
- **`action` (Object)**:
  - `type`: A high-level category (e.g., `swap`, `transfer`, `stake`, `liquid_stake`, `vote`, `execute_contract_call`). This helps Verifiers and Solvers route the intent to appropriate logic.
  - `details`: A nested object containing parameters specific to the `action.type`. For a `swap`, this includes tokens and amounts. For a `transfer`, it would be `recipient`, `token`, `amount`.
- **`constraints` (Object)**:
  - These are **hard rules**. If a Solver cannot meet these, the intent should not be executed. Verifiers check these rigorously.
  - `maxSlippagePercent`: Protects users from unfavorable price changes during a swap.
  - `deadlineTimestamp`: Prevents execution of outdated intents.
  - `minOutputAmount`: Guarantees the user receives at least a certain amount in return.
  - Other constraints could include specific permissions, required on-chain states, or even results from other (linked) intents.
- **`preferences` (Object)**:
  - These are **soft rules** or hints for Solvers. Solvers are not strictly required to follow them but may use them to choose between multiple valid fulfillment paths. For example, if two Solvers can achieve the same outcome within constraints, one might be chosen if it aligns with `solverPreference: "cheapest"`.
- **`metadata` (Object)**:
  - Useful for dApps, analytics, or providing extra context to Solvers or users later. Generally not used for core validation logic.
- **`signature`**: Crucial for security. The Verifier will use this to confirm that the intent was indeed created and authorized by the `originator` and hasn't been tampered with.

## How System Components Interact with Intent Anatomy

> **CORE CONCEPT: Verifier Contracts**
>
> A verifier contract acts as the gatekeeper for intent execution. It validates that:
>
> - The intent format is correct and follows the expected schema
> - The intent is properly signed by the originator
> - The requested action is permitted for this user
> - All constraints (time limits, slippage, etc.) are satisfied
> - The intent hasn't already been executed or expired
>
> Only after passing verification is an intent forwarded to a solver contract for execution.

> **CORE CONCEPT: Solver Contracts**
>
> Solver contracts implement the business logic to fulfill validated intents. A solver:
>
> - Receives verified intents from the verifier
> - Determines the optimal way to execute the requested action
> - Performs the necessary blockchain operations to fulfill the intent
> - Ensures constraints are respected during execution
> - Reports results back to the verifier and ultimately to the user
>
> Multiple solvers might compete to provide the best execution for a given intent.

- **User & dApp**: The dApp helps the user construct this JSON object, often abstracting the complexity via a user-friendly interface.
- **Verifier (Smart Contract)**: Receives the signed intent. Its primary job is to:
  1.  Check the `signature` against the `originator`.
  2.  Validate the overall `action.type` and `action.details` for structural correctness and known parameters.
  3.  Rigorously check all conditions in `constraints`. For a swap, it would verify `maxSlippagePercent`, `deadlineTimestamp`, and potentially simulate if `minOutputAmount` is achievable with current (oracle) prices before marking the intent as "verified" or "invalid."
- **Solver (Often Off-Chain Service)**: Looks for verified intents. A Solver specializing in swaps would:
  1.  Analyze the `action.details` (tokens, amounts).
  2.  Consider the `constraints` (slippage, deadline) as hard limits.
  3.  Optionally consider `preferences` to tailor its solution.
  4.  Propose a fulfillment plan, including the expected outcome and potentially its fee.

## Visualizing the Flows (Refined)

Let's revisit and clarify the flows with this anatomical understanding.

### Simplified Intent Lifecycle Flow

This shows the journey from user idea to on-chain execution.

```mermaid
flowchart TD
    A[User expresses goal via dApp UI] --> B(dApp crafts signed Intent Object)
    B --> C{Verifier Contract: Validates Signature & Constraints}
    C -- Intent Invalid --> E[Feedback to User: Rejected]
    C -- Intent Valid --> D[Verified Intent available to Solvers]
    D --> F{Solver(s): Analyze & Propose Fulfillment Plan(s)}
    F --> G{Selection Logic: Chooses best Solver Proposal (based on price, speed, user preferences etc.)}
    G --> H[Chosen Solver executes via User's Smart Wallet (or directly)]
    H --> I{On-Chain Execution & Outcome Verification}
    I -- Success --> J[Feedback to User: Fulfilled]
    I -- Failure within execution --> K[Feedback to User: Execution Failed (Solver may bear cost or retry)]
```

- **Fulfillment Evaluation/Selection Logic**: This step, often managed by the Verifier, a dedicated "Matcher" contract, or even the user's Smart Wallet based on pre-set rules, evaluates Solver proposals. It checks if the proposal meets the original intent's constraints and preferences, then selects the optimal one.

### Core Interaction Sequence

This sequence diagram highlights the messages between key actors.

```mermaid
sequenceDiagram
    actor User
    participant DApp
    participant VerifierContract as Verifier
    participant SolverService as Solver
    participant SmartWalletContract as Smart Wallet
    participant Blockchain

    User->>+DApp: Define desired outcome
    DApp->>DApp: Construct & Sign Intent Object (with User's key via Wallet)
    DApp->>VerifierContract: Submit Signed Intent
    VerifierContract->>VerifierContract: Validate Signature, Structure, Constraints
    alt Intent Valid
        VerifierContract-->>SolverService: Notify/Make available: Verified Intent
        SolverService->>SolverService: Analyze Intent, find solution path(s)
        SolverService->>VerifierContract: Submit Fulfillment Proposal (details, outcome, fee)
        VerifierContract->>VerifierContract: Evaluate Proposals, Select Best Solver
        VerifierContract-->>SolverService: Notify Winning Solver
        SolverService->>+SmartWalletContract: Initiate execution of chosen solution
        SmartWalletContract->>+Blockchain: Perform on-chain actions
        Blockchain-->>-SmartWalletContract: Confirmations
        SmartWalletContract-->>-SolverService: Execution Result
        SolverService-->>DApp: Report Outcome
        DApp-->>-User: Display Result
    else Intent Invalid
        VerifierContract-->>DApp: Report Rejection
        DApp-->>-User: Display Error
    end
```

## Advanced Intent Patterns & Implementation Considerations

While the core structure above covers many use cases, the intent framework is flexible. As you go deeper, you might encounter or design more complex patterns.

> **Note for Learners**: The following subsections introduce more advanced concepts and show illustrative code. Grasping the core anatomy first is key. These sections can be revisited as you progress into actual implementation.

### Multi-Step Intents (Compound Actions)

Sometimes a user's ultimate goal requires a sequence of actions. For example: "Swap USDC for wNEAR, then stake that wNEAR."

```json
{
  // ... (originator, signature, etc.)
  "action": {
    "type": "compound",
    "steps": [
      {
        "id": "step1_swap",
        "action": {
          "type": "swap",
          "details": {
            "fromToken": "USDC",
            "fromAmount": "100",
            "toToken": "wNEAR"
          }
        },
        "constraints": { "maxSlippagePercent": "0.5" }
      },
      {
        "id": "step2_stake",
        "action": {
          "type": "stake",
          // Input for staking often implicitly comes from the output of a previous step
          "details": {
            "tokenToStake": "output_of_step1_swap.toToken",
            "validator": "validatorX.pool.near"
          }
        },
        "constraints": { "minStakeDuration": "24h" }
      }
    ]
  },
  "constraints": {
    // Overall constraints for the compound action
    "atomicExecution": true, // CRITICAL: Ensures that if any step fails, the entire sequence is rolled back.
    // This prevents being left in an inconsistent state (e.g., swapped but failed to stake).
    "deadlineTimestamp": "1678890000"
  }
}
```

- **Atomicity (`atomicExecution: true`)**: This is a powerful feature. In Web2, this is akin to database transactions where a series of operations must all complete successfully; otherwise, no changes are committed.

### Conditional Intents

These allow intents to be executed only if certain on-chain (or off-chain, if a trusted oracle is used) conditions are met.

```json
{
  // ... (originator, signature, etc.)
  "action": {
    "type": "conditional_execute",
    "condition": {
      "source": "oracle_price",
      "asset": "NEAR_USD",
      "operator": ">=", // (greater than or equal to)
      "value": "10.00" // (e.g., price is $10 or more)
    },
    "trueBranch_intent": {
      // Intent to execute if condition is true
      "action": {
        "type": "sell_limit_order",
        "details": {
          "sellToken": "NEAR",
          "sellAmount": "50",
          "targetPrice": "10.00"
        }
      }
      // ... further constraints for this sub-intent
    },
    "falseBranch_intent": null // Optional: intent to execute if condition is false
  },
  "constraints": {
    "checkFrequency": "1h", // How often to check the condition
    "maxChecks": "24" // Stop checking after 24 attempts
  }
}
```

- **Web2 Analogy**: Conditional intents are like event-driven actions or business rule engines in Web2 systems, where different processes are triggered based on real-time data feeds or predefined criteria.

### Security & Validation: Illustrative Code Snippet

While the actual Verifier contract will be in Rust (or AssemblyScript), here's a conceptual JavaScript snippet showing some validation logic a Verifier might perform.

```javascript
// Conceptual Validator Logic (Illustrative)
class IntentVerifier {
  async isValid(signedIntent) {
    // 1. Verify signature (pseudo-code)
    // const originator = recoverSigner(signedIntent.signature, hash(signedIntent.intentPart));
    // if (originator !== signedIntent.originator) throw new Error("Invalid signature");

    const intent = signedIntent; // Assuming signature verified

    // 2. Structure validation (check required fields based on action.type)
    if (!intent.action || !intent.action.type)
      throw new Error("Missing action type");

    // 3. Parameter validation (specific to action.type)
    if (intent.action.type === "swap") {
      if (!intent.action.details.fromToken || !intent.action.details.toToken) {
        throw new Error("Missing token details for swap");
      }
      // How validateTokenAddress works: It could check against a known list of valid tokens,
      // query the blockchain to see if it's a valid contract implementing NEP-141 (fungible token standard),
      // or check against a dApp-specific registry.
      // await this.validateTokenAddress(intent.action.details.fromToken);
    }

    // 4. Constraint validation
    if (intent.constraints.deadlineTimestamp < Date.now() / 1000) {
      throw new Error("Deadline has passed");
    }
    // ... other constraint checks (slippage, amounts, etc.)

    // 5. Authorization check (pseudo-code)
    // Does originator have sufficient balance of fromToken?
    // Is originator authorized to perform this action via this Verifier?
    // await this.checkAccountPermissions(intent.originator, intent.action);

    return true; // If all checks pass
  }
}
```

### Testing Approaches

Thorough testing is vital.

- **Unit Testing**: Test individual validation functions, constraint checkers, and parsing logic.
- **Integration Testing**: Test the end-to-end flow: intent submission -> verification -> solver proposal -> execution -> outcome verification.

## Best Practices for Intent Design & Handling

1.  **Intent Design**:
    - **Atomicity & Focus**: Keep individual intents focused on a single logical outcome. Use `compound` actions for sequences, ensuring atomicity where needed.
    - **Clear Constraints**: Be explicit and realistic with constraints to protect users while allowing Solvers flexibility.
    - **Fallback Options**: Consider what happens if an intent cannot be fulfilled as preferred. For `preferences`, if `routePriority: ["direct_pool_A", "aggregator_B"]` is given, and Pool A fails or gives a bad quote, the system should ideally allow Solvers to try Aggregator B if it still meets hard constraints.
    - **Gas Cost Awareness**: While users might not pay gas directly, complex intents or Verifier logic can incur costs. Design with efficiency in mind.
2.  **Security**:
    - **Rigorous Validation**: Verifiers are the primary defense. Validate all inputs, check authorizations, and ensure constraints are met.
    - **Timeouts & Deadlines**: Crucial for preventing stale executions.
    - **Error Handling**: Graceful error handling and clear feedback to users.
3.  **Testing**: Comprehensive unit, integration, and potentially end-to-end (e2e) tests for all intent types, constraints, and error conditions.
4.  **Monitoring**:
    - Track intent success/failure rates, execution times, and Verifier/Solver performance.
    - **Solver Performance Tracking**: This can be complex. Systems might involve off-chain leaderboards based on successful fulfillments, speed, price efficiency, or even an on-chain reputation system where Solvers stake tokens and can be penalized for malicious behavior or rewarded for good service.

Understanding the anatomy of an intent and the considerations around its lifecycle is fundamental to building robust, user-friendly, and secure intent-centric applications on NEAR. In the following sections, we'll explore the Smart Wallet and Cross-Chain aspects that build upon this foundation.
