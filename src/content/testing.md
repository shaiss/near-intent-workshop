
# Testing Execution

## Setting Up the Test Environment

Before testing our intent system, we need to set up a proper test environment:

```javascript
const nearAPI = require('near-api-js');
const BN = require('bn.js');

// Configuration for local development
const config = {
  networkId: 'local',
  nodeUrl: 'http://localhost:3030',
  walletUrl: 'http://localhost:4000/wallet',
  helperUrl: 'http://localhost:3000',
  explorerUrl: 'http://localhost:3000',
  keyPath: '/tmp/near-dev-keys',
};

// Initialize NEAR connection
async function initNEAR() {
  const near = await nearAPI.connect(config);
  const account = await near.account('test.near');
  return { near, account };
}
```

## Deploying Contracts for Testing

```javascript
async function deployContracts() {
  const { near, account } = await initNEAR();
  
  // Deploy verifier contract
  await account.createAndDeployContract(
    'verifier.test.near',
    fs.readFileSync('./out/verifier.wasm'),
    {
      method: 'new',
      args: { owner_id: 'test.near' },
      gas: new BN('300000000000000'),
    }
  );
  
  // Deploy solver contract
  await account.createAndDeployContract(
    'solver.test.near',
    fs.readFileSync('./out/solver.wasm'),
    {
      method: 'new',
      args: { 
        owner_id: 'test.near',
        verifier_id: 'verifier.test.near'
      },
      gas: new BN('300000000000000'),
    }
  );
  
  return {
    verifierContract: new nearAPI.Contract(
      account,
      'verifier.test.near',
      { viewMethods: ['get_intent', 'get_pending_intents'], changeMethods: ['submit_intent'] }
    ),
    solverContract: new nearAPI.Contract(
      account,
      'solver.test.near',
      { viewMethods: [], changeMethods: ['solve_intent'] }
    )
  };
}
```

## Creating Test Intents

```javascript
async function createTestIntent(verifierContract) {
  const intentId = await verifierContract.submit_intent({
    action: 'swap',
    input: JSON.stringify({
      token: 'usdc.test.near',
      amount: '100'
    }),
    output: JSON.stringify({
      token: 'near',
      minAmount: '10'
    }),
    constraints: JSON.stringify({
      maxSlippage: '0.5%',
      deadline: Date.now() + 3600000 // 1 hour from now
    })
  });
  
  console.log('Created intent with ID:', intentId);
  return intentId;
}
```

## Testing Intent Execution

```javascript
async function testIntentExecution() {
  const { verifierContract, solverContract } = await deployContracts();
  
  // Create a test intent
  const intentId = await createTestIntent(verifierContract);
  
  // Check intent details
  const intent = await verifierContract.get_intent({ intent_id: intentId });
  console.log('Intent details:', intent);
  
  // Solve the intent
  await solverContract.solve_intent({ intent_id: intentId });
  
  // Verify intent was executed
  const updatedIntent = await verifierContract.get_intent({ intent_id: intentId });
  console.log('Updated intent status:', updatedIntent.status);
  
  if (updatedIntent.status === 'Executed') {
    console.log('Intent execution test passed!');
  } else {
    console.log('Intent execution test failed!');
  }
}

testIntentExecution().catch(console.error);
```

## Integration Testing

Integration tests validate the entire intent flow from creation to execution:

```javascript
async function runIntegrationTests() {
  // 1. Setup test environment
  const { account, verifierContract, solverContract } = await setupTestEnvironment();
  
  // 2. Create mock tokens for testing
  const { usdcToken, nearToken } = await createMockTokens(account);
  
  // 3. Fund test account with tokens
  await fundAccountWithTokens(account, usdcToken, '1000');
  
  // 4. Submit swap intent
  const intentId = await createSwapIntent(verifierContract, usdcToken, nearToken);
  
  // 5. Execute intent through solver
  await executeIntent(solverContract, intentId);
  
  // 6. Verify balances after execution
  await verifyBalances(account, usdcToken, nearToken);
  
  console.log('All integration tests passed!');
}
```

## Measuring Performance

Performance testing is crucial for production-ready intent systems:

```javascript
async function runPerformanceTests() {
  const { verifierContract, solverContract } = await deployContracts();
  
  // Measure intent submission time
  const startSubmit = Date.now();
  const intentId = await createTestIntent(verifierContract);
  const submitTime = Date.now() - startSubmit;
  console.log(`Intent submission took ${submitTime}ms`);
  
  // Measure intent execution time
  const startExecution = Date.now();
  await solverContract.solve_intent({ intent_id: intentId });
  const executionTime = Date.now() - startExecution;
  console.log(`Intent execution took ${executionTime}ms`);
  
  // Measure gas consumption
  // This requires more complex setup with receipt tracking
}
```

## Debugging Failed Intents

Tools and techniques for debugging intent execution:

```javascript
async function debugIntent(intentId) {
  const { verifierContract } = await initContracts();
  
  // Get intent details
  const intent = await verifierContract.get_intent({ intent_id: intentId });
  console.log('Intent details:', intent);
  
  // Check if there are any execution logs
  // This requires additional logging in your contracts
  
  // Simulate execution to find issues
  try {
    // Your simulation code here
  } catch (error) {
    console.log('Simulation error:', error);
    // Analyze error for debugging
  }
}
```
