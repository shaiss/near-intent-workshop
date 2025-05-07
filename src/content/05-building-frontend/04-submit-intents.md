# Submitting Intents

## Building Intent Submission UI

Once a user is connected, they need a way to create and submit intents. This section covers how to build intent submission forms and handle the submission process.

## Intent Form Component

```jsx
// src/components/intent/IntentForm.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useIntent } from "../../hooks/useIntent";
import { Button } from "../ui/button";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { toast } from "sonner";

// Validation schema
const transferSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  amount: z.string().refine((val) => !isNaN(val) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  token: z.string().min(1, "Token is required"),
});

export function TransferIntentForm() {
  const { createAndSubmitIntent, loading } = useIntent();
  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipient: "",
      amount: "",
      token: "NEAR",
    },
  });

  const onSubmit = async (values) => {
    try {
      const result = await createAndSubmitIntent("transfer", {
        recipient: values.recipient,
        amount: values.amount,
        token: values.token,
      });

      toast.success("Intent submitted successfully", {
        description: `Intent ID: ${result.intentId}`,
      });

      form.reset();
    } catch (error) {
      toast.error("Failed to submit intent", {
        description: error.message,
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-2xl font-bold">Transfer Tokens</h2>

        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Input placeholder="account.near" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="text" placeholder="0.0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Intent"}
        </Button>
      </form>
    </Form>
  );
}
```

## Intent History Component

```jsx
// src/components/intent/IntentHistory.jsx
import React, { useEffect, useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { getIntentHistory } from "../../services/intentService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export function IntentHistory() {
  const { accountId, connected } = useWallet();
  const [intents, setIntents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadIntents = async () => {
    if (!connected || !accountId) return;

    setLoading(true);
    try {
      const history = await getIntentHistory(accountId);
      setIntents(history);
    } catch (error) {
      console.error("Failed to load intent history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIntents();
  }, [accountId, connected]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500";
      case "EXECUTING":
        return "bg-blue-500";
      case "COMPLETED":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">
            Connect your wallet to view intent history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Intent History</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={loadIntents}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent>
        {intents.length === 0 ? (
          <p className="text-center">No intents found</p>
        ) : (
          <ul className="space-y-4">
            {intents.map((intent) => (
              <li key={intent.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{intent.type}</h4>
                    <p className="text-sm text-gray-500">ID: {intent.id}</p>
                    <p className="text-sm">
                      {intent.params.amount} {intent.params.token}
                      {intent.type === "transfer" &&
                        ` to ${intent.params.recipient}`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(intent.status)}>
                    {intent.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
```

## Intent Service Implementation

```javascript
// src/services/intentService.js
const API_BASE_URL = process.env.API_URL || "https://api.example.com";

export async function submitIntent(signedIntent) {
  const response = await fetch(`${API_BASE_URL}/intents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signedIntent),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to submit intent");
  }

  return response.json();
}

export async function getIntentStatus(intentId) {
  const response = await fetch(`${API_BASE_URL}/intents/${intentId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get intent status");
  }

  return response.json();
}

export async function getIntentHistory(accountId) {
  const response = await fetch(
    `${API_BASE_URL}/intents?accountId=${accountId}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to get intent history");
  }

  return response.json();
}
```

In the next section, we'll explore solver options for executing these intents.

# Submitting Intents

## Creating an Intent Submission System

Now that we have wallet connectivity, we need to create a system for users to submit intents. This involves creating forms, validating inputs, and sending the intent to our verifier contract.

## Intent Hook

First, let's create a custom hook to manage intent state and submission:

```jsx
// src/hooks/useIntent.jsx
import { useState } from "react";
import { useWallet } from "./useWallet";

export const useIntent = () => {
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [error, setError] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const { wallet, accountId, connected } = useWallet();

  const submitIntent = async (intent) => {
    if (!connected || !wallet) {
      throw new Error("Wallet not connected");
    }

    try {
      setStatus("loading");
      setError(null);

      // Generate a unique intent ID
      const newIntentId = `intent_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      setIntentId(newIntentId);

      // Add metadata to the intent
      const fullIntent = {
        ...intent,
        id: newIntentId,
        user: accountId,
        timestamp: Date.now(),
      };

      // Send the intent to the verifier contract
      const result = await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: "verifier.testnet",
        actions: [
          {
            type: "FunctionCall",
            params: {
              methodName: "verify_intent",
              args: { intent: JSON.stringify(fullIntent) },
              gas: "30000000000000",
              deposit: "0",
            },
          },
        ],
      });

      setStatus("success");
      return { intentId: newIntentId, result };
    } catch (err) {
      setStatus("error");
      setError(err.message || "Failed to submit intent");
      throw err;
    }
  };

  const resetIntent = () => {
    setStatus("idle");
    setError(null);
    setIntentId(null);
  };

  return {
    status,
    error,
    intentId,
    submitIntent,
    resetIntent,
  };
};
```

## Enhanced Intent Form

Now let's enhance our intent form to use the hook and provide better user feedback:

```jsx
// src/components/intent/IntentForm.jsx
import { useState } from "react";
import { useIntent } from "../../hooks/useIntent";

export const IntentForm = ({ onSubmitSuccess }) => {
  const [input, setInput] = useState("USDC");
  const [output, setOutput] = useState("wNEAR");
  const [amount, setAmount] = useState("");
  const { submitIntent, status, error } = useIntent();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const intent = {
        action: "swap",
        input_token: input,
        input_amount: parseFloat(amount),
        output_token: output,
        max_slippage: 0.5,
      };

      const { intentId } = await submitIntent(intent);

      // Inform parent component about successful submission
      if (onSubmitSuccess) {
        onSubmitSuccess(intentId);
      }

      // Reset form
      setAmount("");
    } catch (err) {
      console.error("Error submitting intent:", err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Submit Swap Intent</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2" htmlFor="amount">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            required
            min="0.000001"
            step="any"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="input-token">
              From
            </label>
            <select
              id="input-token"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USDC">USDC</option>
              <option value="DAI">DAI</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="output-token">
              To
            </label>
            <select
              id="output-token"
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="wNEAR">wNEAR</option>
              <option value="ETH">ETH</option>
              <option value="BTC">BTC</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition duration-200"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Submitting..." : "Submit Intent"}
        </button>
      </form>
    </div>
  );
};
```

## IntentService for API Interaction

To better organize our code, let's create a service for intent-related API calls:

```jsx
// src/services/intentService.js
export class IntentService {
  constructor(networkId = "testnet") {
    this.networkId = networkId;
    this.verifierContract = "verifier.testnet";
  }

  async getIntentStatus(intentId) {
    // In a real app, this would call a backend API or directly query the blockchain
    // For demo purposes, we'll simulate a response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: intentId,
          status: "verified",
          timestamp: Date.now(),
        });
      }, 1000);
    });
  }

  async getSolversForIntent(intentId) {
    // Simulate getting solvers - in a real app this would query on-chain or off-chain solvers
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "solver-1",
            name: "Ref Finance",
            route: "USDC -> wNEAR",
            price: "1:1.05",
            gas: "25 TGas",
            fee: "0.3%",
          },
          {
            id: "solver-2",
            name: "Jumbo DEX",
            route: "USDC -> USDT -> wNEAR",
            price: "1:1.04",
            gas: "32 TGas",
            fee: "0.25%",
          },
        ]);
      }, 1500);
    });
  }
}
```

By implementing these components, we've created a complete system for users to submit intents through our frontend. The next section will focus on displaying solver options and executing the intent fulfillment.

# 5.4: Creating the Intent Submission Form

**Time**: 20 minutes  
**Pre-requisite**: Wallet connection from 5.2 and 5.3, understanding of Intent structure from Module 3

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
