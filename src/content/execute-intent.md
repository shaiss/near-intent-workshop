
# Executing Intent

## Intent Execution and Monitoring

Once an intent has been created and a solver has been selected, the next step is execution. This section covers how to execute intents and monitor their status.

## Intent Execution Flow

The typical execution flow for an intent is:

1. Intent creation and submission
2. Verification by the verifier contract
3. Solver assignment
4. Execution by the solver
5. Result reporting and confirmation

## Execution Component

```jsx
// src/components/intent/IntentExecutor.jsx
import React, { useState, useEffect } from 'react';
import { useIntent } from '../../hooks/useIntent';
import { assignSolverToIntent, executeIntent, getIntentStatus } from '../../services/intentService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { SolverSelector } from './SolverSelector';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';

export function IntentExecutor({ intent }) {
  const [status, setStatus] = useState(intent.status);
  const [selectedSolver, setSelectedSolver] = useState(intent.solver);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  
  // Periodically poll for status updates
  useEffect(() => {
    if (status === 'COMPLETED' || status === 'FAILED') return;
    
    const interval = setInterval(async () => {
      try {
        const updatedIntent = await getIntentStatus(intent.id);
        setStatus(updatedIntent.status);
        
        if (updatedIntent.status === 'COMPLETED') {
          toast.success('Intent completed successfully');
          clearInterval(interval);
        } else if (updatedIntent.status === 'FAILED') {
          setError(updatedIntent.error);
          toast.error('Intent execution failed');
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error fetching intent status:', err);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [intent.id, status]);
  
  const handleSolverSelect = (solverId) => {
    setSelectedSolver(solverId);
  };
  
  const handleAssignSolver = async () => {
    try {
      setExecuting(true);
      await assignSolverToIntent(intent.id, selectedSolver);
      toast.success('Solver assigned successfully');
      
      // Update status
      const updatedIntent = await getIntentStatus(intent.id);
      setStatus(updatedIntent.status);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to assign solver');
    } finally {
      setExecuting(false);
    }
  };
  
  const handleExecute = async () => {
    try {
      setExecuting(true);
      await executeIntent(intent.id);
      toast.success('Execution initiated');
      
      // Update status
      const updatedIntent = await getIntentStatus(intent.id);
      setStatus(updatedIntent.status);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to execute intent');
    } finally {
      setExecuting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execute Intent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Intent ID</p>
              <p className="text-sm text-gray-500">{intent.id}</p>
            </div>
            <div>
              <p className="font-medium">Status</p>
              <p className={`text-sm ${getStatusColor(status)}`}>{status}</p>
            </div>
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="solver">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="solver">Select Solver</TabsTrigger>
              <TabsTrigger value="details">Intent Details</TabsTrigger>
            </TabsList>
            <TabsContent value="solver">
              <SolverSelector 
                intentType={intent.type} 
                onSelect={handleSolverSelect} 
              />
            </TabsContent>
            <TabsContent value="details">
              <div className="space-y-2">
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-sm">{intent.type}</p>
                </div>
                <div>
                  <p className="font-medium">Parameters</p>
                  <pre className="text-sm bg-gray-100 p-2 rounded-md">
                    {JSON.stringify(intent.params, null, 2)}
                  </pre>
                </div>
                {intent.result && (
                  <div>
                    <p className="font-medium">Result</p>
                    <pre className="text-sm bg-gray-100 p-2 rounded-md">
                      {JSON.stringify(intent.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        
        {status === 'PENDING' && (
          <Button
            onClick={handleAssignSolver}
            disabled={executing || !selectedSolver}
          >
            {executing ? 'Assigning...' : 'Assign Solver'}
          </Button>
        )}
        
        {status === 'ASSIGNED' && (
          <Button
            onClick={handleExecute}
            disabled={executing}
          >
            {executing ? 'Executing...' : 'Execute Intent'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'PENDING': return 'text-yellow-500';
    case 'ASSIGNED': return 'text-blue-500';
    case 'EXECUTING': return 'text-purple-500';
    case 'COMPLETED': return 'text-green-500';
    case 'FAILED': return 'text-red-500';
    default: return 'text-gray-500';
  }
}
```

## Intent Execution Service

```javascript
// src/services/intentService.js (additional methods)

export async function executeIntent(intentId) {
  const response = await fetch(`${API_BASE_URL}/intents/${intentId}/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to execute intent');
  }
  
  return response.json();
}

export async function getIntentResult(intentId) {
  const response = await fetch(`${API_BASE_URL}/intents/${intentId}/result`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get intent result');
  }
  
  return response.json();
}
```

## Handling Success and Failure

```jsx
// src/components/intent/IntentResult.jsx
import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function IntentResult({ intent }) {
  if (!intent) return null;
  
  if (intent.status === 'PENDING' || intent.status === 'ASSIGNED' || intent.status === 'EXECUTING') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
            Intent In Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>The intent is currently being processed. Please wait...</p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Current Status: {intent.status}</p>
            {intent.solver && (
              <p className="text-sm text-gray-500">Solver: {intent.solver}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (intent.status === 'COMPLETED') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            Intent Completed Successfully
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Your intent has been successfully executed.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Result Details</h4>
            <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
              {JSON.stringify(intent.result, null, 2)}
            </pre>
          </div>
          
          {intent.transaction_hash && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Transaction</h4>
              <a 
                href={`https://explorer.testnet.near.org/transactions/${intent.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Explorer
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
  
  if (intent.status === 'FAILED') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <XCircle className="h-5 w-5 mr-2 text-red-500" />
            Intent Execution Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {intent.error || 'An unknown error occurred while executing the intent.'}
            </AlertDescription>
          </Alert>
          
          <div className="mt-4">
            <h4 className="font-medium mb-2">Troubleshooting</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>Check that your intent parameters are valid</li>
              <li>Ensure you have sufficient balance for the operation</li>
              <li>Try with a different solver if available</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return null;
}
```

In the next section, we'll look at how to deploy our contracts to the NEAR testnet.
