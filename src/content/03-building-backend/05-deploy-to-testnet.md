# Deploying to Testnet

**Time**: 15 minutes  
**Pre-requisite**: NEAR testnet account (from [Module 1 Setup](mdc:../01-introduction/03-setup.md))

In this section, we'll deploy our Verifier and Solver contracts to NEAR testnet. This is similar to deploying backend services to a staging environment in Web2 development, where you test your application in a production-like setting before going live.

## Preparing Your Testnet Accounts

You'll need two NEAR accounts for deployment:

1. **Your main testnet account** (e.g., `yourname.testnet`) which will own both contracts
2. **A sub-account for the Solver** (e.g., `solver.yourname.testnet`)

### Creating a Sub-account for the Solver

If you haven't created a sub-account yet, run:

```bash
near create-account solver.yourname.testnet --masterAccount yourname.testnet --initialBalance 5
```

This is similar to creating a new resource group or namespace in AWS/Azure for a specialized service.

## Deploying the Contracts

Navigate to your project root directory where the `contracts` folder is located:

```bash
cd path/to/your/project
```

### 🚀 Deploy the Verifier Contract

```bash
near deploy --accountId yourname.testnet \
  --wasmFile ./contracts/verifier/target/wasm32-unknown-unknown/release/verifier.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "yourname.testnet"}'
```

> 💡 **Web2 Parallel**: This is similar to deploying a validation service to your staging environment and initializing it with configuration parameters.

### 🧩 Deploy the Solver Contract

```bash
near deploy --accountId solver.yourname.testnet \
  --wasmFile ./contracts/solver/target/wasm32-unknown-unknown/release/solver.wasm \
  --initFunction new \
  --initArgs '{"owner_id": "yourname.testnet", "execution_fee": 20}'
```

The `execution_fee` is set to 20 basis points (0.2%), which is comparable to a transaction fee in a payment processing service.

## Verifying Deployment

After deployment, you can check your accounts on NEAR Explorer:

- https://explorer.testnet.near.org/accounts/yourname.testnet
- https://explorer.testnet.near.org/accounts/solver.yourname.testnet

You should see your contract code and storage usage has increased.

## Testing Your Deployed Contracts

### 🧪 Test the Verifier Contract

```bash
near call verifier.yourname.testnet verify_intent '{
  "intent": {
    "id": "test-intent-1",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 100,
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  }
}' --accountId yourname.testnet
```

If successful, you should see output indicating the intent was verified.

### 🔄 Test the Complete Intent Flow

To test the full flow from verification to execution:

```bash
near call verifier.yourname.testnet verify_and_solve '{
  "intent": {
    "id": "test-intent-2",
    "user_account": "yourname.testnet",
    "action": "swap",
    "input_token": "USDC",
    "input_amount": 100,
    "output_token": "wNEAR",
    "min_output_amount": null,
    "max_slippage": 0.5,
    "deadline": null
  },
  "solver_account": "solver.yourname.testnet"
}' --accountId yourname.testnet --gas 300000000000000
```

> 💡 **Web2 Parallel**: This is like testing an API endpoint that triggers a workflow across multiple microservices.

The `--gas` parameter ensures enough computational resources are allocated for the cross-contract calls, similar to setting timeout or resource limits in a Web2 environment.

## Checking Intent Status

To verify if an intent has been processed:

```bash
near view verifier.yourname.testnet is_intent_verified '{"intent_id": "test-intent-2"}'
```

And to check if the solver executed it:

```bash
near view solver.yourname.testnet has_executed '{"intent_id": "test-intent-2"}'
```

## Troubleshooting

If your deployment or contract calls fail, check:

1. **Account balance**: Ensure your accounts have enough NEAR for deployment and contract calls
2. **Contract size**: Large contracts may need more gas for deployment
3. **Parameter format**: Ensure JSON parameters match exactly what the contract expects
4. **Transaction logs**: Check NEAR Explorer for detailed error messages

In the next section, we'll learn how to implement comprehensive testing for our intent system.
