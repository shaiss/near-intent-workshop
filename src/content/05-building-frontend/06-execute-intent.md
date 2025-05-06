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
# Executing Intent

## Fulfilling User Intents

The final step in our intent flow is executing the selected solver's solution. This involves sending transactions through the wallet and providing feedback to the user.

## Creating the Intent Execution Component

```jsx
// src/components/intent/IntentExecution.jsx
import { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';

export const IntentExecution = ({ intentId, solver, onComplete, onReset }) => {
  const [status, setStatus] = useState('preparing'); // preparing, executing, success, error
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const { wallet, accountId } = useWallet();
  
  useEffect(() => {
    if (solver && status === 'preparing') {
      executeIntent();
    }
  }, [solver, status]);
  
  const executeIntent = async () => {
    if (!wallet || !solver) return;
    
    try {
      setStatus('executing');
      setError(null);
      
      // In a real application, you would have solver-specific parameters
      const result = await wallet.signAndSendTransaction({
        signerId: accountId,
        receiverId: 'solver.testnet', // This could be solver.contractId in a real app
        actions: [{
          type: 'FunctionCall',
          params: {
            methodName: 'solve_intent',
            args: {
              intent_id: intentId,
              solver_id: solver.id,
              user: accountId
            },
            gas: '30000000000000',
            deposit: '0'
          }
        }]
      });
      
      // Note: In a real app, you would extract the transaction hash
      setTxHash('sample-tx-hash-' + Date.now());
      setStatus('success');
      
      if (onComplete) {
        onComplete({
          intentId,
          solverId: solver.id,
          txHash: txHash,
          status: 'completed'
        });
      }
    } catch (err) {
      console.error('Error executing intent:', err);
      setError(err.message || 'Failed to execute intent');
      setStatus('error');
    }
  };
  
  const getStatusDisplay = () => {
    switch (status) {
      case 'preparing':
        return 'Preparing transaction...';
      case 'executing':
        return 'Executing transaction...';
      case 'success':
        return 'Transaction successful!';
      case 'error':
        return 'Transaction failed';
      default:
        return '';
    }
  };
  
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-bold mb-4">Intent Execution</h2>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className={`w-4 h-4 rounded-full mr-2 ${
            status === 'executing' ? 'bg-yellow-500 animate-pulse' :
            status === 'success' ? 'bg-green-500' :
            status === 'error' ? 'bg-red-500' : 'bg-gray-300'
          }`}></div>
          <p className="font-medium">{getStatusDisplay()}</p>
        </div>
        
        {status === 'executing' && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full animate-pulse w-3/4"></div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {status === 'success' && txHash && (
        <div className="mb-4">
          <p className="font-medium">Transaction Hash:</p>
          <div className="bg-gray-100 p-2 rounded overflow-x-auto">
            <code>{txHash}</code>
          </div>
          <p className="mt-2 text-green-600">
            Your intent has been successfully executed!
          </p>
        </div>
      )}
      
      <div className="flex justify-between mt-4">
        <button
          onClick={onReset}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
        >
          Create New Intent
        </button>
        
        {status === 'error' && (
          <button
            onClick={executeIntent}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
```

## Updating the Intent Flow Component

Finally, let's update our IntentFlow component to include the execution step:

```jsx
// src/components/intent/IntentFlow.jsx (updated)
import { useState } from 'react';
import { IntentForm } from './IntentForm';
import { SolverOptions } from './SolverOptions';
import { IntentExecution } from './IntentExecution';
import { useToast } from '../../hooks/useToast'; // Hypothetical toast hook

export const IntentFlow = () => {
  const [currentStep, setCurrentStep] = useState('form'); // 'form', 'solvers', 'execution'
  const [intentId, setIntentId] = useState(null);
  const [selectedSolver, setSelectedSolver] = useState(null);
  const [completedIntent, setCompletedIntent] = useState(null);
  const { toast } = useToast();
  
  const handleIntentSubmitted = (newIntentId) => {
    setIntentId(newIntentId);
    setCurrentStep('solvers');
    toast({
      title: 'Intent Submitted',
      description: 'Your intent has been verified and is ready for execution.',
      status: 'success',
    });
  };
  
  const handleSolverSelected = (solver) => {
    setSelectedSolver(solver);
    setCurrentStep('execution');
  };
  
  const handleExecutionComplete = (result) => {
    setCompletedIntent(result);
    toast({
      title: 'Intent Executed',
      description: 'Your intent has been successfully executed!',
      status: 'success',
    });
  };
  
  const resetFlow = () => {
    setCurrentStep('form');
    setIntentId(null);
    setSelectedSolver(null);
    setCompletedIntent(null);
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
        <IntentExecution 
          intentId={intentId}
          solver={selectedSolver}
          onComplete={handleExecutionComplete}
          onReset={resetFlow}
        />
      )}
      
      {/* Optional: History section showing past intents */}
      {completedIntent && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium">Recently Completed Intent</h3>
          <p className="text-sm text-gray-600">
            Intent {completedIntent.intentId} was executed via {completedIntent.solverId}
          </p>
        </div>
      )}
    </div>
  );
};
```

## UI Polish and Final Touches

For production applications, consider adding these enhancements:

### 1. Toast Notifications

Create a toast hook for user feedback:

```jsx
// src/hooks/useToast.jsx
import { useState, useCallback } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const toast = useCallback(({ title, description, status = 'info', duration = 5000 }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, description, status }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  }, []);
  
  return { toasts, toast };
};

// Toast Component
export const ToastContainer = ({ toasts }) => {
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {toasts.map(toast => (
        <div 
          key={toast.id} 
          className={`mb-2 p-4 rounded-lg shadow-lg max-w-xs animate-fade-in ${
            toast.status === 'success' ? 'bg-green-500 text-white' :
            toast.status === 'error' ? 'bg-red-500 text-white' :
            toast.status === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          <h4 className="font-bold">{toast.title}</h4>
          <p className="text-sm">{toast.description}</p>
        </div>
      ))}
    </div>
  );
};
```

### 2. Animation and Loading States

Add animations for better UX:

```css
/* Add to your CSS */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
```

### 3. Error Handling

Implement comprehensive error handling:

```jsx
// Error boundary component
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">
            We encountered an error while processing your request.
          </p>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

With these components and enhancements in place, you now have a complete frontend implementation for your intent-based application. Users can submit intents, select from available solvers, and execute their desired actions with proper feedback and error handling.
