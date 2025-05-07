# Creating the Intent Submission Form

## Building the Core of Our dApp: Intent Creation

With our wallet connection and session keys in place, we're now ready to build the most important part of our frontend: the intent submission form. This is where users will specify what they want to achieve (their intent) without dictating how it should be executed.

> 💡 **Web2 Parallel**: This is similar to how you might book a flight on a travel website - you specify your destination and dates (your intent), and the system figures out the best routes and prices (solving the intent).

## Understanding Intent Structure Alignment

Before we build our form, let's ensure we understand the expected intent structure. Recall from Module 3 that our Verifier contract expects intents with this structure:

```rust
// From Module 3's Verifier contract
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

Our frontend form must create intent objects that exactly match this structure to ensure compatibility with our backend contracts.

## Creating the Intent Service

First, let's create a service that will handle intent creation and submission:

```javascript
// src/services/IntentService.js
import { v4 as uuidv4 } from "uuid";
import { utils } from "near-api-js";
import { CONTRACT_ADDRESSES } from "../utils/near";

export class IntentService {
  constructor(sessionAccount, networkId = "testnet") {
    this.sessionAccount = sessionAccount;
    this.networkId = networkId;
    this.verifierContractId = CONTRACT_ADDRESSES[networkId].verifierContract;
  }

  // Generate a unique ID for this intent
  generateIntentId() {
    return `intent-${uuidv4()}`;
  }

  // Create a standard swap intent
  createSwapIntent(params) {
    if (!this.sessionAccount) {
      throw new Error("Session account not initialized");
    }

    const {
      inputToken,
      inputAmount,
      outputToken,
      minOutputAmount,
      maxSlippage,
    } = params;

    // Convert input amount to NEAR format (yoctoNEAR)
    const inputAmountYocto = utils.format.parseNearAmount(
      inputAmount.toString()
    );

    // Convert min output amount if provided
    const minOutputAmountYocto = minOutputAmount
      ? utils.format.parseNearAmount(minOutputAmount.toString())
      : null;

    // Set default deadline 1 hour from now if not provided
    const deadline = params.deadline || Date.now() + 60 * 60 * 1000;

    // Create the intent object matching our Rust struct
    return {
      id: this.generateIntentId(),
      user_account: this.sessionAccount.accountId,
      action: "swap",
      input_token: inputToken,
      input_amount: inputAmountYocto,
      output_token: outputToken,
      min_output_amount: minOutputAmountYocto,
      max_slippage: maxSlippage || 0.5,
      deadline: Math.floor(deadline / 1000), // Convert to seconds
    };
  }

  // Submit an intent to the verifier contract
  async submitIntent(intent) {
    if (!this.sessionAccount) {
      throw new Error("Session account not initialized");
    }

    try {
      // Call the verifier contract using our session key
      const result = await this.sessionAccount.functionCall({
        contractId: this.verifierContractId,
        methodName: "verify_intent",
        args: { intent },
        gas: "30000000000000", // 30 TGas
        attachedDeposit: "0",
      });

      return {
        success: true,
        transactionHash: result.transaction.hash,
        intentId: intent.id,
      };
    } catch (error) {
      console.error("Failed to submit intent:", error);
      return {
        success: false,
        error: error.message,
        intentId: intent.id,
      };
    }
  }

  // Helper method to create and submit a swap intent
  async submitSwapIntent(params) {
    const intent = this.createSwapIntent(params);
    return this.submitIntent(intent);
  }
}
```

## Creating the Intent Context

Next, let's create a context to manage intent state throughout our application:

```jsx
// src/context/IntentContext.js
import React, { createContext, useContext, useState } from "react";
import { useWallet } from "./WalletContext";
import { IntentService } from "../services/IntentService";

// Context creation
const IntentContext = createContext(null);

export function useIntent() {
  return useContext(IntentContext);
}

export function IntentProvider({ children }) {
  const { sessionAccount, isConnected } = useWallet();

  // State for intent operations
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIntents, setActiveIntents] = useState([]);
  const [intentService, setIntentService] = useState(null);

  // Initialize the intent service when session account is available
  React.useEffect(() => {
    if (sessionAccount && isConnected) {
      setIntentService(new IntentService(sessionAccount));
    } else {
      setIntentService(null);
    }
  }, [sessionAccount, isConnected]);

  // Submit a swap intent
  const submitSwapIntent = async (params) => {
    if (!intentService) {
      setError("Intent service not initialized");
      return { success: false, error: "Intent service not initialized" };
    }

    try {
      setLoading(true);
      setError(null);

      // Create and submit the intent
      const result = await intentService.submitSwapIntent(params);

      if (result.success) {
        // Add to active intents
        const newIntent = {
          id: result.intentId,
          type: "swap",
          status: "pending",
          params,
          timestamp: Date.now(),
          transactionHash: result.transactionHash,
        };

        setActiveIntents((prevIntents) => [...prevIntents, newIntent]);
      } else {
        setError(result.error);
      }

      return result;
    } catch (err) {
      const errorMessage = err.message || "Unknown error submitting intent";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get intent by ID
  const getIntentById = (intentId) => {
    return activeIntents.find((intent) => intent.id === intentId);
  };

  // Context value
  const value = {
    loading,
    error,
    activeIntents,
    submitSwapIntent,
    getIntentById,
  };

  return (
    <IntentContext.Provider value={value}>{children}</IntentContext.Provider>
  );
}
```

## Building the Swap Intent Form

Now, let's create a form component for users to submit swap intents:

```jsx
// src/components/IntentForm/SwapIntentForm.jsx
import React, { useState } from "react";
import { useIntent } from "../../context/IntentContext";
import { useWallet } from "../../context/WalletContext";

function SwapIntentForm() {
  const { submitSwapIntent, loading, error } = useIntent();
  const { isConnected } = useWallet();

  // Form state
  const [inputToken, setInputToken] = useState("USDC");
  const [outputToken, setOutputToken] = useState("NEAR");
  const [inputAmount, setInputAmount] = useState("");
  const [minOutputAmount, setMinOutputAmount] = useState("");
  const [maxSlippage, setMaxSlippage] = useState(0.5);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Reset form
  const resetForm = () => {
    setInputAmount("");
    setMinOutputAmount("");
    setSuccessMessage("");
    setFormError("");
  };

  // Form validation
  const validateForm = () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setFormError("Please enter a valid input amount");
      return false;
    }

    if (inputToken === outputToken) {
      setFormError("Input and output tokens must be different");
      return false;
    }

    if (minOutputAmount && parseFloat(minOutputAmount) <= 0) {
      setFormError("Minimum output amount must be greater than zero");
      return false;
    }

    setFormError("");
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      setFormError("Please connect your wallet first");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      const result = await submitSwapIntent({
        inputToken,
        outputToken,
        inputAmount: parseFloat(inputAmount),
        minOutputAmount: minOutputAmount ? parseFloat(minOutputAmount) : null,
        maxSlippage,
      });

      if (result.success) {
        setSuccessMessage(
          `Intent submitted successfully! Transaction hash: ${result.transactionHash}`
        );
        resetForm();
      } else {
        setFormError(result.error || "Failed to submit intent");
      }
    } catch (err) {
      setFormError(err.message || "An error occurred");
    }
  };

  return (
    <div className="swap-intent-form">
      <h2>Create Swap Intent</h2>

      {formError && <div className="error-message">{formError}</div>}
      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="inputAmount">Amount to Swap</label>
          <input
            id="inputAmount"
            type="number"
            step="0.000001"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={loading}
            required
          />
        </div>

        <div className="token-selectors">
          <div className="form-group">
            <label htmlFor="inputToken">From Token</label>
            <select
              id="inputToken"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              disabled={loading}
            >
              <option value="USDC">USDC</option>
              <option value="NEAR">NEAR</option>
              <option value="ETH">ETH</option>
              <option value="DAI">DAI</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="outputToken">To Token</label>
            <select
              id="outputToken"
              value={outputToken}
              onChange={(e) => setOutputToken(e.target.value)}
              disabled={loading}
            >
              <option value="NEAR">NEAR</option>
              <option value="USDC">USDC</option>
              <option value="ETH">ETH</option>
              <option value="DAI">DAI</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="minOutputAmount">
            Minimum Output Amount (Optional)
          </label>
          <input
            id="minOutputAmount"
            type="number"
            step="0.000001"
            value={minOutputAmount}
            onChange={(e) => setMinOutputAmount(e.target.value)}
            placeholder="Minimum amount to receive"
            disabled={loading}
          />
          <small>Leave blank to accept any amount</small>
        </div>

        <div className="form-group">
          <label htmlFor="maxSlippage">Maximum Slippage: {maxSlippage}%</label>
          <input
            id="maxSlippage"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={maxSlippage}
            onChange={(e) => setMaxSlippage(parseFloat(e.target.value))}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={loading || !isConnected}
        >
          {loading ? "Submitting..." : "Submit Swap Intent"}
        </button>
      </form>

      <div className="intent-explanation">
        <h3>What happens when you submit?</h3>
        <p>
          When you submit this intent, you're expressing your desire to swap
          tokens without specifying exactly how it should happen. The intent
          system will:
        </p>
        <ol>
          <li>Verify your intent is valid</li>
          <li>Find solvers capable of fulfilling your intent</li>
          <li>Let you choose the best execution option</li>
          <li>Execute the swap in the most optimal way</li>
        </ol>
        <p>
          <strong>No wallet approval needed for each step!</strong> Your session
          key authorized in the previous step allows the entire process to
          happen smoothly.
        </p>
      </div>
    </div>
  );
}

export default SwapIntentForm;
```

## Adding the Intent History Component

Let's also create a component to display the user's intent history:

```jsx
// src/components/IntentForm/IntentHistory.jsx
import React from "react";
import { useIntent } from "../../context/IntentContext";
import { Link } from "react-router-dom";

function IntentHistory() {
  const { activeIntents, loading } = useIntent();

  if (loading) {
    return <div className="loading">Loading intents...</div>;
  }

  if (activeIntents.length === 0) {
    return (
      <div className="empty-intents">
        <p>No intents submitted yet. Create your first intent above!</p>
      </div>
    );
  }

  // Sort intents by timestamp (newest first)
  const sortedIntents = [...activeIntents].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="intent-history">
      <h2>Your Intent History</h2>

      <div className="intent-list">
        {sortedIntents.map((intent) => (
          <div key={intent.id} className="intent-item">
            <div className="intent-header">
              <span className={`status ${intent.status}`}>{intent.status}</span>
              <span className="type">{intent.type}</span>
              <span className="time">
                {new Date(intent.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="intent-details">
              {intent.type === "swap" && (
                <p>
                  Swap {intent.params.inputAmount} {intent.params.inputToken}{" "}
                  for {intent.params.outputToken}
                </p>
              )}

              <div className="intent-actions">
                <Link to={`/intent/${intent.id}`} className="view-details">
                  View Details
                </Link>
                <a
                  href={`https://explorer.testnet.near.org/transactions/${intent.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-explorer"
                >
                  View in Explorer
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default IntentHistory;
```

## Updating the Dashboard

Now, let's update our Dashboard page to include the intent form and history components:

```jsx
// src/pages/Dashboard.jsx
import React from "react";
import EnhancedConnectButton from "../components/WalletConnection/EnhancedConnectButton";
import WalletOptions from "../components/WalletConnection/WalletOptions";
import SessionKeyManagerUI from "../components/WalletConnection/SessionKeyManager";
import SwapIntentForm from "../components/IntentForm/SwapIntentForm";
import IntentHistory from "../components/IntentForm/IntentHistory";
import { useWallet } from "../context/WalletContext";

function Dashboard() {
  const { isConnected, accountId, sessionKey } = useWallet();

  return (
    <div className="dashboard">
      <header className="app-header">
        <h1>NEAR Intent Architecture</h1>
        <EnhancedConnectButton />
      </header>

      <main className="main-content">
        {!isConnected ? (
          <div className="welcome-container">
            <div className="welcome-card">
              <h2>Welcome to NEAR Intent Architecture</h2>
              <p>Connect your wallet to get started with intents!</p>
              <WalletOptions />
            </div>
          </div>
        ) : (
          <div className="account-container">
            <div className="account-info-card">
              <h2>Account Connected</h2>
              <p>
                <strong>Account ID:</strong> {accountId}
              </p>
              <p>
                <strong>Session Expires:</strong>{" "}
                {sessionKey
                  ? new Date(sessionKey.expires).toLocaleString()
                  : "Unknown"}
              </p>
              <p className="session-key-info">
                You're using a session key that allows you to submit intents
                without approving each transaction in your wallet!
              </p>
            </div>

            <SessionKeyManagerUI />

            <div className="intent-container">
              <SwapIntentForm />
              <IntentHistory />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
```

## Intent Validation and Security

Our intent form includes several crucial validation mechanisms:

1. **Client-side validation** - Checking input values before submission
2. **Intent structure validation** - Ensuring the intent matches the expected format
3. **Amount formatting** - Converting human-readable amounts to blockchain format (yoctoNEAR)
4. **Form error handling** - Providing clear feedback on validation issues
5. **Transaction result handling** - Processing the response from the contract

### Validation in IntentService

The IntentService contains several validation mechanisms:

```javascript
// Additional validation in IntentService.js
validateSwapIntent(params) {
  const errors = [];

  if (!params.inputToken) errors.push('Input token is required');
  if (!params.outputToken) errors.push('Output token is required');
  if (params.inputToken === params.outputToken) {
    errors.push('Input and output tokens must be different');
  }

  if (!params.inputAmount || params.inputAmount <= 0) {
    errors.push('Input amount must be greater than zero');
  }

  if (params.minOutputAmount && params.minOutputAmount <= 0) {
    errors.push('Minimum output amount must be greater than zero');
  }

  if (params.maxSlippage < 0 || params.maxSlippage > 100) {
    errors.push('Slippage must be between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Use in submitSwapIntent method
async submitSwapIntent(params) {
  const validation = this.validateSwapIntent(params);
  if (!validation.valid) {
    return {
      success: false,
      error: validation.errors.join(', '),
      intentId: null
    };
  }

  const intent = this.createSwapIntent(params);
  return this.submitIntent(intent);
}
```

## Direct Connection to Module 4's Abstractions

Our implementation builds directly on the abstractions we created in Module 4:

1. **Using session keys for transactions** - We're leveraging the session key to sign intent submissions without requiring user approval for each transaction
2. **Intent structure matching** - Our intent objects exactly match the Rust struct defined in the Verifier contract
3. **Validation patterns** - We're implementing the same validation checks we discussed in Module 4.3

## Next Steps

With our intent submission form now complete, users can:

1. Create structured swap intents
2. Submit them seamlessly using their session keys
3. Track their intent history

In the next section, we'll explore how to display and select from available solvers that can fulfill these intents.
