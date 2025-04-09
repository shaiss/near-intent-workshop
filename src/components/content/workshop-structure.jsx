
import React from 'react';

export const workshopStructure = {
  title: "NEAR Intents & Smart Wallet Abstraction Workshop",
  description: "A comprehensive workshop to build intent-centric applications on NEAR",
  parts: [
    {
      id: 1,
      title: "Introduction & Setup",
      sections: [
        { id: 1, title: "Welcome", slug: "welcome" },
        { id: 2, title: "Overview", slug: "overview" },
        { id: 3, title: "Environment Setup", slug: "setup" },
        { id: 4, title: "Repository Structure", slug: "repo" }
      ]
    },
    {
      id: 2,
      title: "Understanding the Building Blocks",
      sections: [
        { id: 1, title: "Intent-Centric Architecture", slug: "intents-concept" },
        { id: 2, title: "Anatomy of an Intent", slug: "intent-anatomy" },
        { id: 3, title: "Smart Wallet Fundamentals", slug: "smart-wallet" },
        { id: 4, title: "Cross-chain Capabilities", slug: "cross-chain" }
      ]
    },
    {
      id: 3,
      title: "Building the Backend",
      sections: [
        { id: 1, title: "Local Contract Development", slug: "local-contract" },
        { id: 2, title: "Intent Verifier Implementation", slug: "intent-verifier" },
        { id: 3, title: "Solver Contract Development", slug: "solver-contract" },
        { id: 4, title: "Testing Your Contracts", slug: "testing" },
        { id: 5, title: "Gas Fees & Optimization", slug: "gas-fees" }
      ]
    },
    {
      id: 4,
      title: "Creating the Smart Wallet Experience",
      sections: [
        { id: 1, title: "NEAR Wallet Selector", slug: "wallet-selector" },
        { id: 2, title: "Session-Based Wallet", slug: "session-wallet" },
        { id: 3, title: "Managing Keys & Permissions", slug: "keys" },
        { id: 4, title: "Abstracting Complex Actions", slug: "action-abstraction" }
      ]
    },
    {
      id: 5,
      title: "Building the Frontend",
      sections: [
        { id: 1, title: "Frontend Setup", slug: "frontend-setup" },
        { id: 2, title: "Connecting Wallets", slug: "connect-wallet" },
        { id: 3, title: "Submitting Intents", slug: "submit-intents" },
        { id: 4, title: "Solver Options", slug: "solver-options" },
        { id: 5, title: "Executing Intents", slug: "execute-intent" }
      ]
    },
    {
      id: 6,
      title: "Testnet Deployment & Debugging",
      sections: [
        { id: 1, title: "Deploying to Testnet", slug: "testnet-deploy" },
        { id: 2, title: "Using NEAR CLI", slug: "near-cli" },
        { id: 3, title: "Debugging Intents", slug: "debug-intents" },
        { id: 4, title: "Simulating Solvers", slug: "simulate-solvers" }
      ]
    },
    {
      id: 7,
      title: "Advanced Topics",
      sections: [
        { id: 1, title: "Intent Composability", slug: "composability" },
        { id: 2, title: "Cross-chain Use Cases", slug: "cross-chain-use-cases" },
        { id: 3, title: "Future Directions", slug: "future" },
        { id: 4, title: "Production Considerations", slug: "production" }
      ]
    }
  ]
};

export default function WorkshopStructure() {
  return (
    <div>
      <h1>{workshopStructure.title}</h1>
      <p>{workshopStructure.description}</p>
    </div>
  );
}
