# Executing Intents and Handling Results

**Time**: 20 minutes  
**Pre-requisite**: Solver selection from 5.5, understanding of Smart Contracts from Module 3

## The Final Step: Fulfilling User Intents

We've built our frontend components for connecting wallets, submitting intents, and selecting solvers. Now it's time to implement the final piece: executing intents through the selected solver to complete the transaction lifecycle.

> 💡 **Web2 Parallel**: This is like finalizing a purchase after selecting a product and shipping method on an e-commerce site. It's the moment when the user's intent (buying a product) is finally fulfilled.

## Enhancing Our Intent Service

First, let's add execution-related methods to our IntentService:

```javascript
// src/services/IntentService.js
// Add these methods to the existing IntentService class

// Execute an intent through a specific solver
async executeIntent(intentId, solverAccountId) {
  if (!this.sessionAccount) {
    throw new Error('Session account not initialized');
  }

  try {
    // Call the solver's solve_intent method
    const result = await this.sessionAccount.functionCall({
      contractId: solverAccountId,
      methodName: 'solve_intent',
      args: { intent_id: intentId },
      gas: '50000000000000', // 50 TGas (solvers might need more gas)
      attachedDeposit: '0' // No deposit required for session key
    });

    return {
      success: true,
      transactionHash: result.transaction.hash,
      result
    };
  } catch (error) {
    console.error('Failed to execute intent:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get the current status of an intent from the Verifier contract
 */
async getIntentStatus(intentId) {
  if (!this.nearContext?.account) {
    throw new Error("Wallet not connected or account not available");
  }
  console.log(`Fetching status for intent: ${intentId}`);
  // Note: This assumes the Verifier contract has a `get_intent_status` view method.
  // Ensure this method is implemented in your Rust contract from Module 3.
  try {
    const status = await this.nearContext.account.viewFunction(
      this.verifierContractId,
      "get_intent_status",
      { intent_id: intentId }
    );
    console.log(`Intent ${intentId} status:`, status);
    return status;
  } catch (error) {
    console.error(`Error fetching status for intent ${intentId}:`, error);
    throw new Error(`Could not fetch intent status: ${error.message}`);
  }
}

/**
 * Get the execution results for a completed intent (potentially from Solver)
 */
async getExecutionResults(intentId, solverId) {
  if (!this.nearContext?.account) {
    throw new Error("Wallet not connected or account not available");
  }
  if (!solverId) {
    console.warn(`Cannot fetch execution results for ${intentId} without solverId.`);
    return null; // Or handle based on where results are stored
  }
  console.log(`Fetching execution results for intent ${intentId} from solver ${solverId}`);
  // Note: This assumes the Solver contract has a `get_execution_results` view method
  // or similar method to retrieve outcome details.
  // Ensure this method exists in your Solver contract from Module 3.
  try {
    // This assumes the solver stores results accessible via a view function
    // The exact method name and return structure depend on your Solver contract implementation.
    const results = await this.nearContext.account.viewFunction(
      solverId, // Query the specific solver that executed
      "get_execution_results", // Assumed method name
      { intent_id: intentId }
    );
    console.log(`Execution results for ${intentId}:`, results);
    return results;
  } catch (error) {
    console.error(`Error fetching execution results for intent ${intentId} from ${solverId}:`, error);
    // Don't throw an error here necessarily, maybe the results aren't stored this way
    // or the solver hasn't completed / stored them yet.
    return null;
  }
}
```

## Updating the Intent Context

Now let's add execution methods to our IntentContext:

```jsx
// src/context/IntentContext.js
// Add these to the existing IntentContext

export function IntentProvider({ children }) {
  // Existing state...
  const [executionStatus, setExecutionStatus] = useState({});
  const [executionResults, setExecutionResults] = useState({});
  const [executionError, setExecutionError] = useState({});

  // Execute an intent with a selected solver
  const executeIntent = async (intentId) => {
    if (!intentService) {
      setError("Intent service not initialized");
      return { success: false, error: "Intent service not initialized" };
    }

    // Get the selected solver for this intent
    const solverAccountId = selectedSolver[intentId];
    if (!solverAccountId) {
      setExecutionError((prev) => ({
        ...prev,
        [intentId]: "No solver selected for this intent",
      }));
      return {
        success: false,
        error: "No solver selected for this intent",
      };
    }

    try {
      setLoading(true);
      setError(null);

      // Update status to executing
      setExecutionStatus((prev) => ({
        ...prev,
        [intentId]: "executing",
      }));

      // Execute the intent
      const result = await intentService.executeIntent(
        intentId,
        solverAccountId
      );

      if (result.success) {
        // Update status and store transaction hash
        setExecutionStatus((prev) => ({
          ...prev,
          [intentId]: "completed",
        }));

        // Update active intents
        setActiveIntents((prevIntents) =>
          prevIntents.map((intent) =>
            intent.id === intentId
              ? {
                  ...intent,
                  status: "completed",
                  executionHash: result.transactionHash,
                }
              : intent
          )
        );

        // Get execution results
        setTimeout(async () => {
          const resultsResponse = await intentService.getExecutionResults(
            intentId,
            solverAccountId
          );
          if (resultsResponse) {
            setExecutionResults((prev) => ({
              ...prev,
              [intentId]: resultsResponse,
            }));
          }
        }, 2000); // Give the blockchain a moment to process

        return result;
      } else {
        setExecutionStatus((prev) => ({
          ...prev,
          [intentId]: "failed",
        }));

        setExecutionError((prev) => ({
          ...prev,
          [intentId]: result.error,
        }));

        // Update active intents
        setActiveIntents((prevIntents) =>
          prevIntents.map((intent) =>
            intent.id === intentId ? { ...intent, status: "failed" } : intent
          )
        );

        return result;
      }
    } catch (err) {
      const errorMessage = err.message || "Error executing intent";

      setExecutionStatus((prev) => ({
        ...prev,
        [intentId]: "failed",
      }));

      setExecutionError((prev) => ({
        ...prev,
        [intentId]: errorMessage,
      }));

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Get the current execution status
  const getExecutionStatus = (intentId) => {
    return executionStatus[intentId] || "pending";
  };

  // Get any execution error
  const getExecutionError = (intentId) => {
    return executionError[intentId] || null;
  };

  // Get execution results
  const getExecutionResults = (intentId) => {
    return executionResults[intentId] || null;
  };

  // Retry a failed execution
  const retryExecution = async (intentId) => {
    // Clear previous error
    setExecutionError((prev) => ({
      ...prev,
      [intentId]: null,
    }));

    // Reset status
    setExecutionStatus((prev) => ({
      ...prev,
      [intentId]: "pending",
    }));

    // Try again
    return executeIntent(intentId);
  };

  // Add these to the context value
  const value = {
    // Existing values...
    executeIntent,
    getExecutionStatus,
    getExecutionError,
    getExecutionResults,
    retryExecution,
  };

  // Return the provider
  return (
    <IntentContext.Provider value={value}>{children}</IntentContext.Provider>
  );
}
```

## Creating the Execute Intent Component

Now, let's create a component to execute intents and display the results:

```jsx
// src/components/ExecutionManager/ExecuteIntent.jsx
import React, { useState, useEffect } from "react";
import { useIntent } from "../../context/IntentContext";
import { utils } from "near-api-js";

function ExecuteIntent({ intentId }) {
  const {
    executeIntent,
    getExecutionStatus,
    getExecutionError,
    getExecutionResults,
    retryExecution,
    getSelectedSolver,
    getSolversForIntent,
  } = useIntent();

  const [executing, setExecuting] = useState(false);
  const [status, setStatus] = useState("Pending");
  const [executionResult, setExecutionResult] = useState(null);

  // Get current status and selected solver
  const executionStatus = getExecutionStatus(intentId);
  const executionError = getExecutionError(intentId);
  const executionResults = getExecutionResults(intentId);
  const selectedSolverId = getSelectedSolver(intentId);
  const solvers = getSolversForIntent(intentId);

  // Get solver details
  const selectedSolver = solvers.find((s) => s.accountId === selectedSolverId);

  // Check if we can execute (requires a selected solver)
  const canExecute =
    selectedSolverId &&
    executionStatus !== "executing" &&
    executionStatus !== "completed";

  // Execute the intent
  const handleExecute = async () => {
    if (!canExecute) return;

    setExecuting(true);
    try {
      setStatus("Executing intent...");
      const result = await executeIntent(intentId);
      if (result.success) {
        setStatus("Intent executed successfully!");
        setExecutionResult(result.payload); // Assuming payload has results
      } else {
        setStatus(`Execution failed: ${result.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Execution error:", error);
      let userMessage = `
```
