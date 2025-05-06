# Testing Execution

## The Importance of Testing Intent Systems

Testing is crucial for intent-based systems because:

1. They often handle user assets and funds
2. Multiple contracts interact in complex ways
3. Edge cases can lead to unexpected behavior
4. Solver competition requires fair comparisons

## Unit Testing Your Contracts

Let's add comprehensive tests to our verifier and solver:

```rust
// In verifier/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    #[test]
    fn test_verify_valid_intent() {
        let mut context = VMContextBuilder::new();
        context.predecessor_account_id(accounts(1));
        testing_env!(context.build());

        let mut contract = Verifier::new(accounts(0));

        let intent = Intent {
            id: "test-intent-1".to_string(),
            user_account: accounts(1).to_string(),
            action: "swap".to_string(),
            input_token: "USDC".to_string(),
            input_amount: 1000,
            output_token: "NEAR".to_string(),
            min_output_amount: Some(95),
            max_slippage: 0.5,
            deadline: None,
        };

        assert!(contract.verify_intent(intent));
        assert!(contract.is_intent_verified("test-intent-1".to_string()));
    }

    #[test]
    #[should_panic(expected = "Input amount must be greater than 0")]
    fn test_zero_amount_intent() {
        let mut context = VMContextBuilder::new();
        context.predecessor_account_id(accounts(1));
        testing_env!(context.build());

        let mut contract = Verifier::new(accounts(0));

        let intent = Intent {
            id: "test-intent-2".to_string(),
            user_account: accounts(1).to_string(),
            action: "swap".to_string(),
            input_token: "USDC".to_string(),
            input_amount: 0, // Zero amount should fail
            output_token: "NEAR".to_string(),
            min_output_amount: Some(95),
            max_slippage: 0.5,
            deadline: None,
        };

        contract.verify_intent(intent); // Should panic
    }
}
```

Similarly for the solver:

```rust
// In solver/src/lib.rs
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    #[test]
    fn test_solve_intent() {
        let mut context = VMContextBuilder::new();
        context.predecessor_account_id(accounts(0));
        testing_env!(context.build());

        let mut contract = Solver::new(accounts(0), 50); // 0.5% fee (50 basis points)

        let result = contract.solve_intent(
            "test-intent-1".to_string(),
            accounts(1),
            10000 // 10000 tokens
        );

        assert!(result.success);
        assert_eq!(result.intent_id, "test-intent-1");
        assert_eq!(result.fee_amount, 50); // 0.5% of 10000
        assert!(contract.has_executed("test-intent-1".to_string()));
    }

    #[test]
    fn test_fee_calculation() {
        let mut context = VMContextBuilder::new();
        context.predecessor_account_id(accounts(0));
        testing_env!(context.build());

        let mut contract = Solver::new(accounts(0), 200); // 2% fee

        let result = contract.solve_intent(
            "test-intent-2".to_string(),
            accounts(1),
            5000 // 5000 tokens
        );

        assert_eq!(result.fee_amount, 100); // 2% of 5000 = 100
    }
}
```

## Integration Testing

For integration testing, create scripts that test the complete flow:

1. Submit an intent to the verifier
2. Verify the intent is correctly registered
3. Pass the verified intent to a solver
4. Check the solver executes correctly
5. Validate the results match expectations

## Testing with NEAR CLI

You can also test your contracts directly on testnet:

```bash
# Submit intent to verifier
near call verifier.testnet verify_intent '{
  "intent": {
    "id": "test-1",
    "user_account": "your-account.testnet",
    "action": "swap",
    "input_token": "usdc.testnet",
    "input_amount": "1000000000", 
    "output_token": "wrap.testnet",
    "min_output_amount": "95000000",
    "max_slippage": 0.5,
    "deadline": null
  }
}' --accountId your-account.testnet

# Check intent status
near view verifier.testnet is_intent_verified '{"intent_id": "test-1"}'

# Execute with solver
near call solver.testnet solve_intent '{
  "intent_id": "test-1",
  "user": "your-account.testnet",
  "input_amount": "1000000000"
}' --accountId verifier.testnet
```

## Simulation Testing

For more comprehensive testing, you can use simulation:

1. Create test accounts with known balances
2. Submit intents with varying parameters
3. Execute across multiple solvers
4. Compare performance metrics
5. Test edge cases (slippage limits, deadlines, etc.)

## Debugging Tips

When testing intent systems:

1. Use detailed logging in your contracts
2. Track state changes at each step
3. Verify token balances before and after execution
4. Test with small amounts first
5. Use NEAR Explorer to track transaction execution

# Setting Up the Test Environment

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