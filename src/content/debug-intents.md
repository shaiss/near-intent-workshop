
# Debugging Intents

## Debugging Techniques for Intent-Based Applications

Debugging intent-based applications can be challenging due to their distributed and asynchronous nature. This section covers techniques for effective debugging.

## Contract-Level Debugging

### Using Contract Logs

Add logging to your contracts for better visibility:

```rust
// In your Rust contract
#[near_bindgen]
impl VerifierContract {
    pub fn submit_intent(&mut self, intent: Intent) -> IntentId {
        near_sdk::log!("Submitting intent: {:?}", intent);
        
        // Validate intent
        if let Err(err) = self.validate_intent(&intent) {
            near_sdk::log!("Intent validation failed: {:?}", err);
            env::panic_str(&format!("Intent validation failed: {:?}", err));
        }
        
        // Generate ID
        let intent_id = self.generate_intent_id(&intent);
        near_sdk::log!("Generated intent ID: {}", intent_id);
        
        // Store intent
        self.intents.insert(&intent_id, &intent);
        near_sdk::log!("Intent stored successfully");
        
        intent_id
    }
}
```

### Viewing Contract Logs

Use NEAR CLI to view logs when calling contract methods:

```bash
# Call method with verbose output
near call verifier.YOUR_ACCOUNT_NAME.testnet submit_intent '{
  "intent": {
    "type": "transfer",
    "params": {
      "receiver_id": "receiver.testnet",
      "amount": "1000000000000000000000000",
      "token": "near"
    }
  }
}' --accountId YOUR_ACCOUNT_NAME.testnet --deposit 0.01 --verbose

# View transaction details including logs
near tx-status TX_HASH --accountId YOUR_ACCOUNT_NAME.testnet
```

## Frontend Debugging

### Debugging Intent Creation

Add comprehensive logging to your intent creation process:

```javascript
async function createAndSubmitIntent(intentType, params) {
  console.log(`Creating intent of type ${intentType} with params:`, params);
  
  try {
    // Create the intent object
    const intent = {
      type: intentType,
      creator: accountId,
      params,
      timestamp: Date.now()
    };
    console.log('Intent object created:', intent);
    
    // Sign the intent
    console.log('Signing intent...');
    const signedIntent = await signIntent(intent);
    console.log('Intent signed:', signedIntent);
    
    // Submit to the verifier
    console.log('Submitting intent to verifier...');
    const result = await submitIntent(signedIntent);
    console.log('Intent submission result:', result);
    
    return result;
  } catch (err) {
    console.error('Intent creation failed:', err);
    throw err;
  }
}
```

### Debugging Intent Status Tracking

Implement detailed monitoring for intent status:

```javascript
function IntentMonitor({ intentId }) {
  const [status, setStatus] = useState('UNKNOWN');
  const [details, setDetails] = useState(null);
  const [logs, setLogs] = useState([]);
  
  useEffect(() => {
    if (!intentId) return;
    
    // Add initial log
    addLog(`Starting monitoring for intent: ${intentId}`);
    
    const interval = setInterval(async () => {
      try {
        addLog('Fetching intent status...');
        const intent = await getIntentStatus(intentId);
        setStatus(intent.status);
        setDetails(intent);
        
        addLog(`Status updated: ${intent.status}`);
        if (intent.logs) {
          intent.logs.forEach(log => addLog(`Contract log: ${log}`));
        }
        
        if (intent.status === 'COMPLETED' || intent.status === 'FAILED') {
          addLog(`Intent finalized with status: ${intent.status}`);
          clearInterval(interval);
        }
      } catch (err) {
        addLog(`Error fetching status: ${err.message}`);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [intentId]);
  
  const addLog = (message) => {
    setLogs(prevLogs => [
      ...prevLogs,
      {
        time: new Date().toISOString(),
        message
      }
    ]);
  };
  
  // Render component with status, details, and logs
}
```

## Using the Near Explorer

The NEAR Explorer is a valuable debugging tool:

1. Go to https://explorer.testnet.near.org/
2. Search for your account or transaction hash
3. Examine transaction details, including:
   - Method calls
   - Logs
   - Gas usage
   - Receipts

## Common Issues and Solutions

### Intent Validation Failures

```
Problem: Intent validation fails with "Invalid intent parameters"
Possible causes:
- Missing required parameters
- Invalid parameter format or type
- Parameters don't meet constraints

Solution:
- Double-check intent parameter schema
- Ensure all required fields are present
- Verify parameter formats (especially amounts and account IDs)
```

### Solver Execution Failures

```
Problem: Solver claims intent but execution fails
Possible causes:
- Insufficient gas for complex operations
- Smart contract errors in target contracts
- Race conditions with other transactions

Solution:
- Increase gas allocation for complex intents
- Check target contract state before execution
- Implement proper error handling and retry logic
```

### Permission Issues

```
Problem: "Access key not found" or "Not enough permissions"
Possible causes:
- Using the wrong account for signing
- Function call access key with insufficient permissions
- Missing required deposits

Solution:
- Verify the account used for signing
- Check access key permissions
- Ensure sufficient deposit is attached
```

## Creating a Debug Dashboard

For complex applications, create a debug dashboard:

```jsx
// src/components/debug/IntentDebugger.jsx
import React, { useState } from 'react';
import { getIntentDetails, getIntentHistory } from '../../services/debugService';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function IntentDebugger() {
  const [intentId, setIntentId] = useState('');
  const [intentDetails, setIntentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchIntentDetails = async () => {
    if (!intentId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const details = await getIntentDetails(intentId);
      setIntentDetails(details);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Intent Debugger</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 mb-4">
          <Input
            value={intentId}
            onChange={(e) => setIntentId(e.target.value)}
            placeholder="Enter intent ID"
          />
          <Button onClick={fetchIntentDetails} disabled={loading || !intentId}>
            {loading ? 'Loading...' : 'Fetch Details'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {intentDetails && (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="params">Parameters</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">Status</div>
                  <div>{intentDetails.status}</div>
                  
                  <div className="font-medium">Type</div>
                  <div>{intentDetails.type}</div>
                  
                  <div className="font-medium">Creator</div>
                  <div>{intentDetails.creator}</div>
                  
                  <div className="font-medium">Created At</div>
                  <div>{new Date(intentDetails.created_at).toLocaleString()}</div>
                  
                  <div className="font-medium">Solver</div>
                  <div>{intentDetails.solver || 'None'}</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="params">
              <pre className="bg-gray-100 p-3 rounded overflow-auto">
                {JSON.stringify(intentDetails.params, null, 2)}
              </pre>
            </TabsContent>
            
            <TabsContent value="logs">
              {intentDetails.logs && intentDetails.logs.length > 0 ? (
                <ul className="space-y-2">
                  {intentDetails.logs.map((log, index) => (
                    <li key={index} className="bg-gray-100 p-2 rounded">
                      <div className="text-xs text-gray-500">{log.timestamp}</div>
                      <div>{log.message}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No logs available</p>
              )}
            </TabsContent>
            
            <TabsContent value="transactions">
              {intentDetails.transactions && intentDetails.transactions.length > 0 ? (
                <ul className="space-y-2">
                  {intentDetails.transactions.map((tx, index) => (
                    <li key={index} className="border-b pb-2 last:border-b-0">
                      <div className="font-medium">Hash: {tx.hash}</div>
                      <div className="text-sm">Type: {tx.type}</div>
                      <div className="text-sm">Status: {tx.status}</div>
                      <a 
                        href={`https://explorer.testnet.near.org/transactions/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline text-sm"
                      >
                        View on Explorer
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No transactions available</p>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
```

In the next section, we'll explore how to simulate solvers for testing.
