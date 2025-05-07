# 1.4: Exploring the Workshop Codebase Structure

**Estimated Time:** 20 minutes
**Prerequisites:** Completed environment setup from section 1.3
**Learning Objectives:**

- Understand the overall organization of the workshop codebase
- Identify the purpose of each major directory
- Recognize how different components work together in an intent-based system

Now that you've successfully set up your development environment as detailed in the [previous section (1.3 Environment Setup)](mdc:./03-setup.md), let's explore how the workshop's codebase is organized. Understanding this structure will help you navigate the project as we build out our intent-based application.

If you haven't yet cloned the repository and installed its initial dependencies, please refer back to the "Workshop Project Setup" steps in [1.3 Environment Setup](mdc:./03-setup.md) before proceeding.

## Project Folder Overview

Once you `cd` into the cloned workshop repository (e.g., `near-intents-example`), you'll find the following primary directories and files. This structure separates concerns, making the project more manageable.

```plaintext
/near-intents-example
  ├── contracts/         # Smart contracts (Verifier, Solver)
  ├── frontend/          # User Interface (React/Next.js application)
  ├── wallet/            # Smart Wallet abstraction logic
  ├── scripts/           # Deployment, testing, and simulation scripts
  ├── near.config.js     # Configuration for NEAR Testnet interactions
  ├── package.json       # Project dependencies and scripts
  └── README.md          # Project overview and instructions
```

Let's break down each key part:

### `contracts/`

This directory houses the backend logic that runs on the NEAR blockchain, written in Rust (as discussed in the setup). These are our core smart contracts for the intent architecture we learned about in the [overview (1.2)](mdc:./02-overview.md).

- **Purpose**: Contains the Verifier and Solver smart contracts.
  - The **Verifier contract** (e.g., `contracts/verifier/src/lib.rs`) acts as a gatekeeper. It validates that user-submitted intents are properly formed, meet predefined security constraints, and are generally acceptable before any action is taken.
  - The **Solver contract(s)** (e.g., `contracts/solver_xyz/src/lib.rs`) implement the specific logic to fulfill validated intents. There might be different solvers for different types of intents or strategies.
- **Web2 Analogy**: Think of these as your core backend API services, but instead of running on a traditional server, they run directly on the decentralized NEAR network.

### `frontend/`

This is where the user-facing part of our application lives. It's a standard web application, likely built with a framework like React or Next.js, that users will interact with to create and monitor their intents.

- **Purpose**: Provides the User Interface (UI) for:
  - Connecting to a NEAR wallet.
  - Allowing users to express their intents (e.g., through forms).
  - Submitting these intents to the Verifier contract.
  - Displaying the status and outcome of their intents.
- **Key Files (Examples)**: `frontend/pages/index.js`, `frontend/components/IntentForm.js`, `frontend/services/nearService.js`.
- **Web2 Analogy**: This is directly comparable to any modern web application frontend you might build.

### `wallet/`

This directory contains crucial logic for the **Smart Wallet Abstractions** we discussed in the overview. Its primary goal is to significantly improve the user experience by abstracting away many of the typical Web3 complexities.

- **Purpose**: Implements features that make blockchain interactions smoother and more like Web2 applications. This includes:
  - **Session Key Management** (e.g., `wallet/sessionManager.js`): In traditional Web3, users often sign every single transaction. Session keys allow a user to grant temporary, limited permissions to the dApp (e.g., for a specific period or for certain types of actions), much like logging into a website and having a session that keeps you logged in. This avoids constant pop-ups for transaction approval.
  - **Transaction Batching**: If fulfilling an intent requires multiple on-chain operations, this logic can bundle them into a single transaction that the user approves once. This is more efficient and user-friendly.
  - **Account Abstraction Concepts**: While full account abstraction is a broad topic, code here might explore ways to simplify account interactions, potentially paving the way for more familiar login methods or easier account recovery in the future.
- **Web2 Analogy**: This directory aims to provide UX features analogous to robust session management, one-click checkouts (via batching), and simplified account handling seen in mature Web2 platforms.

### `scripts/`

These are helper scripts, typically run from the command line, to automate common development and deployment tasks.

- **Purpose**: Contains utility scripts for:
  - Deploying your smart contracts (from `contracts/`) to the NEAR testnet.
  - Running tests against your contracts and intent execution flows.
  - Simulating Solver behavior or other off-chain processes locally.
- **Key Files (Examples)**: `scripts/deploy.js`, `scripts/testIntent.js`.
- **Web2 Analogy**: Similar to build scripts, deployment pipelines (CI/CD scripts), or testing utilities you'd use in any software project.

### `near.config.js`

This JavaScript file holds configuration settings specifically for how your project interacts with the NEAR network, particularly the testnet.

- **Purpose**: Defines parameters like:
  - NEAR testnet network URLs.
  - Default contract account IDs to be used during development and deployment by your scripts.
  - Potentially, paths to WASM files for deployment.
- **Web2 Analogy**: Like a `config.json` or `.env` file that stores environment-specific settings for your application, such as API endpoints or database connection strings.

### `package.json`

This is the standard Node.js project manifest file.

- **Purpose**: Lists project dependencies (libraries used), and defines useful command-line scripts (e.g., `npm run dev`, `npm test`, `npm run deploy`).
- **Web2 Analogy**: Identical to its use in any Node.js-based web project.

## Navigating the Code During the Workshop

As we progress through the workshop modules:

- We'll start by examining and building the **smart contracts** in the `contracts/` directory.
- Then, we'll explore how the **smart wallet abstractions** in `wallet/` simplify user interactions.
- Next, we'll build out the **frontend** in `frontend/` to allow users to create and submit intents.
- We'll use the **scripts** in `scripts/` throughout to deploy and test our work.

Understanding this structure provides a map for our journey. You now know where to look for specific types of code and how the different parts of the intent-based application are designed to fit together.

## Summary

In this introduction section, we've covered:

1. The workshop's goals and approach to building modern dApps
2. The core concepts of intents and smart wallet abstraction
3. Setting up your development environment with all necessary tools
4. The structure of our project and how components interact

These fundamentals will be essential as we now explore each building block in greater detail. The code organization we've reviewed reflects the intent-centric architecture - with separate components for contracts that verify and solve intents, wallet abstractions that improve user experience, and frontend interfaces that make the system accessible.

## Next Steps

In the [next module: Understanding Building Blocks](mdc:../02-understanding-building-blocks/01-intents-concept.md), we'll dive deeper into the theoretical and practical aspects of each component in our intent-based system. We'll start by exploring intents in much greater detail - understanding what makes them powerful and how they're structured.
