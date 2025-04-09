
import React from 'react';

export const workshopStructure = {
  title: "NEAR Intents & Smart Wallet Abstraction Workshop",
  description: "A hands-on workshop for building next-generation dApps with NEAR's intent-centric architecture",
  parts: [
    {
      id: 0,
      title: "Introduction & Setup",
      sections: [
        { id: 1, title: "Welcome & Workshop Objectives", slug: "welcome" },
        { id: 2, title: "Overview of NEAR Intents & Smart Wallet Abstraction", slug: "overview" },
        { id: 3, title: "Environment Setup", slug: "setup" },
        { id: 4, title: "Repository Structure", slug: "repo" }
      ]
    },
    {
      id: 1,
      title: "Understanding the Building Blocks",
      sections: [
        { id: 1, title: "What Are Intents? (Theory & Concept)", slug: "intents-concept" },
        { id: 2, title: "Anatomy of a NEAR Intent", slug: "intent-anatomy" },
        { id: 3, title: "Smart Wallet Fundamentals", slug: "smart-wallet" },
        { id: 4, title: "Cross-chain Capabilities", slug: "cross-chain" },
        { id: 5, title: "Composability in Intent Systems", slug: "composability" }
      ]
    },
    {
      id: 2,
      title: "Building the Backend",
      sections: [
        { id: 1, title: "Local Smart Contract Development", slug: "local-contract" },
        { id: 2, title: "Intent Verifier Implementation", slug: "intent-verifier" },
        { id: 3, title: "Solver Contract Development", slug: "solver-contract" },
        { id: 4, title: "Testing Your Contracts", slug: "testing" },
        { id: 5, title: "Gas Fees & Optimization", slug: "gas-fees" }
      ]
    },
    {
      id: 3,
      title: "Creating the Smart Wallet Experience",
      sections: [
        { id: 1, title: "Local Contract Development", slug: "local-contract" },
        { id: 2, title: "Intent Verifier Implementation", slug: "intent-verifier" },
        { id: 3, title: "Solver Contract Development", slug: "solver-contract" },
        { id: 4, title: "Testing Your Contracts", slug: "testing" }
      ]
    },
    {
      id: 4,
      title: "Building the Frontend",
      sections: [
        { id: 1, title: "Frontend Setup", slug: "frontend-setup" },
        { id: 2, title: "Connect Wallet Integration", slug: "connect-wallet" },
        { id: 3, title: "Submit Intents UI", slug: "submit-intents" },
        { id: 4, title: "Execute Intent Flow", slug: "execute-intent" }
      ]
    },
    {
      id: 5,
      title: "Testnet Deployment & Debugging",
      sections: [
        { id: 1, title: "Deploying to NEAR Testnet", slug: "testnet-deploy" },
        { id: 2, title: "Debugging Intents", slug: "debug-intents" },
        { id: 3, title: "Simulate Solver Competition", slug: "simulate-solvers" }
      ]
    },
    {
      id: 6,
      title: "Going Beyond the Demo",
      sections: [
        { id: 1, title: "Advanced Use Cases", slug: "advanced-use-cases" },
        { id: 2, title: "Cross-chain Applications", slug: "cross-chain-use-cases" },
        { id: 3, title: "Production Best Practices", slug: "production" }
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
