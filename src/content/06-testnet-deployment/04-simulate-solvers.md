# Testing Your Intent Architecture with Solver Simulations

**Time**: 40 minutes  
**Pre-requisite**: Deployed contracts from 6.1, debugging knowledge from 6.3

## Simulating Solver Behavior: Beyond Simple Contract Testing

Once your contracts are deployed to testnet, you need to test your complete intent architecture under various conditions. This involves not just the contracts themselves, but the entire system of solvers, intents, and user interactions.

> 💡 **Web2 Parallel**: In Web2 development, you might use tools like mocking services (e.g., Mirage.js, MSW) to simulate backend behavior during frontend testing, while separately creating test harnesses for your backend services to simulate production loads. We'll apply similar principles to Web3.

In this section, we'll explore two fundamentally different but complementary approaches to solver simulation:

1. **Client-side simulation** for testing frontend resilience
2. **Backend solver simulation** for interacting with deployed contracts

## Part 1: Client-Side Solver Simulation for Frontend Testing

### Understanding Client-Side Simulation

Client-side simulation allows you to test your frontend application without relying on deployed solver infrastructure. This is particularly useful for:

- Developing UI components without a live backend
- Testing how your UI handles various success/failure scenarios
- Validating user experience under different network conditions

> 💡 **Web2 Parallel**: This is similar to how you might use tools like Mock Service Worker (MSW) to intercept API calls during frontend testing in a React application.

### Implementing a Mock Solver Service

First, let's create a mock solver that simulates the behavior of a real solver:

```javascript
// src/services/mockSolverService.js
export class MockSolver {
  constructor(options = {}) {
    this.supportedIntentTypes = options.supportedIntentTypes || [
      "swap",
      "transfer",
    ];
    this.simulatedDelay = options.simulatedDelay || 2000;
    this.successRate = options.successRate || 0.95;
    this.running = false;
    this.pendingIntents = [];
    this.processedIntents = [];
    this.listeners = [];
  }

  start() {
    this.running = true;
    this.processLoop();
    console.log("Mock solver started");
  }

  stop() {
    this.running = false;
    console.log("Mock solver stopped");
  }

  addIntent(intent) {
    console.log(`Mock solver received intent: ${intent.id}`);
    this.pendingIntents.push({
      ...intent,
      status: "PENDING",
      receivedAt: Date.now(),
    });
  }

  onIntentStatusChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(
        (listener) => listener !== callback
      );
    };
  }

  notifyListeners(intent) {
    this.listeners.forEach((listener) => listener(intent));
  }

  async processLoop() {
    while (this.running) {
      if (this.pendingIntents.length > 0) {
        // Process the next intent
        const intent = this.pendingIntents.shift();
        await this.processIntent(intent);
      }

      // Wait a bit before the next iteration
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  async processIntent(intent) {
    if (!this.supportedIntentTypes.includes(intent.action)) {
      console.log(
        `Mock solver doesn't support intent action: ${intent.action}`
      );
      const failedIntent = {
        ...intent,
        status: "FAILED",
        error: `Unsupported intent action: ${intent.action}`,
        processedAt: Date.now(),
      };
      this.processedIntents.push(failedIntent);
      this.notifyListeners(failedIntent);
      return;
    }

    // Update status to EXECUTING
    const executingIntent = {
      ...intent,
      status: "EXECUTING",
    };
    this.notifyListeners(executingIntent);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, this.simulatedDelay));

    // Determine success or failure based on success rate
    const isSuccess = Math.random() < this.successRate;

    const processedIntent = {
      ...intent,
      status: isSuccess ? "COMPLETED" : "FAILED",
      error: isSuccess ? null : "Simulated random failure",
      result: isSuccess ? this.generateMockResult(intent) : null,
      processedAt: Date.now(),
    };

    this.processedIntents.push(processedIntent);
    this.notifyListeners(processedIntent);

    console.log(
      `Mock solver ${isSuccess ? "completed" : "failed"} intent: ${intent.id}`
    );
  }

  generateMockResult(intent) {
    // Generate results that match our Intent structure from Module 3
    switch (intent.action) {
      case "transfer":
        return {
          transactionHash: `mock_tx_${Date.now().toString(36)}`,
          user_account: intent.user_account,
          recipient: intent.params?.recipient || "recipient.near",
          amount: intent.input_amount,
          token: intent.input_token,
        };
      case "swap":
        const inputAmount = BigInt(intent.input_amount);
        const simulatedRate = 1.05; // 5% slippage
        // Calculate output amount (with simulated exchange rate)
        const outputAmount = (Number(inputAmount) * simulatedRate).toString();

        return {
          transactionHash: `mock_tx_${Date.now().toString(36)}`,
          input_token: intent.input_token,
          output_token: intent.output_token,
          input_amount: intent.input_amount,
          output_amount: outputAmount,
          rate: simulatedRate,
        };
      default:
        return { success: true };
    }
  }

  getStats() {
    return {
      pendingCount: this.pendingIntents.length,
      processedCount: this.processedIntents.length,
      successCount: this.processedIntents.filter(
        (i) => i.status === "COMPLETED"
      ).length,
      failureCount: this.processedIntents.filter((i) => i.status === "FAILED")
        .length,
    };
  }
}

// Create a singleton instance for easier usage
export const mockSolver = new MockSolver();
```

### Integrating the Mock Solver with Your Intent Service

Next, let's modify our intent service to use the mock solver in development mode:

```javascript
// src/services/intentService.js (development version)
import { mockSolver } from "./mockSolverService";

// Environment check to only use mock in development
const USE_MOCK_SOLVER =
  process.env.NODE_ENV === "development" ||
  process.env.REACT_APP_USE_MOCK_SOLVER === "true";

// Start the mock solver if we're using it
if (USE_MOCK_SOLVER) {
  mockSolver.start();
}

// Submit an intent - uses mock solver in development
export async function submitIntent(signedIntent) {
  if (USE_MOCK_SOLVER) {
    console.log("Development mode: Using mock solver");

    // Generate a unique intent ID (matches our Module 3 Intent structure)
    const intentId = `intent_${Date.now().toString(36)}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // Create intent object with the structure expected by our contracts
    const intent = {
      id: intentId,
      user_account: signedIntent.user_account,
      action: signedIntent.action,
      input_token: signedIntent.input_token,
      input_amount: signedIntent.input_amount,
      output_token: signedIntent.output_token,
      min_output_amount: signedIntent.min_output_amount,
      max_slippage: signedIntent.max_slippage,
      deadline: signedIntent.deadline,
      status: "PENDING",
      createdAt: Date.now(),
    };

    // Add to mock solver queue
    mockSolver.addIntent(intent);

    return {
      intentId,
      status: "PENDING",
    };
  } else {
    // In production, call the actual verifier contract
    // Implementation depends on your NEAR integration
    // ...
  }
}

// Get intent status - uses mock data in development
export async function getIntentStatus(intentId) {
  if (USE_MOCK_SOLVER) {
    // Find in processed intents
    const processedIntent = mockSolver.processedIntents.find(
      (i) => i.id === intentId
    );
    if (processedIntent) {
      return processedIntent;
    }

    // Find in pending intents
    const pendingIntent = mockSolver.pendingIntents.find(
      (i) => i.id === intentId
    );
    if (pendingIntent) {
      return pendingIntent;
    }

    throw new Error(`Intent with ID ${intentId} not found`);
  } else {
    // In production, query the verifier contract
    // ...
  }
}

// Get intent history - uses mock data in development
export async function getIntentHistory(accountId) {
  if (USE_MOCK_SOLVER) {
    // Combine pending and processed intents for the account
    return [
      ...mockSolver.pendingIntents.filter((i) => i.user_account === accountId),
      ...mockSolver.processedIntents.filter(
        (i) => i.user_account === accountId
      ),
    ].sort((a, b) => b.createdAt - a.createdAt);
  } else {
    // In production, query the verifier contract or indexer
    // ...
  }
}
```

### Creating a Solver Simulator UI

To control your mock solver during testing, create a debug interface:

```jsx
// src/components/debug/SolverSimulator.jsx
import React, { useState, useEffect } from "react";
import { mockSolver } from "../../services/mockSolverService";

export function SolverSimulator() {
  const [isRunning, setIsRunning] = useState(mockSolver.running);
  const [successRate, setSuccessRate] = useState(mockSolver.successRate * 100);
  const [delay, setDelay] = useState(mockSolver.simulatedDelay);
  const [stats, setStats] = useState(mockSolver.getStats());

  useEffect(() => {
    // Update stats every second
    const interval = setInterval(() => {
      setStats(mockSolver.getStats());
      setIsRunning(mockSolver.running);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleSolver = () => {
    if (isRunning) {
      mockSolver.stop();
    } else {
      mockSolver.start();
    }
    setIsRunning(!isRunning);
  };

  const updateSuccessRate = (value) => {
    mockSolver.successRate = value / 100;
    setSuccessRate(value);
  };

  const updateDelay = (value) => {
    mockSolver.simulatedDelay = value;
    setDelay(value);
  };

  const clearProcessedIntents = () => {
    mockSolver.processedIntents = [];
    setStats(mockSolver.getStats());
  };

  return (
    <div className="solver-simulator">
      <h2>Solver Simulator</h2>

      <div className="control-section">
        <label>
          Solver Status:
          <button onClick={toggleSolver}>
            {isRunning ? "Stop Solver" : "Start Solver"}
          </button>
        </label>
      </div>

      <div className="control-section">
        <label>
          Success Rate: {successRate}%
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={successRate}
            onChange={(e) => updateSuccessRate(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="control-section">
        <label>
          Processing Delay: {delay}ms
          <input
            type="range"
            min="500"
            max="10000"
            step="500"
            value={delay}
            onChange={(e) => updateDelay(Number(e.target.value))}
          />
        </label>
      </div>

      <div className="stats-section">
        <h3>Statistics</h3>
        <table>
          <tbody>
            <tr>
              <td>Pending Intents:</td>
              <td>{stats.pendingCount}</td>
            </tr>
            <tr>
              <td>Processed Intents:</td>
              <td>{stats.processedCount}</td>
            </tr>
            <tr>
              <td>Success Count:</td>
              <td>{stats.successCount}</td>
            </tr>
            <tr>
              <td>Failure Count:</td>
              <td>{stats.failureCount}</td>
            </tr>
            <tr>
              <td>Success Rate:</td>
              <td>
                {stats.processedCount === 0
                  ? "N/A"
                  : `${(
                      (stats.successCount / stats.processedCount) *
                      100
                    ).toFixed(1)}%`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button onClick={clearProcessedIntents}>Clear Processed Intents</button>
    </div>
  );
}
```

### Simulating Network Conditions

For comprehensive frontend testing, simulate varied network conditions:

// WARNING: Modifying global `fetch` is a powerful technique for testing but can have unintended
// side effects if not properly managed. This simulation ONLY affects HTTP requests made via `fetch`
// within the current JS environment. It DOES NOT accurately simulate real-world blockchain network
// conditions like consensus delays, RPC node availability, or gas limitations. Use this strictly
// for development and testing purposes.
const originalFetch = window.fetch;
window.fetch = async (resource, options) => {
// Simulate packet loss
if (Math.random() < networkSimulator.packetLoss / 100) {
console.log(`[Network Simulator] Simulating packet loss for: ${resource}`);
return Promise.reject(
new Error("Network request failed (simulated packet loss)")
);
}

// Simulate latency
return new Promise((resolve, reject) => {
setTimeout(() => {
originalFetch(resource, options).then(resolve).catch(reject);
}, networkSimulator.latency);
});
};

// Create singleton instance
export const networkSimulator = new NetworkSimulator();

## Part 2: Backend Solver Simulation for Testnet Interaction

### Understanding Backend Solver Simulation

While client-side simulation tests your frontend, backend simulation focuses on:

- Testing real interactions with deployed contracts
- Simulating off-chain solver infrastructure
- Validating the end-to-end intent flow on testnet

> 💡 **Web2 Parallel**: This is similar to creating a test harness for your backend API that generates realistic traffic and transactions to validate system behavior in a staging environment.

### Implementing a Basic Off-Chain Solver

Let's create a Node.js script that simulates a basic off-chain solver:

```javascript
// scripts/simulate-solver.js
const nearAPI = require("near-api-js");
const fs = require("fs");
const path = require("path");

// Configuration
const config = {
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  solverAccountId: "solver.yourname.testnet", // Your deployed solver contract
  keyPath: "/home/user/.near-credentials/testnet/yourname.testnet.json",
  intentsDbPath: path.join(__dirname, "intent_database.json"),
  pollingInterval: 5000, // 5 seconds
  supportedActions: ["swap"], // The actions this solver supports
};

// Initialize NEAR connection
async function initializeNear() {
  const networkId = process.env.NEAR_NETWORK_ID || "testnet";
  // Use environment variable for key path or a platform-agnostic default
  const keyPath =
    process.env.NEAR_KEY_PATH ||
    require("os").homedir() +
      `/.near-credentials/${networkId}/<YOUR_SOLVER_ACCOUNT_ID>.testnet.json`;

  if (!fs.existsSync(keyPath)) {
    console.error(
      `ERROR: Key file not found at ${keyPath}. Set NEAR_KEY_PATH environment variable or ensure file exists.`
    );
    process.exit(1);
  }

  const keyFile = JSON.parse(fs.readFileSync(keyPath));

  const keyStore = new nearAPI.keyStores.UnencryptedFileSystemKeyStore(
    path.dirname(keyPath)
  );

  const near = await nearAPI.connect({
    networkId: config.networkId,
    keyStore,
    nodeUrl: config.nodeUrl,
  });

  // Get account object
  const accountId = path.basename(keyPath).replace(".json", "");
  return await near.account(accountId);
}

// Read intents from the JSON database
function readIntents() {
  if (!fs.existsSync(config.intentsDbPath)) {
    return [];
  }

  const data = fs.readFileSync(config.intentsDbPath, "utf8");
  return JSON.parse(data);
}

// Write updated intents back to the database
function writeIntents(intents) {
  fs.writeFileSync(config.intentsDbPath, JSON.stringify(intents, null, 2));
}

// Check if this solver can handle the intent
function canHandleIntent(intent) {
  return (
    config.supportedActions.includes(intent.action) &&
    intent.status === "VERIFIED" &&
    !intent.processedBy
  );
}

// Process a single intent
async function processIntent(account, intent) {
  console.log(`Processing intent ${intent.id}`);

  try {
    // Call the solver contract to solve the intent
    // Note: This calls the ACTUAL deployed contract on testnet
    const result = await account.functionCall({
      contractId: config.solverAccountId,
      methodName: "solve_intent",
      args: {
        intent_id: intent.id,
        user: intent.user_account,
        input_amount: intent.input_amount,
      },
      gas: "100000000000000", // 100 TGas
    });

    console.log(`Intent ${intent.id} processed successfully`);
    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error(`Failed to process intent ${intent.id}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Main loop to poll for intents and process them
async function main() {
  console.log("Initializing NEAR connection...");
  const account = await initializeNear();
  console.log(`Connected as ${account.accountId}`);

  console.log(`Starting solver simulation for ${config.solverAccountId}`);
  console.log(`Supported actions: ${config.supportedActions.join(", ")}`);

  while (true) {
    try {
      // Read current intents
      const intents = readIntents();

      // Find intents this solver can handle
      const eligibleIntents = intents.filter(canHandleIntent);

      if (eligibleIntents.length > 0) {
        console.log(`Found ${eligibleIntents.length} eligible intents`);

        // Process the first eligible intent
        const intent = eligibleIntents[0];
        const result = await processIntent(account, intent);

        // Update intent status in the database
        const updatedIntents = intents.map((i) => {
          if (i.id === intent.id) {
            return {
              ...i,
              status: result.success ? "COMPLETED" : "FAILED",
              processedBy: account.accountId,
              processedAt: new Date().toISOString(),
              result: result.success ? result.result : null,
              error: result.success ? null : result.error,
            };
          }
          return i;
        });

        writeIntents(updatedIntents);
      } else {
        console.log("No eligible intents found");
      }
    } catch (error) {
      console.error("Error in main loop:", error);
    }

    // Wait for the next polling interval
    await new Promise((resolve) => setTimeout(resolve, config.pollingInterval));
  }
}

// Start the solver simulation
main().catch(console.error);
```

### Creating a Tool to Add Test Intents

To populate our test database with intents, we'll create another script:

```javascript
// scripts/add-intent.js
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Configuration
const config = {
  intentsDbPath: path.join(__dirname, "intent_database.json"),
};

// Read existing intents
function readIntents() {
  if (!fs.existsSync(config.intentsDbPath)) {
    return [];
  }

  const data = fs.readFileSync(config.intentsDbPath, "utf8");
  return JSON.parse(data);
}

// Write updated intents back to the database
function writeIntents(intents) {
  fs.writeFileSync(config.intentsDbPath, JSON.stringify(intents, null, 2));
}

// Add a new test intent
function addIntent(intentData) {
  // Read existing intents
  const intents = readIntents();

  // Create a new intent with default values + provided data
  const intent = {
    id: `intent_${uuidv4()}`,
    user_account: "yourname.testnet",
    action: "swap",
    input_token: "USDC",
    input_amount: "1000000000",
    output_token: "wNEAR",
    min_output_amount: null,
    max_slippage: 0.5,
    deadline: null,
    status: "VERIFIED", // Start as verified for the simulator
    createdAt: new Date().toISOString(),
    ...intentData,
  };

  // Add to the list
  intents.push(intent);

  // Save back to the file
  writeIntents(intents);

  console.log(`Added intent ${intent.id}`);
  return intent;
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log(
    "Usage: node add-intent.js <user_account> [action] [input_token] [input_amount] [output_token]"
  );
  process.exit(1);
}

const intentData = {
  user_account: args[0],
  action: args[1] || "swap",
  input_token: args[2] || "USDC",
  input_amount: args[3] || "1000000000",
  output_token: args[4] || "wNEAR",
};

const intent = addIntent(intentData);
console.log("Intent added successfully:");
console.log(JSON.stringify(intent, null, 2));
```

### Running the Backend Solver Simulation

To test with this backend simulation:

1. **Create the JSON database first** (empty file):

   ```bash
   echo "[]" > scripts/intent_database.json
   ```

2. **Add a test intent**:

   ```bash
   node scripts/add-intent.js yourname.testnet swap USDC 1000000000 wNEAR
   ```

3. **Run the solver simulator**:
   ```bash
   node scripts/simulate-solver.js
   ```

The simulator will poll for intents, find the one you added, and attempt to solve it by calling the `solve_intent` method on your deployed solver contract.

### Simulating Multiple Competing Solvers

For a more realistic simulation, you can run multiple solver instances with different characteristics:

1. **Create different solver configuration files** (e.g., `solver-config-1.json`, `solver-config-2.json`) with different parameters.

2. **Modify the solver script** to accept a configuration file path as a command-line argument.

3. **Run multiple instances** in separate terminals:
   ```bash
   node scripts/simulate-solver.js solver-config-1.json
   node scripts/simulate-solver.js solver-config-2.json
   ```

This simulates competing solvers with different characteristics, similar to what would happen in a production environment.

### Advanced: Using NEAR Lake Framework for Real-Time Intent Discovery

For more advanced testing, you can replace the JSON database with NEAR Lake Framework to discover intents on-chain:

```javascript
// Example snippet to discover intents using NEAR Lake Framework
const { LakeContext } = require('near-lake-framework');

async function startLake() {
  const context = new LakeContext({
    network: 'testnet',
    startBlockHeight: /* starting block */,
  });

  context.on('streamer.block', async (block) => {
    for (const shard of block.chunks) {
      for (const receipt of shard.receipts) {
        for (const receipt of shard.receiptExecutionOutcomes) {
          for (const log of receipt.executionOutcome.outcome.logs) {
            if (log.startsWith("EVENT_JSON:")) {
              try {
                const eventData = JSON.parse(log.substring("EVENT_JSON:".length));
                if (eventData.standard === "near_intent" && eventData.event === "intent_verified") {
                  // Found a verified intent event
                  // Note: Extracting the full intent object from logs or transaction actions
                  // can be complex. It depends on how the intent was originally submitted
                  // (e.g., as base64 encoded arguments). This example assumes the relevant
                  // intent details are available within the log event itself for simplicity.
                  // Real-world indexers often need more sophisticated parsing of transaction actions.
                  const intent = eventData.data;
                  console.log(`Found verified intent: ${intent.id}`);
                  await handleVerifiedIntent(intent);
                }
              } catch (e) {
                console.warn("Error parsing log:", e);
              }
            }
          }
        }
      }
    }
  });

  await context.start();
}
```

This approach more closely models how production solvers would discover and process intents.

## Choosing the Right Simulation Approach

Both simulation approaches serve different purposes:

1. **Client-side simulation** is ideal for:
   - Frontend development without deployed contracts
   - Testing UI behavior under various conditions
   - Rapid iteration on user experience
2. **Backend solver simulation** is better for:
   - Testing interactions with deployed contracts
   - Validating the complete intent lifecycle on testnet
   - Stress-testing your architecture under load

Select the approach that best fits your current development stage, or use both for comprehensive testing.

## Next Steps

Now that you have tools to simulate and test your intent architecture:

1. Use client-side simulation to validate your frontend's robustness
2. Deploy your backend solver simulation to process intents on testnet
3. Test the complete intent lifecycle from creation to execution

With these techniques, you'll be well-prepared to build a production-ready intent architecture with confidence.
