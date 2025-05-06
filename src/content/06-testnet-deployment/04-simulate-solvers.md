# Simulating Solvers

## Techniques for Simulating Solvers in Development

Simulating solvers allows you to test your intent system without deploying actual solver infrastructure. This section covers approaches for solver simulation.

## Local Solver Simulation

### Mock Solver Implementation

Create a mock solver that simulates the behavior of a real solver:

```javascript
// src/services/mockSolverService.js
export class MockSolver {
  constructor(options = {}) {
    this.supportedIntentTypes = options.supportedIntentTypes || ['transfer', 'swap'];
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
    console.log('Mock solver started');
  }

  stop() {
    this.running = false;
    console.log('Mock solver stopped');
  }

  addIntent(intent) {
    console.log(`Mock solver received intent: ${intent.id}`);
    this.pendingIntents.push({
      ...intent,
      status: 'PENDING',
      receivedAt: Date.now()
    });
  }

  onIntentStatusChange(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(intent) {
    this.listeners.forEach(listener => listener(intent));
  }

  async processLoop() {
    while (this.running) {
      if (this.pendingIntents.length > 0) {
        // Process the next intent
        const intent = this.pendingIntents.shift();
        await this.processIntent(intent);
      }

      // Wait a bit before the next iteration
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async processIntent(intent) {
    if (!this.supportedIntentTypes.includes(intent.type)) {
      console.log(`Mock solver doesn't support intent type: ${intent.type}`);
      const failedIntent = {
        ...intent,
        status: 'FAILED',
        error: `Unsupported intent type: ${intent.type}`,
        processedAt: Date.now()
      };
      this.processedIntents.push(failedIntent);
      this.notifyListeners(failedIntent);
      return;
    }

    // Update status to EXECUTING
    const executingIntent = {
      ...intent,
      status: 'EXECUTING'
    };
    this.notifyListeners(executingIntent);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, this.simulatedDelay));

    // Determine success or failure based on success rate
    const isSuccess = Math.random() < this.successRate;

    const processedIntent = {
      ...intent,
      status: isSuccess ? 'COMPLETED' : 'FAILED',
      error: isSuccess ? null : 'Simulated random failure',
      result: isSuccess ? this.generateMockResult(intent) : null,
      processedAt: Date.now()
    };

    this.processedIntents.push(processedIntent);
    this.notifyListeners(processedIntent);

    console.log(`Mock solver ${isSuccess ? 'completed' : 'failed'} intent: ${intent.id}`);
  }

  generateMockResult(intent) {
    switch (intent.type) {
      case 'transfer':
        return {
          transactionHash: `mock_tx_${Date.now().toString(36)}`,
          sender: intent.creator,
          receiver: intent.params.recipient,
          amount: intent.params.amount,
          token: intent.params.token
        };
      case 'swap':
        const inputAmount = parseFloat(intent.params.amountIn);
        const simulatedRate = 1.05; // 5% slippage
        const outputAmount = (inputAmount * simulatedRate).toFixed(6);
        return {
          transactionHash: `mock_tx_${Date.now().toString(36)}`,
          tokenIn: intent.params.tokenIn,
          tokenOut: intent.params.tokenOut,
          amountIn: intent.params.amountIn,
          amountOut: outputAmount,
          rate: simulatedRate
        };
      default:
        return { success: true };
    }
  }

  getStats() {
    return {
      pendingCount: this.pendingIntents.length,
      processedCount: this.processedIntents.length,
      successCount: this.processedIntents.filter(i => i.status === 'COMPLETED').length,
      failureCount: this.processedIntents.filter(i => i.status === 'FAILED').length
    };
  }
}
```

### Integrating the Mock Solver

Use the mock solver in your development environment:

```javascript
// src/services/intentService.js (development version)
import { MockSolver } from './mockSolverService';

// Create mock solver instance
const mockSolver = new MockSolver({
  supportedIntentTypes: ['transfer', 'swap', 'stake'],
  simulatedDelay: 2000,
  successRate: 0.95
});

// Start the mock solver
mockSolver.start();

// Use these functions in development mode
export async function submitIntent(signedIntent) {
  console.log('Development mode: Using mock solver');

  // Generate a random intent ID
  const intentId = `intent_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;

  // Create intent object with ID
  const intent = {
    ...signedIntent,
    id: intentId,
    status: 'PENDING',
    createdAt: Date.now()
  };

  // Add to mock solver queue
  mockSolver.addIntent(intent);

  return {
    intentId,
    status: 'PENDING'
  };
}

export async function getIntentStatus(intentId) {
  // Find in processed intents
  const processedIntent = mockSolver.processedIntents.find(i => i.id === intentId);
  if (processedIntent) {
    return processedIntent;
  }

  // Find in pending intents
  const pendingIntent = mockSolver.pendingIntents.find(i => i.id === intentId);
  if (pendingIntent) {
    return pendingIntent;
  }

  throw new Error(`Intent with ID ${intentId} not found`);
}

export async function getIntentHistory(accountId) {
  // Combine pending and processed intents for the account
  return [
    ...mockSolver.pendingIntents.filter(i => i.creator === accountId),
    ...mockSolver.processedIntents.filter(i => i.creator === accountId)
  ].sort((a, b) => b.createdAt - a.createdAt);
}
```

## Simulation with UI Controls

Create a debugging interface to control the simulation:

```jsx
// src/components/debug/SolverSimulator.jsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { mockSolver } from '../../services/mockSolverService';

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
    <Card>
      <CardHeader>
        <CardTitle>Solver Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="solver-status">Solver Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="solver-status"
              checked={isRunning}
              onCheckedChange={toggleSolver}
            />
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Success Rate: {successRate}%</Label>
          </div>
          <Slider
            value={[successRate]}
            min={0}
            max={100}
            step={5}
            onValueChange={(value) => updateSuccessRate(value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Processing Delay: {delay}ms</Label>
          </div>
          <Slider
            value={[delay]}
            min={500}
            max={10000}
            step={500}
            onValueChange={(value) => updateDelay(value[0])}
          />
        </div>

        <div className="bg-gray-100 p-4 rounded-md">
          <h3 className="font-medium mb-2">Statistics</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Pending Intents:</div>
            <div>{stats.pendingCount}</div>

            <div>Processed Intents:</div>
            <div>{stats.processedCount}</div>

            <div>Success Count:</div>
            <div>{stats.successCount}</div>

            <div>Failure Count:</div>
            <div>{stats.failureCount}</div>

            <div>Success Rate:</div>
            <div>
              {stats.processedCount === 0
                ? 'N/A'
                : `${((stats.successCount / stats.processedCount) * 100).toFixed(1)}%`}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" onClick={clearProcessedIntents}>
          Clear Processed Intents
        </Button>
      </CardFooter>
    </Card>
  );
}
```

## Simulating Network Conditions

Add network condition simulation to test robustness:

```javascript
// src/services/networkSimulator.js
export class NetworkSimulator {
  constructor() {
    this.latency = 200; // ms
    this.packetLoss = 0; // percentage (0-100)
    this.enabled = false;

    // Save the original fetch
    this.originalFetch = window.fetch;
  }

  enable() {
    if (this.enabled) return;

    this.enabled = true;
    window.fetch = this.createSimulatedFetch();
    console.log('Network simulation enabled');
  }

  disable() {
    if (!this.enabled) return;

    this.enabled = false;
    window.fetch = this.originalFetch;
    console.log('Network simulation disabled');
  }

  setLatency(latencyMs) {
    this.latency = latencyMs;
  }

  setPacketLoss(lossPercentage) {
    this.packetLoss = Math.min(100, Math.max(0, lossPercentage));
  }

  createSimulatedFetch() {
    const simulator = this;
    const originalFetch = this.originalFetch;

    return function simulatedFetch(url, options) {
      // Simulate packet loss
      if (Math.random() < simulator.packetLoss / 100) {
        console.log(`[Network Simulator] Simulating packet loss for: ${url}`);
        return Promise.reject(new Error('Network request failed (simulated packet loss)'));
      }

      // Simulate latency
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          originalFetch(url, options)
            .then(resolve)
            .catch(reject);
        }, simulator.latency);
      });
    };
  }
}

// Create singleton instance
export const networkSimulator = new NetworkSimulator();
```

## Scenario Testing

Create predefined scenarios for testing specific use cases:

```javascript
// src/services/scenarioService.js
import { mockSolver } from './mockSolverService';
import { networkSimulator } from './networkSimulator';

export const scenarios = {
  optimal: {
    name: 'Optimal Conditions',
    description: 'Fast network, high success rate',
    setup: () => {
      mockSolver.successRate = 0.99;
      mockSolver.simulatedDelay = 1000;
      networkSimulator.setLatency(50);
      networkSimulator.setPacketLoss(0);
    }
  },
  degraded: {
    name: 'Degraded Network',
    description: 'High latency, occasional packet loss',
    setup: () => {
      mockSolver.successRate = 0.8;
      mockSolver.simulatedDelay = 2000;
      networkSimulator.setLatency(500);
      networkSimulator.setPacketLoss(5);
    }
  },
  highFailure: {
    name: 'High Failure Rate',
    description: 'Solvers frequently fail to execute intents',
    setup: () => {
      mockSolver.successRate = 0.3;
      mockSolver.simulatedDelay = 1500;
      networkSimulator.setLatency(200);
      networkSimulator.setPacketLoss(2);
    }
  },
  slowProcessing: {
    name: 'Slow Processing',
    description: 'Intents take a long time to process',
    setup: () => {
      mockSolver.successRate = 0.9;
      mockSolver.simulatedDelay = 8000;
      networkSimulator.setLatency(300);
      networkSimulator.setPacketLoss(1);
    }
  }
};

export function runScenario(scenarioId) {
  const scenario = scenarios[scenarioId];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  console.log(`Running scenario: ${scenario.name}`);
  scenario.setup();
  networkSimulator.enable();
  mockSolver.start();

  return scenario;
}

export function stopSimulation() {
  mockSolver.stop();
  networkSimulator.disable();
}
```

## Controlling Simulation via UI

Add controls to switch between scenarios:

```jsx
// src/components/debug/ScenarioSimulator.jsx
import React, { useState } from 'react';
import { scenarios, runScenario, stopSimulation } from '../../services/scenarioService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';

export function ScenarioSimulator() {
  const [activeScenario, setActiveScenario] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunScenario = (scenarioId) => {
    if (isRunning) {
      stopSimulation();
    }

    runScenario(scenarioId);
    setActiveScenario(scenarioId);
    setIsRunning(true);
  };

  const handleStopSimulation = () => {
    stopSimulation();
    setIsRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Simulator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={activeScenario}
          onValueChange={handleRunScenario}
          disabled={isRunning}
        >
          {Object.entries(scenarios).map(([id, scenario]) => (
            <div key={id} className="flex items-start space-x-2">
              <RadioGroupItem value={id} id={`scenario-${id}`} />
              <div className="grid gap-1.5">
                <Label htmlFor={`scenario-${id}`}>{scenario.name}</Label>
                <p className="text-sm text-gray-500">
                  {scenario.description}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>

        {activeScenario && isRunning && (
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm font-medium">
              Running: {scenarios[activeScenario].name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              The application is now running with simulated conditions.
              Test your intents to see how they behave in this scenario.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant={isRunning ? "destructive" : "outline"} 
          onClick={isRunning ? handleStopSimulation : undefined}
          disabled={!isRunning}
        >
          Stop Simulation
        </Button>
      </CardFooter>
    </Card>
  );
}
```

In the next section, we'll explore advanced concepts in intent-based architecture, including composability.


# Simulating Solvers

## Overview

In a production intent infrastructure, multiple solvers compete to fulfill user intents. In this section, you'll learn how to simulate this competitive environment for testing purposes.

## Why Simulate Solvers?

Solver simulation helps you:

1. Test the complete intent fulfillment flow
2. Validate the economic models and incentives
3. Identify edge cases in solver selection and execution
4. Prepare for multi-solver competition before launching in production

## Basic Solver Simulation Script

Here's a simplified Node.js script that simulates a solver monitoring for new intents:

```javascript
const nearAPI = require('near-api-js');
const fs = require('fs');

// Configure connection to NEAR
const config = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
};

async function simulateSolver() {
  // Connect to NEAR
  const near = await nearAPI.connect(config);
  const account = await near.account('solver.yourname.testnet');

  console.log('Solver simulation started...');

  // Create a mock database of intents (in production, use an indexer)
  let mockDB = './intent_database.json';
  if (!fs.existsSync(mockDB)) {
    fs.writeFileSync(mockDB, JSON.stringify({intents: []}));
  }

  // Simulation loop
  while(true) {
    // Read the current state
    const dbData = JSON.parse(fs.readFileSync(mockDB));

    // Look for unprocessed intents
    const openIntents = dbData.intents.filter(i => !i.processed);
    console.log(`Found ${openIntents.length} open intents`);

    for (const intent of openIntents) {
      try {
        // Check if this solver can handle this intent
        if (intent.input_token === 'USDC' && intent.output_token === 'wNEAR') {
          console.log(`Processing intent ${intent.id} for user ${intent.user}`);

          // Call the solver contract
          const result = await account.functionCall({
            contractId: 'solver.yourname.testnet',
            methodName: 'solve_intent',
            args: {
              user: intent.user,
              input_amount: intent.input_amount
            },
            gas: '300000000000000'
          });

          console.log(`Solver execution result: ${JSON.stringify(result)}`);

          // Mark as processed in our mock DB
          intent.processed = true;
          intent.result = result;
        }
      } catch (error) {
        console.error(`Error processing intent ${intent.id}:`, error);
      }
    }

    // Update the database
    fs.writeFileSync(mockDB, JSON.stringify({intents: dbData.intents}));

    // Wait before next scan
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

// Start the simulation
simulateSolver().catch(console.error);
```

Save this as `simulate-solver.js` and run with Node.js.

## Adding Intents to the Simulation

Create a separate script to add intents to your mock database:

```javascript
const fs = require('fs');

function addIntent(intent) {
  const mockDB = './intent_database.json';

  // Read the current database
  const dbData = JSON.parse(fs.readFileSync(mockDB));

  // Add a new intent
  const newIntent = {
    id: `intent-${Date.now()}`,
    user: intent.user,
    input_token: intent.input_token,
    input_amount: intent.input_amount,
    output_token: intent.output_token,
    max_slippage: intent.max_slippage,
    timestamp: Date.now(),
    processed: false
  };

  dbData.intents.push(newIntent);

  // Write back to the database
  fs.writeFileSync(mockDB, JSON.stringify(dbData, null, 2));

  console.log(`Added new intent: ${newIntent.id}`);
  return newIntent.id;
}

// Example usage
addIntent({
  user: 'yourname.testnet',
  input_token: 'USDC',
  input_amount: 100,
  output_token: 'wNEAR',
  max_slippage: 0.5
});
```

Save this as `add-intent.js` and use it to populate your test intent database.

## Simulating Multiple Competing Solvers

To simulate a competitive environment, create multiple solver instances with different strategies:

```javascript
// solver-a.js - Optimizes for speed
const delay = 2000; // Fast response time
const fee = 0.8; // Higher fee

// solver-b.js - Optimizes for cost
const delay = 5000; // Slower response time
const fee = 0.3; // Lower fee
```

Run these solvers simultaneously and observe which one wins for different types of intents.

## Integrating with Real Indexers

For more realistic testing, consider integrating with NEAR indexers:

### Using NEAR Lake Framework

```javascript
const { LakeConfig, startStream } = require('near-lake-framework');

const lakeConfig = new LakeConfig({
  s3Prefix: 'testnet',
  startBlockHeight: 12345678,
});

async function handleStreamerMessage(streamerMessage) {
  const block = await streamerMessage.toBlock();

  // Process receipts to find intents
  for (const chunk of block.chunks) {
    for (const receipt of chunk.receipts) {
      // Look for calls to your verifier contract
      if (receipt.receiverId === 'verifier.yourname.testnet') {
        // Process and add to solver queue
        console.log(`Found potential intent in receipt: ${receipt.receiptId}`);
      }
    }
  }
}

startStream({
  config: lakeConfig,
  callbackOptions: {
    blockCallbackFn: handleStreamerMessage
  }
});
```

## Next Steps

After implementing and testing your solver simulation:

1. Analyze the data to identify performance bottlenecks
2. Refine your solver logic based on simulation results
3. Consider how your system would scale with real-world usage

This completes the testnet deployment and debugging section. Next, we'll explore more advanced use cases and production considerations for your intent infrastructure.