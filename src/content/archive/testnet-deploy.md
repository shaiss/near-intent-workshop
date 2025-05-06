# Deploy to Testnet

## Overview

In this section, you'll learn how to deploy your intent verifier and solver contracts to the NEAR testnet. This will allow you to test your implementation in a real-world environment before moving to production.

## Prerequisites

Before starting the deployment process, make sure you have:

1. A NEAR testnet account
2. NEAR CLI installed on your machine
3. Your contracts compiled and ready for deployment

## Creating Dedicated Subaccounts (Recommended)

For better organization, it's recommended to create separate subaccounts for your verifier and solver contracts:

```bash
near create-account verifier.yourname.testnet --masterAccount yourname.testnet
near create-account solver.yourname.testnet --masterAccount yourname.testnet
```

This separation makes it easier to manage permissions and keeps your contract architecture clean.

## Deploying the Verifier Contract

Once your subaccounts are ready, deploy the verifier contract:

```bash
near deploy --accountId verifier.yourname.testnet \
  --wasmFile ./contracts/verifier/target/wasm32-unknown-unknown/release/verifier.wasm
```

The deployment process will output a transaction hash. You can use this hash to check the status of your deployment on the NEAR Explorer.

## Deploying the Solver Contract

Similarly, deploy the solver contract:

```bash
near deploy --accountId solver.yourname.testnet \
  --wasmFile ./contracts/solver/target/wasm32-unknown-unknown/release/solver.wasm
```

## Initializing Your Contracts (If Required)

Some contracts require initialization after deployment. If your contracts have an `init` or `new` method, you'll need to call it:

```bash
near call verifier.yourname.testnet new '{"owner_id": "yourname.testnet"}' --accountId yourname.testnet

near call solver.yourname.testnet new '{"verifier_account": "verifier.yourname.testnet"}' --accountId yourname.testnet
```

## Verifying Successful Deployment

To verify that your contracts were deployed successfully, you can query their state:

```bash
near view-state verifier.yourname.testnet --finality final
near view-state solver.yourname.testnet --finality final
```

You can also check the NEAR Explorer (https://explorer.testnet.near.org) to see your contracts and their transactions.

## Next Steps

Once your contracts are deployed, you'll need to:

1. Update your frontend configuration to point to these testnet contracts
2. Test your intent verification and solving process in this environment
3. Debug any issues that arise

In the next section, we'll explore how to interact with your deployed contracts using NEAR CLI.