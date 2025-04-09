
# Repository Structure

## Cloning the Workshop Repository

To follow along with this workshop, you'll need to clone the workshop repository to your local machine.

```bash
git clone https://github.com/near-examples/near-intents-example.git
cd near-intents-example
```

## Project Structure

The repository is organized as follows:

```
/workshop-root
  /contracts         # Contains Verifier and Solver smart contracts
  /frontend          # React/Next UI for expressing and fulfilling intents
  /wallet            # Smart wallet abstraction logic
  /scripts           # Deployment and simulation scripts
  near.config.js     # Testnet config
```

## Key Components

### `/contracts`

Contains the smart contract code for:
- Intent Verifier: Validates that intents are properly formed and constraints are met
- Solver Contract: Implements the logic to fulfill intents

### `/frontend`

The user interface for:
- Creating and submitting intents
- Connecting to wallets
- Monitoring intent execution

### `/wallet`

Smart wallet abstraction implementation:
- Session key management
- Transaction batching
- Account abstraction

### `/scripts`

Utility scripts for:
- Deploying contracts to testnet
- Testing intent execution
- Simulating solver behavior

## Installation

After cloning the repository, install the dependencies:

```bash
npm install
```

## Initial Setup

Ensure your environment is properly configured:

1. Make sure you have a NEAR testnet account
2. Configure NEAR CLI with your account
3. Check that the development environment is working

```bash
# Test the development environment
npm run dev
```

## Workshop Files

Throughout the workshop, we'll be working with specific files:

- Verifier contract implementation
- Solver contract implementation
- Frontend components for intent creation
- Smart wallet integration code

## Troubleshooting

If you encounter issues with the repository:

1. Make sure all dependencies are installed
2. Check that you're using the correct branch
3. Verify your NEAR account is properly set up
4. Refer to the workshop GitHub issues for common problems
