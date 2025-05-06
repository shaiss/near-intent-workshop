# Solver Options

## Understanding and Implementing Solver Options

Solvers are responsible for executing intents. This section explores different solver options and how to integrate them into your application.

## Types of Solvers

1. **Centralized Solvers**: Operated by a single entity
2. **Decentralized Solvers**: Distributed across multiple nodes
3. **User Solvers**: Run by the users themselves
4. **Specialized Solvers**: Focused on specific intent types

## Solver Implementation Considerations

### Registration & Discovery

Solvers need to be registered and discoverable:

```rust
// Simplified solver registration in Rust
#[near_bindgen]
impl Contract {
    pub fn register_solver(&mut self, solver_id: AccountId, intent_types: Vec<String>) {
        assert!(env::predecessor_account_id() == solver_id, "Only solver can register itself");
        
        let mut solver = Solver {
            id: solver_id.clone(),
            intent_types,
            total_executed: 0,
            success_rate: 100,
            last_active: env::block_timestamp(),
        };
        
        self.solvers.insert(&solver_id, &solver);
    }
    
    pub fn get_solvers_for_intent(&self, intent_type: String) -> Vec<SolverInfo> {
        self.solvers
            .iter()
            .filter(|(_, solver)| solver.intent_types.contains(&intent_type))
            .map(|(id, solver)| SolverInfo {
                id,
                success_rate: solver.success_rate,
                last_active: solver.last_active,
            })
            .collect()
    }
}
```

### Solver Selection UI

```jsx
// src/components/intent/SolverSelector.jsx
import React, { useEffect, useState } from 'react';
import { getSolversForIntent } from '../../services/solverService';
import { Button } from '../ui/button';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function SolverSelector({ intentType, onSelect }) {
  const [solvers, setSolvers] = useState([]);
  const [selectedSolver, setSelectedSolver] = useState(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadSolvers = async () => {
      if (!intentType) return;
      
      setLoading(true);
      try {
        const availableSolvers = await getSolversForIntent(intentType);
        setSolvers(availableSolvers);
        
        // Auto-select the first solver if available
        if (availableSolvers.length > 0) {
          setSelectedSolver(availableSolvers[0].id);
          onSelect(availableSolvers[0].id);
        }
      } catch (error) {
        console.error('Failed to load solvers:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSolvers();
  }, [intentType, onSelect]);
  
  const handleSelect = (solverId) => {
    setSelectedSolver(solverId);
    onSelect(solverId);
  };
  
  if (loading) {
    return <div className="text-center">Loading solvers...</div>;
  }
  
  if (solvers.length === 0) {
    return <div className="text-center">No solvers available for this intent type</div>;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select a Solver</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup value={selectedSolver} onValueChange={handleSelect}>
          {solvers.map((solver) => (
            <div key={solver.id} className="flex items-center space-x-2 mb-3">
              <RadioGroupItem value={solver.id} id={solver.id} />
              <Label htmlFor={solver.id} className="flex-1">
                <div>
                  <div className="font-medium">{solver.id}</div>
                  <div className="text-sm text-gray-500">
                    Success Rate: {solver.success_rate}%
                  </div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
```

## Solver Service Interface

```javascript
// src/services/solverService.js
const API_BASE_URL = process.env.API_URL || 'https://api.example.com';

export async function getSolversForIntent(intentType) {
  const response = await fetch(`${API_BASE_URL}/solvers?intentType=${intentType}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch solvers');
  }
  
  return response.json();
}

export async function assignSolverToIntent(intentId, solverId) {
  const response = await fetch(`${API_BASE_URL}/intents/${intentId}/solver`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ solverId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to assign solver');
  }
  
  return response.json();
}

export async function getSolverDetails(solverId) {
  const response = await fetch(`${API_BASE_URL}/solvers/${solverId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch solver details');
  }
  
  return response.json();
}
```

## Building Your Own Solver

A basic solver implementation should:

1. **Monitor for intents** by subscribing to events or polling
2. **Filter intents** based on capabilities and parameters
3. **Simulate execution** to verify feasibility
4. **Execute transactions** to fulfill the intent
5. **Report results** back to the network

```javascript
// src/services/solverNode.js (simplified example)
import { connect, Contract, keyStores, utils } from 'near-api-js';

export class SolverNode {
  constructor(accountId, privateKey, networkId = 'testnet') {
    this.accountId = accountId;
    this.privateKey = privateKey;
    this.networkId = networkId;
    this.running = false;
    this.supportedIntentTypes = ['transfer', 'swap'];
  }
  
  async initialize() {
    // Configure NEAR connection
    const keyStore = new keyStores.InMemoryKeyStore();
    const keyPair = utils.KeyPair.fromString(this.privateKey);
    await keyStore.setKey(this.networkId, this.accountId, keyPair);
    
    const config = {
      networkId: this.networkId,
      keyStore,
      nodeUrl: `https://rpc.${this.networkId}.near.org`,
      walletUrl: `https://wallet.${this.networkId}.near.org`,
      helperUrl: `https://helper.${this.networkId}.near.org`,
      explorerUrl: `https://explorer.${this.networkId}.near.org`,
    };
    
    // Connect to NEAR
    const near = await connect(config);
    this.account = await near.account(this.accountId);
    
    // Initialize verifier contract
    this.verifierContract = new Contract(
      this.account,
      'verifier.testnet',
      {
        viewMethods: ['get_pending_intents'],
        changeMethods: ['claim_intent', 'report_execution'],
      }
    );
    
    // Register as solver
    await this.registerAsSolver();
  }
  
  async registerAsSolver() {
    // Call the contract to register this account as a solver
    await this.verifierContract.register_solver({
      intent_types: this.supportedIntentTypes,
    });
  }
  
  async start() {
    this.running = true;
    
    while (this.running) {
      try {
        // Fetch pending intents
        const pendingIntents = await this.verifierContract.get_pending_intents({
          limit: 10,
          intent_types: this.supportedIntentTypes,
        });
        
        // Process each intent
        for (const intent of pendingIntents) {
          await this.processIntent(intent);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Solver error:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  
  async processIntent(intent) {
    try {
      // Try to claim the intent
      const claimResult = await this.verifierContract.claim_intent({
        intent_id: intent.id,
      });
      
      if (claimResult.success) {
        // Simulate execution
        const simulationResult = await this.simulateExecution(intent);
        
        if (simulationResult.success) {
          // Execute the intent
          const executionResult = await this.executeIntent(intent);
          
          // Report execution result
          await this.verifierContract.report_execution({
            intent_id: intent.id,
            success: executionResult.success,
            result: executionResult.result,
          });
        } else {
          // Report simulation failure
          await this.verifierContract.report_execution({
            intent_id: intent.id,
            success: false,
            result: simulationResult.error,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing intent ${intent.id}:`, error);
    }
  }
  
  // Implement these methods based on your specific needs
  async simulateExecution(intent) {
    // Simulation logic
  }
  
  async executeIntent(intent) {
    // Execution logic
  }
  
  stop() {
    this.running = false;
  }
}
```

In the next section, we'll explore how to execute intents and monitor their status.
# Solver Options

## Displaying Available Solvers

After a user submits an intent, we need to present them with solver options that can fulfill their intent. This section covers how to fetch and display these options.

## Creating the Solver Options Component

```jsx
// src/components/intent/SolverOptions.jsx
import { useEffect, useState } from 'react';
import { IntentService } from '../../services/intentService';

export const SolverOptions = ({ intentId, onSelectSolver }) => {
  const [solvers, setSolvers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchSolvers = async () => {
      if (!intentId) return;
      
      const intentService = new IntentService();
      
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, we'd query actual solvers or a marketplace
        const solverOptions = await intentService.getSolversForIntent(intentId);
        setSolvers(solverOptions);
      } catch (err) {
        console.error('Error fetching solvers:', err);
        setError('Failed to fetch solver options. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSolvers();
  }, [intentId]);
  
  if (loading) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Finding the Best Routes...</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (solvers.length === 0) {
    return (
      <div className="p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-xl font-bold mb-4">No Solvers Available</h2>
        <p>No solvers are currently available for this intent. Please try again later or modify your intent.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Available Solvers</h2>
      <p className="text-sm text-gray-600 mb-4">
        Select a solver to execute your intent:
      </p>
      
      <div className="space-y-4">
        {solvers.map((solver) => (
          <div 
            key={solver.id}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition cursor-pointer"
            onClick={() => onSelectSolver(solver)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-bold">{solver.name}</h3>
              <span className="text-green-600 font-semibold">{solver.price}</span>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              <p>Route: {solver.route}</p>
              <div className="flex justify-between mt-1">
                <span>Gas: {solver.gas}</span>
                <span>Fee: {solver.fee}</span>
              </div>
            </div>
            
            <button
              className="mt-3 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              onClick={(e) => {
                e.stopPropagation();
                onSelectSolver(solver);
              }}
            >
              Select & Execute
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Implementing the Solver Selection Flow

Now let's update our main component to manage the full intent and solver selection flow:

```jsx
// src/components/intent/IntentFlow.jsx
import { useState } from 'react';
import { IntentForm } from './IntentForm';
import { SolverOptions } from './SolverOptions';

export const IntentFlow = () => {
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'solvers', 'execution'
  const [intentId, setIntentId] = useState(null);
  const [selectedSolver, setSelectedSolver] = useState(null);
  
  const handleIntentSubmitted = (newIntentId) => {
    setIntentId(newIntentId);
    setCurrentStep('solvers');
  };
  
  const handleSolverSelected = (solver) => {
    setSelectedSolver(solver);
    setCurrentStep('execution');
  };
  
  const resetFlow = () => {
    setCurrentStep('form');
    setIntentId(null);
    setSelectedSolver(null);
  };
  
  return (
    <div className="max-w-2xl mx-auto">
      {currentStep === 'form' && (
        <IntentForm onSubmitSuccess={handleIntentSubmitted} />
      )}
      
      {currentStep === 'solvers' && intentId && (
        <SolverOptions 
          intentId={intentId} 
          onSelectSolver={handleSolverSelected} 
        />
      )}
      
      {currentStep === 'execution' && selectedSolver && (
        <div className="p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-bold mb-4">Executing Intent</h2>
          <p>Executing your intent with {selectedSolver.name}...</p>
          
          {/* Execution status would be shown here */}
          
          <button
            onClick={resetFlow}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Create New Intent
          </button>
        </div>
      )}
    </div>
  );
};
```

With these components in place, users can now see available solver options after submitting an intent and select one to execute their intended action. The next section will cover the execution step.
