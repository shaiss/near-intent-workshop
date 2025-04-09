
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
