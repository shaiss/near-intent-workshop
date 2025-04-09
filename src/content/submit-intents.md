
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
