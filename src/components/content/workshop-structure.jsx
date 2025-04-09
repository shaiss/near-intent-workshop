
import React from 'react';
import { Link } from 'react-router-dom';

export const WorkshopStructure = () => {
  const sections = [
    {
      title: "Introduction & Setup",
      items: [
        { title: "Welcome & Objectives", path: "/workshop/welcome" },
        { title: "Overview of NEAR Intents", path: "/workshop/overview" },
        { title: "Prerequisites & Setup", path: "/workshop/setup" },
        { title: "Repo Cloning", path: "/workshop/repo" },
      ]
    },
    {
      title: "Understanding the Building Blocks",
      items: [
        { title: "What Are Intents?", path: "/workshop/intents-concept" },
        { title: "Anatomy of a NEAR Intent", path: "/workshop/intent-anatomy" },
        { title: "Smart Wallet Abstraction", path: "/workshop/smart-wallet" },
        { title: "Cross-chain UX", path: "/workshop/cross-chain" },
      ]
    },
    {
      title: "Building the Backend",
      items: [
        { title: "Local Smart Contract", path: "/workshop/local-contract" },
        { title: "Intent Verifier", path: "/workshop/intent-verifier" },
        { title: "Solver Contract", path: "/workshop/solver-contract" },
        { title: "Testing Execution", path: "/workshop/testing" },
        { title: "Gas & Fees Model", path: "/workshop/gas-fees" },
      ]
    },
    {
      title: "Creating the Smart Wallet Experience",
      items: [
        { title: "Wallet Selector", path: "/workshop/wallet-selector" },
        { title: "Session-based Smart Wallet", path: "/workshop/session-wallet" },
        { title: "Managing Keys", path: "/workshop/keys" },
        { title: "Abstraction of Actions", path: "/workshop/action-abstraction" },
      ]
    },
    {
      title: "Building the Frontend",
      items: [
        { title: "Setting Up Frontend", path: "/workshop/frontend-setup" },
        { title: "Connect Wallet", path: "/workshop/connect-wallet" },
        { title: "Submitting Intents", path: "/workshop/submit-intents" },
        { title: "Solver Options", path: "/workshop/solver-options" },
        { title: "Executing Intent", path: "/workshop/execute-intent" },
      ]
    },
    {
      title: "Testnet Deployment & Debugging",
      items: [
        { title: "Deploy to Testnet", path: "/workshop/testnet-deploy" },
        { title: "Testing with NEAR CLI", path: "/workshop/near-cli" },
        { title: "Debugging Intents", path: "/workshop/debug-intents" },
        { title: "Simulating Solvers", path: "/workshop/simulate-solvers" },
      ]
    },
    {
      title: "Going Beyond the Demo",
      items: [
        { title: "Composability", path: "/workshop/composability" },
        { title: "Cross-chain Use Cases", path: "/workshop/cross-chain-use-cases" },
        { title: "Production Considerations", path: "/workshop/production" },
        { title: "Future of Chain Abstraction", path: "/workshop/future" },
      ]
    },
  ];

  return (
    <div className="py-4">
      {sections.map((section, index) => (
        <div key={index} className="mb-6">
          <h3 className="font-bold text-lg mb-2">{section.title}</h3>
          <ul className="space-y-1">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex}>
                <Link to={item.path} className="text-blue-500 hover:underline">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default WorkshopStructure;
