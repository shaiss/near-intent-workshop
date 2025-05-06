
# Submitting Intents

## Building Intent Submission UI

Once a user is connected, they need a way to create and submit intents. This section covers how to build intent submission forms and handle the submission process.

## Intent Form Component

```jsx
// src/components/intent/IntentForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useIntent } from '../../hooks/useIntent';
import { Button } from '../ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { toast } from 'sonner';

// Validation schema
const transferSchema = z.object({
  recipient: z.string().min(1, 'Recipient is required'),
  amount: z.string().refine(val => !isNaN(val) && parseFloat(val) > 0, {
    message: 'Amount must be a positive number',
  }),
  token: z.string().min(1, 'Token is required'),
});

export function TransferIntentForm() {
  const { createAndSubmitIntent, loading } = useIntent();
  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipient: '',
      amount: '',
      token: 'NEAR',
    },
  });
  
  const onSubmit = async (values) => {
    try {
      const result = await createAndSubmitIntent('transfer', {
        recipient: values.recipient,
        amount: values.amount,
        token: values.token,
      });
      
      toast.success('Intent submitted successfully', {
        description: `Intent ID: ${result.intentId}`,
      });
      
      form.reset();
    } catch (error) {
      toast.error('Failed to submit intent', {
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
          {loading ? 'Submitting...' : 'Submit Intent'}
        </Button>
      </form>
    </Form>
  );
}
```

## Intent History Component

```jsx
// src/components/intent/IntentHistory.jsx
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { getIntentHistory } from '../../services/intentService';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';

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
      console.error('Failed to load intent history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadIntents();
  }, [accountId, connected]);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'EXECUTING': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'FAILED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };
  
  if (!connected) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Connect your wallet to view intent history</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Intent History</CardTitle>
        <Button variant="outline" size="sm" onClick={loadIntents} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
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
                      {intent.type === 'transfer' && ` to ${intent.params.recipient}`}
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
const API_BASE_URL = process.env.API_URL || 'https://api.example.com';

export async function submitIntent(signedIntent) {
  const response = await fetch(`${API_BASE_URL}/intents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(signedIntent),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to submit intent');
  }
  
  return response.json();
}

export async function getIntentStatus(intentId) {
  const response = await fetch(`${API_BASE_URL}/intents/${intentId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get intent status');
  }
  
  return response.json();
}

export async function getIntentHistory(accountId) {
  const response = await fetch(`${API_BASE_URL}/intents?accountId=${accountId}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get intent history');
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
import { useState } from 'react';
import { useWallet } from './useWallet';

export const useIntent = () => {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const { wallet, accountId, connected } = useWallet();

  const submitIntent = async (intent) => {
    if (!connected || !wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      setStatus('loading');
      setError(null);

      // Generate a unique intent ID
      const newIntentId = `intent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
        receiverId: 'verifier.testnet',
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName: 'verify_intent',
              args: { intent: JSON.stringify(fullIntent) },
              gas: '30000000000000',
              deposit: '0',
            },
          },
        ],
      });

      setStatus('success');
      return { intentId: newIntentId, result };
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to submit intent');
      throw err;
    }
  };

  const resetIntent = () => {
    setStatus('idle');
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
import { useState } from 'react';
import { useIntent } from '../../hooks/useIntent';

export const IntentForm = ({ onSubmitSuccess }) => {
  const [input, setInput] = useState('USDC');
  const [output, setOutput] = useState('wNEAR');
  const [amount, setAmount] = useState('');
  const { submitIntent, status, error } = useIntent();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const intent = {
        action: 'swap',
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
      setAmount('');
    } catch (err) {
      console.error('Error submitting intent:', err);
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
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Submitting...' : 'Submit Intent'}
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
  constructor(networkId = 'testnet') {
    this.networkId = networkId;
    this.verifierContract = 'verifier.testnet';
  }

  async getIntentStatus(intentId) {
    // In a real app, this would call a backend API or directly query the blockchain
    // For demo purposes, we'll simulate a response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: intentId,
          status: 'verified',
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
            id: 'solver-1',
            name: 'Ref Finance',
            route: 'USDC -> wNEAR',
            price: '1:1.05',
            gas: '25 TGas',
            fee: '0.3%'
          },
          { 
            id: 'solver-2',
            name: 'Jumbo DEX',
            route: 'USDC -> USDT -> wNEAR',
            price: '1:1.04',
            gas: '32 TGas',
            fee: '0.25%'
          }
        ]);
      }, 1500);
    });
  }
}
```

By implementing these components, we've created a complete system for users to submit intents through our frontend. The next section will focus on displaying solver options and executing the intent fulfillment.
