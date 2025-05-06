
# NEAR Intents & Smart Wallet Abstraction Workshop

A hands-on workshop for building next-generation dApps with NEAR's intent-centric architecture

## Introduction & Setup

- [Welcome & Workshop Objectives](welcome.md)
- [Overview of NEAR Intents & Smart Wallet Abstraction](overview.md)
- [Prerequisites & Environment Setup](setup.md)
- [Repo Cloning & Folder Structure Overview](repo.md)

## Understanding the Building Blocks

- [What Are Intents? (Theory & Concept)](intents-concept.md)
- [Anatomy of a NEAR Intent](intent-anatomy.md)
- [What Is Smart Wallet Abstraction](smart-wallet.md)
- [Cross-chain UX and Account Abstraction Strategy](cross-chain.md)
- [Part 1 - Checkpoint](understanding_building_blocks.md)

## Building the Backend

- [Setting Up a Local Smart Contract](local-contract.md)
- [Writing an Intent Verifier](intent-verifier.md)
- [Writing the Solver Contract](solver-contract.md)
- [Connecting Verifier to Solver (Cross-Contract Calls)](cross-contract-calls.md)
- [Deploying to Testnet](deploy-to-testnet.md)
- [Testing Verifier → Solver Execution Locally](testing.md)
- [Gas, Fees & Incentives Model](gas-fees.md)

## Creating the Smart Wallet Experience

- [Creating a Session-based Smart Wallet](session-wallet.md)
- [Managing Keys & User Authentication](keys.md)
- [Abstraction of Actions](action-abstraction.md)
- [Testing Smart Wallet Integration](testing.md)

## Building the Frontend

- [Setting Up a Vite/Next.js Frontend](frontend-setup.md)
- [Connect Wallet & Display Intent Formsn](connect-wallet.md)
- [Submitting Intents from the UI](submit-intents.md)
- [Displaying Solver Options & Results]()
- [Executing an Intent Transaction from UI](execute-intent.md)

## Testnet Deployment & Debugging

- [Deploy Contracts to NEAR Testnet](testnet-deploy.md)
- [Testing with NEAR CLI]()
- [Debugging Intent Failures](debug-intents.md)
- [Simulating Solvers in Real Time](simulate-solvers.md)

## Going Beyond the Demo

- [Composability: Intents + DeFi + DAOs](composability.md)
- [Advanced Use Cases](advanced-use-cases.md)
- [Cross-chain Use Cases: How to Extend](cross-chain-use-cases.md)
- [Production Considerations (Security, Gas, User Safety)](production.md)
- [Future of Chain Abstraction on NEAR]()
