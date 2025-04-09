
const API_BASE_URL = process.env.API_URL || '/api';

export async function submitIntent(signedIntent) {
  console.log('Submitting intent:', signedIntent);
  
  // For simulation, return a mock response
  return {
    intentId: `intent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    status: 'PENDING'
  };
}

export async function getIntentStatus(intentId) {
  console.log('Getting status for intent:', intentId);
  
  // For simulation, return a mock status
  return {
    id: intentId,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };
}

export async function getIntentHistory(accountId) {
  console.log('Getting intent history for account:', accountId);
  
  // For simulation, return mock history
  return [
    {
      id: `intent_${Date.now() - 10000}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'transfer',
      status: 'COMPLETED',
      params: {
        recipient: 'recipient.testnet',
        amount: '1.0',
        token: 'NEAR'
      },
      createdAt: new Date(Date.now() - 10000).toISOString()
    },
    {
      id: `intent_${Date.now() - 20000}_${Math.random().toString(36).substring(2, 9)}`,
      type: 'swap',
      status: 'PENDING',
      params: {
        tokenIn: 'NEAR',
        tokenOut: 'USDC',
        amountIn: '5.0'
      },
      createdAt: new Date(Date.now() - 20000).toISOString()
    }
  ];
}
