
# Abstraction of Actions

## Simplifying Complex Blockchain Actions

Abstracting complex blockchain actions is a key benefit of intent-centric architecture. By focusing on what users want to accomplish rather than how to accomplish it, we can create more intuitive and flexible interfaces.

## Benefits of Action Abstraction

- Hides complexity from end users
- Allows for optimization of execution paths
- Enables cross-contract and cross-chain operations
- Improves adaptability to protocol changes

## Approaches to Action Abstraction

### Intent-based Interfaces

```javascript
// Instead of specific function calls
async function specificTransfer(fromAccount, toAccount, token, amount) {
  const transaction = createTransferTransaction(fromAccount, toAccount, token, amount);
  return signAndSendTransaction(transaction);
}

// Create an intent-based interface
async function transfer(params) {
  const intent = {
    type: 'transfer',
    description: `Transfer ${params.amount} ${params.token} to ${params.recipient}`,
    params: {
      token: params.token,
      amount: params.amount,
      recipient: params.recipient
    }
  };
  
  return submitIntent(intent);
}
```

### Implementing Intent Submission

Here's how to implement a complete intent submission flow:

```javascript
// Submit an intent using a session wallet
const submitIntent = async (intent) => {
  // Get the session wallet
  const sessionWallet = await setupSessionWallet(sessionKey.privateKey);
  
  // Call the verifier contract
  const result = await sessionWallet.functionCall({
    contractId: 'verifier.testnet',
    methodName: 'verify_intent',
    args: { intent },
    gas: '30000000000000',
    attachedDeposit: '0',
  });
  
  // Return the transaction outcome
  return {
    transactionHash: result.transaction.hash,
    status: 'Submitted',
    details: result
  };
};
```

### User-Centric Action Design

Focus on mapping user goals to intents:

1. Identify common user goals
2. Create intent templates for each goal
3. Build UIs around goals rather than transactions
4. Provide feedback in user-friendly terms

### Example UI Implementation

```jsx
import { useState } from 'react';

function SwapForm({ onSubmit }) {
  const [amount, setAmount] = useState('');
  const [inputToken, setInputToken] = useState('USDC');
  const [outputToken, setOutputToken] = useState('NEAR');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const intent = {
      action: "swap",
      input_token: inputToken,
      input_amount: parseFloat(amount),
      output_token: outputToken,
      max_slippage: 0.5
    };
    
    onSubmit(intent);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Swap Tokens</h2>
      
      <div>
        <label>Amount:</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div>
        <label>From Token:</label>
        <select 
          value={inputToken} 
          onChange={(e) => setInputToken(e.target.value)}
        >
          <option value="USDC">USDC</option>
          <option value="NEAR">NEAR</option>
          <option value="ETH">ETH</option>
        </select>
      </div>
      
      <div>
        <label>To Token:</label>
        <select 
          value={outputToken} 
          onChange={(e) => setOutputToken(e.target.value)}
        >
          <option value="NEAR">NEAR</option>
          <option value="USDC">USDC</option>
          <option value="ETH">ETH</option>
        </select>
      </div>
      
      <button type="submit">Submit Intent</button>
    </form>
  );
}
```

## Building Composable Actions

Intents can be composed to create more complex operations:

```javascript
// Compose multiple intents into a single user action
async function swapAndStake(params) {
  const intents = [
    {
      type: 'swap',
      params: {
        tokenIn: params.sourceToken,
        tokenOut: params.targetToken,
        amountIn: params.amount
      }
    },
    {
      type: 'stake',
      params: {
        token: params.targetToken,
        amount: 'MAX' // Use entire output from previous intent
      }
    }
  ];
  
  return submitIntents(intents);
}
```

## Abstracting Authentication and Authorization

Create a unified permission model:

```javascript
// Instead of different patterns for different contracts
const permissionModel = {
  canTransfer: (user, token, amount) => {
    return user.hasAllowance(token, amount);
  },
  canStake: (user, pool) => {
    return pool.isOpen && user.hasMinimumBalance;
  }
};

// Use in intent verification
function verifyIntent(intent, user) {
  switch(intent.type) {
    case 'transfer':
      return permissionModel.canTransfer(
        user, 
        intent.params.token, 
        intent.params.amount
      );
    case 'stake':
      return permissionModel.canStake(
        user,
        getPool(intent.params.poolId)
      );
    default:
      return false;
  }
}
```

In the next section, we'll explore how to implement these abstractions in the frontend of your application.
