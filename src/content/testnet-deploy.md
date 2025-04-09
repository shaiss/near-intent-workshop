
# Deploy to Testnet

## Deploying Your Contracts to NEAR Testnet

After developing and testing your contracts locally, the next step is to deploy them to the NEAR testnet for further testing and integration.

## Prerequisites

Before deploying, make sure you have:

1. A NEAR testnet account
2. NEAR CLI installed
3. Your contracts compiled and ready for deployment

## Creating a Testnet Account

If you don't already have a testnet account, create one:

```bash
# Install NEAR CLI if you haven't already
npm install -g near-cli

# Create a new testnet account
near create-account YOUR_ACCOUNT_NAME.testnet --masterAccount testnet --initialBalance 10
```

## Building the Contract

Before deploying, make sure your contract is built:

```bash
# For Rust contracts
cd contract
cargo build --target wasm32-unknown-unknown --release
```

This will create a WebAssembly file at `target/wasm32-unknown-unknown/release/your_contract.wasm`.

## Deploying the Contract

Deploy your contract to the testnet using NEAR CLI:

```bash
# Deploy the verifier contract
near deploy --accountId verifier.YOUR_ACCOUNT_NAME.testnet --wasmFile target/wasm32-unknown-unknown/release/verifier.wasm --initFunction new --initArgs '{}'

# Deploy the solver contract
near deploy --accountId solver.YOUR_ACCOUNT_NAME.testnet --wasmFile target/wasm32-unknown-unknown/release/solver.wasm --initFunction new --initArgs '{}'
```

## Verifying the Deployment

After deployment, verify that your contract is working correctly:

```bash
# Check contract info
near state verifier.YOUR_ACCOUNT_NAME.testnet

# Call a view method
near view verifier.YOUR_ACCOUNT_NAME.testnet get_contract_info
```

## Initializing the Contract

After deployment, you may need to initialize your contract:

```bash
# Initialize the verifier
near call verifier.YOUR_ACCOUNT_NAME.testnet init_config '{
  "min_gas_for_verification": "20000000000000",
  "min_gas_for_execution": "50000000000000",
  "verification_fee": "1000000000000000000000"
}' --accountId YOUR_ACCOUNT_NAME.testnet

# Initialize the solver
near call solver.YOUR_ACCOUNT_NAME.testnet register_as_solver '{
  "verifier_id": "verifier.YOUR_ACCOUNT_NAME.testnet",
  "supported_intents": ["transfer", "swap"]
}' --accountId YOUR_ACCOUNT_NAME.testnet
```

## Deploying Connector Contracts

For cross-chain functionality, deploy connector contracts:

```bash
# Deploy Aurora connector
near deploy --accountId aurora_connector.YOUR_ACCOUNT_NAME.testnet --wasmFile target/wasm32-unknown-unknown/release/aurora_connector.wasm --initFunction new --initArgs '{"aurora_engine_id": "aurora"}'
```

## Updating the Frontend Configuration

After deploying the contracts, update your frontend configuration:

```javascript
// src/config.js
export const config = {
  networkId: 'testnet',
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  explorerUrl: 'https://explorer.testnet.near.org',
  contractIds: {
    verifier: 'verifier.YOUR_ACCOUNT_NAME.testnet',
    solver: 'solver.YOUR_ACCOUNT_NAME.testnet',
    auroraConnector: 'aurora_connector.YOUR_ACCOUNT_NAME.testnet',
  }
};
```

## Deploy the Frontend

For a complete testing environment, deploy your frontend application:

```bash
# Build the frontend
npm run build

# Use a service like Vercel, Netlify, or GitHub Pages to deploy the build folder
```

## Sample Deployment Script

Here's a full deployment script that automates these steps:

```bash
#!/bin/bash
set -e

# Configuration
ACCOUNT_ID="your_account_name.testnet"
VERIFIER_ID="verifier.$ACCOUNT_ID"
SOLVER_ID="solver.$ACCOUNT_ID"
AURORA_CONNECTOR_ID="aurora_connector.$ACCOUNT_ID"

# Build the contracts
echo "Building contracts..."
cd contract
cargo build --target wasm32-unknown-unknown --release
cd ..

# Create subaccounts if they don't exist
echo "Creating subaccounts..."
near create-account $VERIFIER_ID --masterAccount $ACCOUNT_ID --initialBalance 5
near create-account $SOLVER_ID --masterAccount $ACCOUNT_ID --initialBalance 5
near create-account $AURORA_CONNECTOR_ID --masterAccount $ACCOUNT_ID --initialBalance 5

# Deploy the contracts
echo "Deploying verifier contract..."
near deploy --accountId $VERIFIER_ID --wasmFile contract/target/wasm32-unknown-unknown/release/verifier.wasm --initFunction new --initArgs '{}'

echo "Deploying solver contract..."
near deploy --accountId $SOLVER_ID --wasmFile contract/target/wasm32-unknown-unknown/release/solver.wasm --initFunction new --initArgs '{}'

echo "Deploying Aurora connector contract..."
near deploy --accountId $AURORA_CONNECTOR_ID --wasmFile contract/target/wasm32-unknown-unknown/release/aurora_connector.wasm --initFunction new --initArgs '{"aurora_engine_id": "aurora"}'

# Initialize the contracts
echo "Initializing verifier contract..."
near call $VERIFIER_ID init_config '{
  "min_gas_for_verification": "20000000000000",
  "min_gas_for_execution": "50000000000000",
  "verification_fee": "1000000000000000000000"
}' --accountId $ACCOUNT_ID

echo "Registering solver with verifier..."
near call $SOLVER_ID register_as_solver '{
  "verifier_id": "'$VERIFIER_ID'",
  "supported_intents": ["transfer", "swap"]
}' --accountId $ACCOUNT_ID

echo "Connecting Aurora connector to verifier..."
near call $AURORA_CONNECTOR_ID set_verifier '{
  "verifier_id": "'$VERIFIER_ID'"
}' --accountId $ACCOUNT_ID

echo "Deployment completed successfully!"
```

In the next section, we'll explore how to test your deployed contracts using NEAR CLI.
