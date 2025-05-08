# Testing Your Intent System

**Time**: 20 minutes  
**Pre-requisite**: Understanding of the Verifier and Solver contracts from previous sections

## Why Testing Matters for Intent Systems

Testing is even more critical for intent-based systems than traditional Web2 applications because:

1. **Financial Impact**: Intent systems often handle user assets and funds
2. **Contract Interactions**: Multiple contracts interact in complex ways that are hard to debug after deployment
3. **Edge Cases**: Intent execution involves many potential edge cases that must be properly handled
4. **Competition Fairness**: Solver competition requires fair comparisons and predictable outcomes

> 💡 **Web2 Parallel**: Think of testing blockchain contracts like testing financial transaction systems or payment processors - thoroughness is essential because errors can directly impact users' funds.

## Testing Strategy for Intent Systems

We'll explore three levels of testing for our intent architecture:

1. **Unit Testing**: Testing individual contract methods in isolation
2. **Integration Testing**: Testing the interactions between contracts
3. **End-to-End Testing**: Testing the complete flow from intent submission to execution

Let's implement each of these approaches.

## Unit Testing With Rust

### Setting Up the Test Environment

Unit tests in Rust smart contracts use the built-in testing framework with special utilities from the NEAR SDK:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    // Helper function to set up a simulated blockchain environment
    // Similar to mocking a database or API in Web2 testing
    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))  // The contract account (like your API's hostname)
            .signer_account_id(predecessor_account_id.clone())  // Who signed the transaction
            .predecessor_account_id(predecessor_account_id)  // Who called the contract (like the API caller)
            .block_timestamp(100_000_000);    // Current blockchain timestamp
        builder
    }
}
```

### Unit Testing the Verifier Contract

```rust
#[test]
fn test_verify_valid_intent() {
    // Set up the simulated blockchain environment with accounts(1) as caller
    // accounts(0), accounts(1), etc. are test utility functions that generate test account IDs
    let context = get_context(accounts(1));
    testing_env!(context.build());

    // Create and initialize the contract
    let mut contract = Verifier::new(accounts(0));

    // Create a test intent
    let intent = Intent {
        id: "test-intent-1".to_string(),
        user_account: accounts(1).to_string(),  // Same as our caller
        action: "swap".to_string(),
        input_token: "USDC".to_string(),
        input_amount: 1000,
        output_token: "NEAR".to_string(),
        min_output_amount: Some(95),
        max_slippage: 0.5,
        deadline: Some(200_000_000),  // Later than our block_timestamp
    };

    // Verify that it passes validation
    assert!(contract.verify_intent(intent));
    assert!(contract.is_intent_verified("test-intent-1".to_string()));
}

#[test]
#[should_panic(expected = "Input amount must be greater than 0")]
fn test_zero_amount_intent() {
    let context = get_context(accounts(1));
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
        deadline: Some(200_000_000),
    };

    // This should panic with "Input amount must be greater than 0"
    contract.verify_intent(intent);
}
```

### Unit Testing the Solver Contract

```rust
#[test]
fn test_solve_intent() {
    let context = get_context(accounts(0));
    testing_env!(context.build());

    let mut contract = Solver::new(accounts(0), 50); // 0.5% fee (50 basis points)

    let result = contract.solve_intent(
        "test-intent-1".to_string(),
        accounts(1), // User account
        10000 // 10000 tokens
    );

    assert!(result.success);
    assert_eq!(result.intent_id, "test-intent-1");
    assert_eq!(result.fee_amount, 50); // 0.5% of 10000 = 50
    assert!(contract.has_executed("test-intent-1".to_string()));
}
```

> 💡 **Web2 Parallel**: This is similar to unit testing controllers or service objects in a Web2 backend, mocking out external dependencies.

## Command-Line Integration Testing

Once deployed, you can use NEAR CLI to perform integration tests from the command line:

```bash
# Step 1: Submit intent to verifier
near call verifier.testnet verify_intent '{
  "intent": {
    "id": "test-1",
    "user_account": "your-account.testnet",
    "action": "swap",
    "input_token": "usdc.testnet",
    "input_amount": 1000000000,
    "output_token": "wrap.testnet",
    "min_output_amount": 95000000,
    "max_slippage": 0.5,
    "deadline": null
  }
}' --accountId your-account.testnet

# Step 2: Check intent status
near view verifier.testnet is_intent_verified '{"intent_id": "test-1"}'

# Step 3: Execute with solver
near call solver.testnet solve_intent '{
  "intent_id": "test-1",
  "user": "your-account.testnet",
  "input_amount": 1000000000
}' --accountId verifier.testnet
```

> 💡 **Web2 Parallel**: This is like testing a REST API using curl or Postman, issuing commands and checking responses.

## JavaScript Integration Testing (near-api-js)

For more complex automated testing, you can use JavaScript with the `near-api-js` library. This is particularly useful for integration testing across contracts.

### Setting Up the JS Test Environment

First, create a test directory and install dependencies:

```bash
mkdir -p tests/integration
cd tests/integration
npm init -y
npm install near-api-js bn.js jest
```

Create a test configuration file:

```javascript
// config.js
const config = {
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  keyPath: "~/.near-credentials/testnet/YOUR_TEST_ACCOUNT.json", // Path to your test account key file
  networkId: "testnet",
  // Replace these with your actual deployed contract account IDs on testnet
  verifierContractId: "verifier.YOUR_ACCOUNT_ID.testnet",
  solverContractId: "solver.YOUR_ACCOUNT_ID.testnet",
  testUserAccountId: "YOUR_TEST_ACCOUNT.testnet", // The account ID corresponding to the keyPath
};

module.exports = config;
```

### Creating a NEAR Connection Helper

```javascript
// near-connection.js
const nearAPI = require("near-api-js");
const fs = require("fs");
const path = require("path");
const config = require("./config");

// Initialize connection to NEAR Testnet
async function initNEAR() {
  // The key file (e.g., YOUR_TEST_ACCOUNT.testnet.json) is typically generated when you run `near login`
  // and is stored in your `~/.near-credentials/testnet/` directory.
  // For testing, you might copy the relevant key file into your project or provide the correct path.
  // Ensure the `keyPath` in `config.js` points to a valid key file for `YOUR_TEST_ACCOUNT.testnet`.
  const keyFilePath = path.resolve(
    config.keyPath.replace("~", process.env.HOME)
  );
  const keyFile = JSON.parse(fs.readFileSync(keyFilePath));
  const keyStore = new nearAPI.keyStores.InMemoryKeyStore();

  // Add the key to the keystore
  await keyStore.setKey(
    config.networkId,
    config.testUserAccountId,
    nearAPI.utils.KeyPair.fromString(keyFile.private_key)
  );

  // Connect to NEAR
  const near = await nearAPI.connect({
    networkId: config.networkId,
    nodeUrl: config.nodeUrl,
    walletUrl: config.walletUrl,
    helperUrl: config.helperUrl,
    explorerUrl: config.explorerUrl,
    keyStore: keyStore,
  });

  // Get the account object
  const account = await near.account(config.testUserAccountId);

  // Return objects needed for testing
  return {
    near,
    account,
    // Create contract interfaces
    verifierContract: new nearAPI.Contract(account, config.verifierContractId, {
      viewMethods: ["is_intent_verified"],
      changeMethods: ["verify_intent", "verify_and_solve"],
    }),
    solverContract: new nearAPI.Contract(account, config.solverContractId, {
      viewMethods: ["has_executed"],
      changeMethods: ["solve_intent"],
    }),
  };
}

module.exports = { initNEAR };
```

> 💡 **Web2 Parallel**: This is similar to setting up a API client library with authentication in a Web2 test suite.

### Writing Integration Tests

```javascript
// intent-integration.test.js
const { initNEAR } = require("./near-connection");
const { v4: uuidv4 } = require("uuid");

describe("Intent System Integration Tests", () => {
  let testObjects;
  let intentId;

  beforeAll(async () => {
    testObjects = await initNEAR();
    intentId = `test-${uuidv4()}`;
  });

  test("should verify an intent", async () => {
    const { verifierContract } = testObjects;

    // Create a test intent
    const intent = {
      id: intentId,
      user_account: testObjects.account.accountId,
      action: "swap",
      input_token: "USDC",
      input_amount: 1000,
      output_token: "NEAR",
      min_output_amount: null,
      max_slippage: 0.5,
      deadline: null,
    };

    // Verify the intent
    const result = await verifierContract.verify_intent({
      intent: intent,
    });

    // Check if intent was verified
    const isVerified = await verifierContract.is_intent_verified({
      intent_id: intentId,
    });

    expect(result).toBe(true);
    expect(isVerified).toBe(true);
  });

  test("should execute a verified intent", async () => {
    const { verifierContract, solverContract } = testObjects;

    // Execute the intent
    await verifierContract.verify_and_solve(
      {
        intent: {
          id: intentId,
          user_account: testObjects.account.accountId,
          action: "swap",
          input_token: "USDC",
          input_amount: 1000,
          output_token: "NEAR",
          min_output_amount: null,
          max_slippage: 0.5,
          deadline: null,
        },
        solver_account: solverContract.contractId,
      },
      {
        gas: "300000000000000", // 300 TGas
      }
    );

    // Check if solver executed the intent
    console.log("Waiting for cross-contract call to complete...");
    // Waiting for a fixed duration can lead to flaky (if too short) or slow (if too long) tests.
    // A more robust approach for production tests would be to poll a view method
    // on the Solver contract (e.g., `solverContract.has_executed({ intent_id: testIntent.intent_id })`)
    // until the expected state is reached or a timeout occurs.
    await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

    const hasExecuted = await solverContract.has_executed({
      intent_id: intentId,
    });

    expect(hasExecuted).toBe(true);
  });
});
```

You can run these tests with Jest:

```bash
npx jest intent-integration.test.js
```

> 💡 **Web2 Parallel**: This is similar to integration testing of a Web2 microservice architecture where one service calls another.

## Advanced Testing Considerations

### Gas Usage Testing

In production systems, monitoring gas consumption is important:

```javascript
// Basic gas consumption measurement
async function measureGasUsage(txHash) {
  const provider = new nearAPI.providers.JsonRpcProvider({
    url: config.nodeUrl,
  });
  const txStatus = await provider.txStatus(txHash, config.testUserAccountId);

  // Calculate total gas burned
  const totalGasBurned = txStatus.receipts_outcome.reduce(
    (sum, receipt) => sum + parseInt(receipt.outcome.gas_burnt),
    0
  );

  console.log(`Transaction ${txHash} burned ${totalGasBurned} gas units`);
  return totalGasBurned;
}
```

### Simulating Solver Competition

For more complex scenarios like solver competition, you can set up multiple solver contracts and compare their results:

```javascript
async function testSolverCompetition(verifierContract, solvers, intent) {
  const results = [];

  // Submit the same intent to multiple solvers
  for (const solver of solvers) {
    const proposal = await solver.propose_solution({ intent });
    proposals.push({ solver_id: solver.contractId, proposal });
  }

  // 5. Select the best proposal (e.g., best output_amount for a swap)
  const bestProposal = proposals.sort(
    (a, b) => b.proposal.output_amount - a.proposal.output_amount
  )[0];

  // 6. Tell the Verifier to execute with the best solver
  // This might involve the Verifier calling the chosen Solver to execute, or the user/test directly.
  // The exact mechanism depends on the Verifier-Solver interaction design.
  // The actual Solver contract in `03-solver-contract.md` returns ExecutionResult directly from `solve_intent`.
  // For a cross-contract scenario, this result would typically come via a callback,
  // or a view method would be needed to query the state set by that callback.
  // const result = await bestProposal.solver.get_execution_result({ intent_id: intent.intent_id });
  // For this conceptual test, we might check a state variable on the Verifier or Solver
  // that is updated upon successful completion via a callback.
  const executionTx = await verifierContract.execute_with_solver({
    intent_id: intent.intent_id,
    solver_id: bestProposal.solver_id,
    solution_details: bestProposal.proposal, // Or just the necessary parts
  });

  // 7. Verify the final outcome on-chain
  // Note: The `get_execution_result` method is hypothetical for this example.
  // For this conceptual test, we might check a state variable on the Verifier or Solver
  // that is updated upon successful completion via a callback.
  const finalStatus = await verifierContract.get_intent_status({
    intent_id: intent.intent_id,
  });

  console.log(
    "Best proposal from:",
    bestProposal.solver_id,
    "Result:",
    finalStatus
  );
  expect(finalStatus.status).toContain("Completed"); // Or similar success indicator
}
```

## Debugging Tips

When testing intent systems, use these techniques for effective debugging:

1. **NEAR Explorer**: Look up transaction hashes to see detailed execution information

   - https://explorer.testnet.near.org/transactions/YOUR_TX_HASH

2. **Log Analysis**: Use verbose logging in your contracts with `env::log_str()` and check logs in transaction details

3. **Mock External Calls**: For unit tests, simulate the behavior of external contracts

4. **Step-by-Step Testing**: Test each component individually before testing the full integration

5. **Transaction Tracing**: For complex issues, enable transaction tracing at the RPC level

## Summary

Testing intent systems requires a comprehensive approach:

1. **Unit Tests**: Verify individual contract methods and logic
2. **CLI Testing**: Quick integration testing using NEAR CLI
3. **JavaScript Integration Tests**: Automated testing of the full intent flow
4. **Performance Testing**: Measure gas consumption and execution costs
5. **Competition Simulation**: Test multiple solver scenarios if applicable

By implementing tests at each of these levels, you'll build a robust and reliable intent system that safely handles user assets and provides predictable execution.
