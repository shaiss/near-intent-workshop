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

// Get the current status of an intent
async getIntentStatus(intentId) {
  try {
    const account = this.sessionAccount;

    // Call view method on verifier contract
    const status = await account.viewFunction({
      contractId: this.verifierContractId,
      methodName: 'get_intent_status',
      args: { intent_id: intentId }
    });

    return { success: true, status };
  } catch (error) {
    console.error('Failed to get intent status:', error);
    return { success: false, error: error.message };
  }
}

// Get execution results from a solver
async getExecutionResults(intentId, solverAccountId) {
  try {
    const account = this.sessionAccount;

    // Call view method on solver contract
    const results = await account.viewFunction({
      contractId: solverAccountId,
      methodName: 'get_execution_results',
      args: { intent_id: intentId }
    });

    return { success: true, results };
  } catch (error) {
    console.error('Failed to get execution results:', error);
    return { success: false, error: error.message };
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
          if (resultsResponse.success) {
            setExecutionResults((prev) => ({
              ...prev,
              [intentId]: resultsResponse.results,
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
      await executeIntent(intentId);
    } finally {
      setExecuting(false);
    }
  };

  // Retry a failed execution
  const handleRetry = async () => {
    setExecuting(true);
    try {
      await retryExecution(intentId);
    } finally {
      setExecuting(false);
    }
  };

  // Format the token amount for display
  const formatAmount = (yoctoAmount, token) => {
    if (!yoctoAmount) return "Unknown amount";
    return `${utils.format.formatNearAmount(yoctoAmount, 4)} ${token}`;
  };

  return (
    <div className="execute-intent">
      <h3>Execute Intent</h3>

      {!selectedSolverId ? (
        <div className="no-solver-selected">
          <p>Please select a solver above to execute this intent.</p>
        </div>
      ) : (
        <>
          <div className="selected-solver">
            <p>
              <strong>Selected Solver:</strong>{" "}
              {selectedSolver?.details?.name || selectedSolverId}
            </p>
            {selectedSolver?.quote && (
              <p>
                <strong>Expected Output:</strong>{" "}
                {formatAmount(
                  selectedSolver.quote.output_amount,
                  selectedSolver.quote.output_token
                )}
              </p>
            )}
          </div>

          <div className="execution-status">
            <p>
              <strong>Status:</strong>
              <span className={`status ${executionStatus}`}>
                {executionStatus.charAt(0).toUpperCase() +
                  executionStatus.slice(1)}
              </span>
            </p>
          </div>

          {executionError && (
            <div className="execution-error">
              <p>
                <strong>Error:</strong> {executionError}
              </p>
              <button
                onClick={handleRetry}
                disabled={executing}
                className="retry-button"
              >
                {executing ? "Retrying..." : "Retry Execution"}
              </button>
            </div>
          )}

          {executionResults && (
            <div className="execution-results">
              <h4>Execution Results</h4>
              {executionResults.output_amount && (
                <p>
                  <strong>Received:</strong>{" "}
                  {formatAmount(
                    executionResults.output_amount,
                    executionResults.output_token
                  )}
                </p>
              )}
              {executionResults.transaction_hash && (
                <p>
                  <strong>Transaction:</strong>
                  <a
                    href={`https://explorer.testnet.near.org/transactions/${executionResults.transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="explorer-link"
                  >
                    View in Explorer
                  </a>
                </p>
              )}
            </div>
          )}

          {canExecute && (
            <button
              onClick={handleExecute}
              disabled={executing || !canExecute}
              className="execute-button"
            >
              {executing ? "Executing..." : "Execute Intent"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ExecuteIntent;
```
