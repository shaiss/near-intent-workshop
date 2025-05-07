# 1.1: Welcome to the Future of dApp Development!

**Estimated Time:** 15 minutes
**Prerequisites:** Basic JavaScript knowledge, familiarity with web development
**Learning Objectives:**

- Understand the purpose and structure of this workshop
- Identify the key problems intent-centric architecture solves
- Recognize how smart wallet abstraction enhances user experience

Welcome to the "NEAR Intents & Smart Wallet Abstraction" workshop! If you're a developer familiar with building web applications (Web2) and curious about the next wave of decentralized applications (dApps), you're in the right place.

Traditional dApps often present users with complex interactions, like managing cryptographic keys manually or signing transactions with confusing details. This workshop will guide you through building "next-generation" dApps on the NEAR blockchain that offer a much smoother user experience (UX), akin to the seamless web applications you're used to. We'll achieve this using an innovative approach called **Intent-Centric Architecture**.

## What is Intent-Centric Architecture?

Imagine users clearly stating _what they want to achieve_ (their "intent"), without needing to understand or execute the complex, multi-step processes involved. For instance, instead of manually swapping tokens through multiple transactions, a user might simply express an intent like "I want to trade X amount of Token A for Token B."

This architecture allows us to build systems that understand these high-level user goals and then figure out the "how" on their behalf. It's like using a high-level, declarative API in the Web2 world, where you specify the desired outcome, and the system handles the underlying complexities, as opposed to making many low-level, imperative calls.

To make this happen, we'll explore:

- **Smart Wallet Abstractions**: Current Web3 applications often require users to directly manage cryptographic keys and approve transactions that can be hard to understand. "Smart Wallets," enhanced with "abstractions," aim to hide this complexity. Think of them as a layer that simplifies interactions, offering a user experience closer to familiar Web2 applications, like one-click checkouts or automated recurring payments.
- **Verifiers and Solvers**: These are two key components in our intent-centric model.
  - **Verifiers** check if a user's stated intent is valid, secure, and feasible.
  - **Solvers** then figure out the best way to carry out that valid intent on the NEAR network and execute it.
- **Cross-Chain Features**: Modern web applications often interact with various external services. Similarly, "cross-chain" features allow applications to interact with different blockchain networks. We'll touch upon how our intent architecture can simplify building these multi-network interactions.

## Workshop Objectives & Key Goals

### What You'll Learn

- Understanding the fundamentals of Intent-Centric Architecture and its benefits.
- Building Smart Wallet Abstractions to create user-friendly Web3 experiences.
- Creating the core components: Verifiers and Solvers for handling NEAR intents.
- Exploring how intent architecture can be applied to cross-chain features.
- Discussing production best practices and advanced techniques for robust dApps.

### Key Goals

By the end of this workshop, you will have:

- Built a minimal working demonstration where users can express their intents.
- Implemented a system to execute these intents via a smart wallet on the NEAR testnet.
- Gained practical, hands-on experience with NEAR's intent architecture.
- Understood how to significantly improve Web3 UX through layers of abstraction.

## A Note for Web2 Developers: Our Learning Strategy

As a Web2 developer, you'll encounter several new concepts. This is exciting, but it can also feel like a lot at once! We recommend the following approach:

1.  **Focus on the "Why":** Initially, concentrate on understanding the _problems_ these new Web3 tools and architectures (like intents and smart wallets) are designed to solve, especially regarding user experience.
2.  **Embrace Analogies:** We'll use Web2 analogies to bridge the gap. Try to connect new concepts to familiar paradigms.
3.  **Clarity Through Practice:** Don't worry if not every detail clicks immediately. The concepts will become much clearer as you start building and implementing them in the hands-on sections.
4.  **Iterative Understanding:** We'll build complexity gradually. Each module builds upon the last.

## Prerequisites

Before starting, you should have:

- Basic knowledge of JavaScript or TypeScript.
- Familiarity with a frontend framework like React (though deep expertise isn't required).
- A foundational understanding of basic blockchain concepts. This means knowing what a blockchain is, the idea of a decentralized ledger, and what a transaction generally signifies. (If you're very new to these, a quick online primer on "Web3 basics for Web2 developers" might be helpful.)
- Node.js and npm (or yarn) installed on your system.
- A NEAR testnet account. Think of this as a staging or development environment for the blockchain – it allows you to deploy and test your applications without using real money. We'll help you set this up in the an upcoming section!

## Workshop Structure

The workshop is divided into several main sections:

1.  **Introduction & Setup**: (You are here!) Getting acquainted with the goals, concepts, and setting up your environment.
2.  **Understanding the Building Blocks**: Diving deeper into the core components of our architecture.
3.  **Building the Backend**: Developing the smart contracts for Verifiers and Solvers.
4.  **Creating the Smart Wallet Experience**: Implementing the user-facing wallet abstractions.
5.  **Building the Frontend**: Connecting our backend to a user interface.
6.  **Testnet Deployment & Beyond**: Deploying, testing, and looking at advanced topics.

Each section builds on the previous ones, taking you from foundational concepts to a complete, working implementation.

## Summary

In this introduction, we've covered the workshop's goals, introduced the core concepts of intent-centric architecture and smart wallet abstraction, and outlined the learning approach best suited for Web2 developers entering the Web3 space. We've also previewed the workshop structure and set expectations for what you'll accomplish.

## Next Steps

In the [next section (1.2: NEAR Overview)](mdc:./02-overview.md), we'll explore the core concepts behind NEAR blockchain and intent-based architecture in more detail, establishing the foundation for the hands-on development work to come.
