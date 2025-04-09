const workshopStructure = {
  title: "NEAR Intents & Smart Wallet Abstraction",
  description: "Learn how to build intent-centric dApps with smart wallet abstraction on NEAR",
  parts: [
    {
      id: 0,
      title: "Introduction & Setup",
      description: "Overview of the workshop and setting up your development environment",
      sections: [
        { id: 1, title: "Welcome & Objectives", slug: "welcome" },
        { id: 2, title: "Overview of NEAR Intents", slug: "overview" },
        { id: 3, title: "Prerequisites & Setup", slug: "setup" },
        { id: 4, title: "Repo Cloning", slug: "repo" }
      ]
    },
    {
      id: 1,
      title: "Understanding the Building Blocks",
      description: "Learn about the key concepts of intents and smart wallet abstraction",
      sections: [
        { id: 1, title: "What Are Intents?", slug: "intents-concept" },
        { id: 2, title: "Anatomy of a NEAR Intent", slug: "intent-anatomy" },
        { id: 3, title: "Smart Wallet Abstraction", slug: "smart-wallet" },
        { id: 4, title: "Cross-chain UX", slug: "cross-chain" }
      ]
    },
    {
      id: 2,
      title: "Building the Backend",
      description: "Develop the smart contracts for intent verification and solving",
      sections: [
        { id: 1, title: "Local Smart Contract", slug: "local-contract" },
        { id: 2, title: "Intent Verifier", slug: "intent-verifier" },
        { id: 3, title: "Solver Contract", slug: "solver-contract" },
        { id: 4, title: "Testing Execution", slug: "testing" },
        { id: 5, title: "Gas & Fees Model", slug: "gas-fees" }
      ]
    },
    {
      id: 3,
      title: "Creating the Smart Wallet Experience",
      description: "Build wallet abstraction and session management for a seamless UX",
      sections: [
        { id: 1, title: "Wallet Selector", slug: "wallet-selector" },
        { id: 2, title: "Session-based Smart Wallet", slug: "session-wallet" },
        { id: 3, title: "Managing Keys", slug: "keys" },
        { id: 4, title: "Abstraction of Actions", slug: "action-abstraction" }
      ]
    },
    {
      id: 4,
      title: "Building the Frontend",
      description: "Create an intuitive user interface for working with intents",
      sections: [
        { id: 1, title: "Setting Up Frontend", slug: "frontend-setup" },
        { id: 2, title: "Connect Wallet", slug: "connect-wallet" },
        { id: 3, title: "Submitting Intents", slug: "submit-intents" },
        { id: 4, title: "Solver Options", slug: "solver-options" },
        { id: 5, title: "Executing Intent", slug: "execute-intent" }
      ]
    },
    {
      id: 5,
      title: "Testnet Deployment & Debugging",
      description: "Deploy your contracts to NEAR testnet and learn debugging techniques",
      sections: [
        { id: 1, title: "Deploy to Testnet", slug: "testnet-deploy" },
        { id: 2, title: "Testing with NEAR CLI", slug: "near-cli" },
        { id: 3, title: "Debugging Intents", slug: "debug-intents" },
        { id: 4, title: "Simulating Solvers", slug: "simulate-solvers" }
      ]
    },
    {
      id: 6,
      title: "Going Beyond the Demo",
      description: "Advanced concepts and future possibilities with intent-based architecture",
      sections: [
        { id: 1, title: "Composability", slug: "composability" },
        { id: 2, title: "Cross-chain Use Cases", slug: "cross-chain-use-cases" },
        { id: 3, title: "Production Considerations", slug: "production" },
        { id: 4, title: "Future of Chain Abstraction", slug: "future" }
      ]
    }
  ]
};

export { workshopStructure };
export default workshopStructure;