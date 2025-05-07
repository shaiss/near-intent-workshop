# Creating User-Friendly Action Abstractions

**Time**: 20 minutes  
**Pre-requisite**: Understanding of session keys and intent structures from previous sections

## Building the User Experience Layer

Now that we have our smart wallet infrastructure with session keys, we need to create the final layer of our intent architecture: **user-friendly action abstractions**. This is where we translate user goals into the intent objects that our backend contracts process.

> 💡 **Web2 Parallel**: This is similar to how a modern web application might offer a simple "Share to Twitter" button that abstracts away the OAuth flow, API endpoints, and data formatting required to post a tweet.

## The Power of Intent-Based Design

Traditional blockchain applications expose their functionality through direct contract method calls, requiring users to understand the underlying implementation details. Intent-based design flips this approach:

| Traditional Approach                         | Intent-Based Approach                 |
| -------------------------------------------- | ------------------------------------- |
| Function-oriented                            | Goal-oriented                         |
| "Call the swap method with these parameters" | "I want to swap Token A for Token B"  |
| Fixed execution path                         | Flexible execution strategies         |
| Complex UX with many confirmation steps      | Simple UX with minimal confirmations  |
| Requires blockchain knowledge                | Requires minimal blockchain knowledge |

## Mapping User Actions to Intent Objects

The key to effective action abstraction is to map common user actions to the intent structure our Verifier contract expects. Remember that our Verifier contract from Module 3 expects intents with this structure:

```rust
// From Verifier contract (Module 3)
pub struct Intent {
    pub id: String,                    // Unique identifier
    pub user_account: String,          // User's NEAR account
    pub action: String,                // Type of action (e.g., "swap")
    pub input_token: String,           // Token the user is providing
    pub input_amount: u128,            // Amount of input token
    pub output_token: String,          // Token the user wants
    pub min_output_amount: Option<u128>, // Minimum acceptable output
    pub max_slippage: f64,             // Maximum acceptable slippage
    pub deadline: Option<u64>,         // Optional expiration time
}
```

Let's create a JavaScript action abstraction layer that generates these intent objects from simple user actions:

```javascript
// Intent creation library for common user actions
class IntentBuilder {
  constructor(userAccount) {
    this.userAccount = userAccount;
  }

  // Generate a unique ID for this intent
  generateIntentId() {
    return `intent-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  }

  // Create a token swap intent
  createSwapIntent(inputToken, inputAmount, outputToken, options = {}) {
    return {
      id: this.generateIntentId(),
      user_account: this.userAccount,
      action: "swap",
      input_token: inputToken,
      input_amount: inputAmount,
      output_token: outputToken,
      min_output_amount: options.minOutputAmount || null,
      max_slippage: options.maxSlippage || 0.5,
      deadline: options.deadline || null,
    };
  }

  // Create a token transfer intent
  createTransferIntent(token, amount, recipient, options = {}) {
    return {
      id: this.generateIntentId(),
      user_account: this.userAccount,
      action: "transfer",
      input_token: token,
      input_amount: amount,
      output_token: token, // Same token for transfers
      recipient: recipient, // Additional field for transfers
      min_output_amount: options.minOutputAmount || amount, // Usually 100% for transfers
      max_slippage: 0, // Usually no slippage for transfers
      deadline: options.deadline || null,
    };
  }

  // Create a staking intent
  createStakeIntent(token, amount, validatorId, options = {}) {
    return {
      id: this.generateIntentId(),
      user_account: this.userAccount,
      action: "stake",
      input_token: token,
      input_amount: amount,
      validator_id: validatorId, // Additional field for staking
      min_output_amount: null, // Not applicable for staking
      max_slippage: 0, // Usually no slippage for staking
      deadline: options.deadline || null,
    };
  }
}
```

## Submitting Intents with Session Keys

Now let's create a service that uses our session keys to submit these intents to the Verifier contract:

```javascript
import { createSessionConnection } from "./sessionWallet";

class IntentService {
  constructor(networkId = "testnet") {
    this.networkId = networkId;
    this.verifierContractId = "verifier.testnet";
    this.sessionConnection = null;
    this.intentBuilder = null;
  }

  /**
   * Initialize the service with a session key
   * @param {string} accountId - User's NEAR account
   * @param {string} privateKey - Session key's private key
   */
  async initialize(accountId, privateKey) {
    // Create a NEAR connection using the session key
    this.sessionConnection = await createSessionConnection(
      accountId,
      privateKey
    );
    this.intentBuilder = new IntentBuilder(accountId);
    return this;
  }

  /**
   * Submit an intent to the Verifier contract using the session key
   * @param {Object} intent - Intent object created by IntentBuilder
   * @returns {Object} Result of the transaction
   */
  async submitIntent(intent) {
    if (!this.sessionConnection) {
      throw new Error(
        "IntentService not initialized. Call initialize() first."
      );
    }

    try {
      // Call the Verifier contract's verify_intent method with our intent
      const result = await this.sessionConnection.functionCall({
        contractId: this.verifierContractId,
        methodName: "verify_intent",
        args: { intent },
        gas: "30000000000000",
        attachedDeposit: "0",
      });

      console.log(
        `Intent ${intent.id} submitted successfully:`,
        result.transaction.hash
      );
      return {
        success: true,
        transactionHash: result.transaction.hash,
        intent: intent,
      };
    } catch (error) {
      console.error("Intent submission failed:", error);
      return {
        success: false,
        error: error.message,
        intent: intent,
      };
    }
  }

  /**
   * Helper method to swap tokens
   * @param {Object} params - Swap parameters
   */
  async swap(params) {
    const intent = this.intentBuilder.createSwapIntent(
      params.inputToken,
      params.inputAmount,
      params.outputToken,
      {
        maxSlippage: params.maxSlippage,
        minOutputAmount: params.minOutputAmount,
        deadline: params.deadline,
      }
    );

    return this.submitIntent(intent);
  }

  /**
   * Helper method to transfer tokens
   * @param {Object} params - Transfer parameters
   */
  async transfer(params) {
    const intent = this.intentBuilder.createTransferIntent(
      params.token,
      params.amount,
      params.recipient,
      { deadline: params.deadline }
    );

    return this.submitIntent(intent);
  }
}
```

## Building a User Interface for Intents

Now we can create React components that use our `IntentService` to provide a simple user experience:

```jsx
import { useState, useEffect } from "react";
import { IntentService } from "./intentService";
import { SessionKeyManager } from "./sessionKeyManager";

// Swap form component
function SwapForm({ accountId, sessionKey }) {
  const [inputAmount, setInputAmount] = useState("");
  const [inputToken, setInputToken] = useState("USDC");
  const [outputToken, setOutputToken] = useState("NEAR");
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [status, setStatus] = useState("");
  const [intentService, setIntentService] = useState(null);

  // Initialize the intent service with the session key
  useEffect(() => {
    if (accountId && sessionKey) {
      const service = new IntentService();
      service
        .initialize(accountId, sessionKey.privateKey)
        .then((initializedService) => {
          setIntentService(initializedService);
        })
        .catch((err) => {
          setStatus(`Error initializing: ${err.message}`);
        });
    }
  }, [accountId, sessionKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!intentService) {
      setStatus("Intent service not initialized");
      return;
    }

    setStatus("Submitting swap intent...");

    try {
      const result = await intentService.swap({
        inputToken,
        inputAmount: parseFloat(inputAmount),
        outputToken,
        maxSlippage,
      });

      if (result.success) {
        setStatus(
          `Swap intent submitted! Transaction: ${result.transactionHash}`
        );
      } else {
        setStatus(`Error: ${result.error}`);
      }
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="swap-form">
      <h2>Swap Tokens</h2>

      <div className="form-group">
        <label>Amount to Swap:</label>
        <input
          type="number"
          value={inputAmount}
          onChange={(e) => setInputAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
          step="0.01"
          required
        />
      </div>

      <div className="form-group">
        <label>From Token:</label>
        <select
          value={inputToken}
          onChange={(e) => setInputToken(e.target.value)}
        >
          <option value="USDC">USDC</option>
          <option value="NEAR">NEAR</option>
          <option value="wETH">wETH</option>
        </select>
      </div>

      <div className="form-group">
        <label>To Token:</label>
        <select
          value={outputToken}
          onChange={(e) => setOutputToken(e.target.value)}
        >
          <option value="NEAR">NEAR</option>
          <option value="USDC">USDC</option>
          <option value="wETH">wETH</option>
        </select>
      </div>

      <div className="form-group">
        <label>Max Slippage: {maxSlippage}%</label>
        <input
          type="range"
          min="0.1"
          max="2"
          step="0.1"
          value={maxSlippage}
          onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
        />
      </div>

      <button type="submit" className="submit-button">
        Swap Tokens
      </button>

      {status && <div className="status-message">{status}</div>}
    </form>
  );
}

// Main wallet interface component
function SmartWalletInterface() {
  const [accountId, setAccountId] = useState(null);
  const [sessionKey, setSessionKey] = useState(null);
  const [keyManager] = useState(new SessionKeyManager());
  const [walletConnected, setWalletConnected] = useState(false);

  // Handle wallet connection
  const connectWallet = async () => {
    try {
      // This is simplified - would use your wallet connection logic
      const userAccountId = await promptUserForAccountId();
      setAccountId(userAccountId);

      // Try to load an existing session key
      const existingKey = keyManager.getSessionKey(userAccountId, userPassword);

      if (existingKey && !isExpired(existingKey)) {
        setSessionKey(existingKey);
        setWalletConnected(true);
      } else {
        // Would redirect to wallet for authorization here
        // For this example, we'll just simulate it
        const newKey = await simulateKeyAuthorization(userAccountId);
        setSessionKey(newKey);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <div className="smart-wallet-interface">
      <h1>NEAR Intent Wallet</h1>

      {!walletConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div className="wallet-functions">
          <div className="account-info">
            <p>Connected: {accountId}</p>
            <p>
              Session expires: {new Date(sessionKey.expires).toLocaleString()}
            </p>
          </div>

          <SwapForm accountId={accountId} sessionKey={sessionKey} />

          {/* Additional action forms would go here */}
        </div>
      )}
    </div>
  );
}
```

## Creating Composable Actions

One of the powerful features of intent-based architecture is the ability to compose multiple actions. Here's how we can build a composable action for "swap and stake" in our abstraction layer:

```javascript
// Add to the IntentBuilder class
class IntentBuilder {
  // ... existing methods ...

  // Create a compound intent for swapping and staking
  createSwapAndStakeIntent(
    inputToken,
    inputAmount,
    intermediateToken,
    validator,
    options = {}
  ) {
    // For compound actions, we can encode the multiple steps in the action field
    // and include all required parameters in a structured way
    return {
      id: this.generateIntentId(),
      user_account: this.userAccount,
      action: "swap_and_stake", // Custom compound action
      input_token: inputToken,
      input_amount: inputAmount,
      intermediate_token: intermediateToken, // The token after swapping
      validator_id: validator, // For the staking step
      min_output_amount: options.minOutputAmount || null,
      max_slippage: options.maxSlippage || 0.5,
      deadline: options.deadline || null,
    };
  }
}

// Add to the IntentService class
class IntentService {
  // ... existing methods ...

  /**
   * Swap tokens and then stake them in one intent
   */
  async swapAndStake(params) {
    const intent = this.intentBuilder.createSwapAndStakeIntent(
      params.inputToken,
      params.inputAmount,
      params.intermediateToken,
      params.validator,
      {
        maxSlippage: params.maxSlippage,
        deadline: params.deadline,
      }
    );

    return this.submitIntent(intent);
  }
}
```

The Verifier and Solver contracts would need to be extended to support this compound action, but the beauty of the intent architecture is that this could be added without changing existing action types or breaking existing dApps.

## Preflight Validation to Improve UX

To provide immediate feedback to users, we can perform client-side validation before submitting intents to the blockchain:

```javascript
// Add to IntentService
class IntentService {
  // ... existing methods ...

  /**
   * Validate an intent before submission to catch common errors
   * @param {Object} intent - The intent to validate
   * @returns {Object} Validation result
   */
  validateIntent(intent) {
    const errors = [];

    // Check for required fields
    if (!intent.user_account) errors.push("User account is required");
    if (!intent.action) errors.push("Action is required");
    if (!intent.input_token) errors.push("Input token is required");
    if (!intent.input_amount || intent.input_amount <= 0) {
      errors.push("Input amount must be greater than zero");
    }

    // Action-specific validation
    if (intent.action === "swap") {
      if (!intent.output_token)
        errors.push("Output token is required for swaps");
      if (intent.input_token === intent.output_token) {
        errors.push("Input and output tokens must be different");
      }
    }

    // Check for reasonable slippage
    if (intent.max_slippage > 5) {
      errors.push(
        "Warning: High slippage tolerance (>5%) may result in unfavorable trades"
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings: errors.filter((e) => e.startsWith("Warning:")),
    };
  }

  // Validate before submitting
  async submitIntent(intent) {
    const validation = this.validateIntent(intent);

    if (!validation.valid) {
      console.error("Intent validation failed:", validation.errors);
      return {
        success: false,
        error: "Validation failed: " + validation.errors.join(", "),
        intent: intent,
      };
    }

    // Proceed with submission...
  }
}
```

## Summary: Building a Complete User Experience

By properly implementing action abstractions on top of our session-based smart wallet, we've created a system that:

1. **Simplifies complex blockchain actions** into user-friendly interfaces
2. **Minimizes transaction signing requirements** using session keys
3. **Validates user inputs** before they reach the blockchain
4. **Enables composable actions** through a flexible intent architecture
5. **Provides a Web2-like experience** with Web3 capabilities

This marks a significant improvement over traditional dApp interfaces that expose raw blockchain functionality and require constant transaction signing.

In the next section, we'll explore how to test our smart wallet implementation to ensure it's secure and reliable for production use.
