# 6.1: Deploying Your Intent Architecture to NEAR Testnet

**Estimated Time:** 30 minutes  
**Prerequisites:** Completed contracts from Module 3, frontend from Module 5
**Learning Objectives:**

- Deploy smart contracts to the NEAR testnet
- Configure your frontend to use deployed contracts
- Understand the differences between local and testnet environments

## Moving from Local Development to Testnet

So far, we've been developing and testing our intent-based system locally. While local development is great for rapid iteration and testing, to share your application with others and test it in a more realistic environment, we need to deploy to the NEAR testnet.

> 💡 **Web2 Analogy**: The NEAR testnet is like a staging environment in traditional web development. It mirrors the production environment (mainnet) but uses test tokens with no real-world value, allowing you to deploy and test your application in a realistic but consequence-free environment. Just as you might deploy a Web2 app to a staging server before production to verify everything works with real APIs and infrastructure, deploying to testnet lets you verify your dApp works with actual blockchain infrastructure before risking real assets on mainnet.

## Prerequisites for Deployment

Before we begin, ensure you have:

1. Your NEAR CLI installed and configured:

   ```bash
   # If you haven't installed NEAR CLI yet
   npm install -g near-cli
   ```

2. A testnet account (if you don't have one):

   ```bash
   # Create a new testnet account
   near login
   ```

3. The compiled WASM files for your Verifier and Solver contracts.

4. Your frontend code ready for configuration.

## From Local Development to Testnet: The Staging Environment of Web3

In traditional Web2 development, you typically move from local development to a staging environment before production. In Web3, the NEAR testnet serves this exact purpose - allowing you to test your application in a live blockchain environment that mimics mainnet without using real funds.

> 💡 **Web2 Parallel**: Deploying to NEAR testnet is like deploying your application to a staging server in AWS, Azure, or GCP. It lets you validate your application in an environment that closely resembles production.

## Prerequisites

Before deploying, ensure you have:

1. **A NEAR testnet account** - Create one at [wallet.testnet.near.org](https://wallet.testnet.near.org)
2. **NEAR CLI installed** - Run `npm install -g near-cli` if you haven't already
3. **Login to your testnet account** - Run `near login` and follow the prompts
4. **Your contracts compiled** - Ensure you've built your contracts from Module 3 with `cargo build --target wasm32-unknown-unknown --release`
5. **Some testnet NEAR tokens** - These cover deployment costs (get free tokens from the [NEAR Wallet](https://wallet.testnet.near.org))

## Creating Dedicated Subaccounts

Just as you might create separate services in Web2 architecture, in Web3 it's best practice to deploy different contracts to dedicated subaccounts:

```bash
near create-account verifier.yourname.testnet --masterAccount yourname.testnet
near create-account solver.yourname.testnet --masterAccount yourname.testnet
near create-account smart-wallet.yourname.testnet --masterAccount yourname.testnet
```

Your main account (`yourname.testnet`) funds these subaccounts, covering their initial storage costs - similar to how you might allocate resources to different microservices in a Web2 architecture.

## Deploying the Contracts

From your project root directory (where the `contracts` folder is located), deploy each contract:

### 1. Deploy the Verifier Contract

```bash
near deploy --accountId verifier.yourname.testnet \
  --wasmFile ./contracts/verifier/target/wasm32-unknown-unknown/release/verifier.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "yourname.testnet"}'
```

### 2. Deploy the Solver Contract

```bash
near deploy --accountId solver.yourname.testnet \
  --wasmFile ./contracts/solver/target/wasm32-unknown-unknown/release/solver.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "yourname.testnet", "execution_fee": 20}'
```

### 3. Deploy the Smart Wallet Contract from Module 4

```bash
near deploy --accountId smart-wallet.yourname.testnet \
  --wasmFile ./contracts/smart-wallet/target/wasm32-unknown-unknown/release/smart_wallet.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "yourname.testnet"}'
```

> 💡 **Note**: We're using a one-step deploy and initialize approach with the `--initFunction` and `--initArgs` flags. This ensures the contract is initialized atomically with deployment, similar to how you might set up a database schema during service deployment in Web2.

## Alternative Two-Step Deployment

If you prefer to see the deployment and initialization as separate steps (perhaps for better visibility into each process), you can use this approach instead:

```bash
# Deploy first
near deploy --accountId verifier.yourname.testnet \
  --wasmFile ./contracts/verifier/target/wasm32-unknown-unknown/release/verifier.wasm

# Then initialize
near call verifier.yourname.testnet new '{"owner_id": "yourname.testnet"}' --accountId yourname.testnet
```

## Verifying Successful Deployment

After deployment, verify your contracts are properly deployed and initialized:

```bash
# Check the Verifier contract
near view verifier.yourname.testnet get_owner_id '{}'

# Check the Solver contract
near view solver.yourname.testnet get_owner_id '{}'

# Check the Smart Wallet contract
near view smart-wallet.yourname.testnet get_owner_id '{}'
```

You should see your account ID returned by each command. You can also check the [NEAR Explorer](https://explorer.testnet.near.org) by searching for your contract accounts to see deployment transactions and contract activity.

## Common Deployment Issues and Solutions

| Issue                                 | Possible Cause                                   | Solution                                                              |
| ------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| `Account has insufficient funds`      | Not enough NEAR in your account                  | Get more testnet tokens from the faucet                               |
| `Cannot find file`                    | Incorrect path to WASM file                      | Verify you're in the project root and the build was successful        |
| `Cannot serialize arguments`          | Malformed JSON in `initArgs`                     | Check JSON syntax and ensure parameters match contract's `new` method |
| `Method new doesn't exist`            | Contract wasn't compiled with the correct method | Check your contract code and rebuild                                  |
| `The contract is already initialized` | Trying to initialize twice                       | Skip initialization or deploy to a new account                        |

## Updating Your Frontend Configuration

Now that your contracts are on testnet, update your frontend configuration from Module 5 to point to these deployed contracts:

```javascript
// In your frontend's near.js or similar config file
export const CONTRACT_ADDRESSES = {
  testnet: {
    verifierContract: "verifier.yourname.testnet",
    solverContract: "solver.yourname.testnet",
    smartWalletContract: "smart-wallet.yourname.testnet",
  },
  // ... other environments
};
```

## Next Steps

After deploying your contracts, you'll need to:

1. Test your frontend with these testnet contracts
2. Debug any cross-contract interactions using NEAR CLI and logging
3. Monitor your contracts' performance and state through transactions

In the next section, we'll explore how to use NEAR CLI to interact with your deployed contracts for efficient testing and debugging.
