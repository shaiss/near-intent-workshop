# 8.1: Resources for Further Learning

**Estimated Time:** 15 minutes  
**Prerequisites:** Completed all previous workshop modules 1-7
**Learning Objectives:**

- Identify key resources for deepening your knowledge of intent-centric architecture
- Find module-specific documentation to extend your implementation
- Connect with the NEAR developer community for ongoing support
- Discover real-world applications of the concepts you've learned

## Introduction

Congratulations on reaching the final module of the workshop! Throughout this journey, you've built a functional intent-based system from the ground up - from understanding the core concepts to implementing smart contracts, creating smart wallet abstractions, building a frontend, and deploying to the NEAR testnet.

As mentioned at the end of Module 7, the intent-centric architecture represents a significant evolution in blockchain development. To support your continued learning and application of these concepts, we've curated a collection of resources organized by topic and relevance to what you've built.

## Workshop Implementation Resources

These resources directly relate to the concepts and code we built throughout this workshop:

| Resource                                                                                 | Relevance to Workshop                                               | Difficulty   |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------ |
| [NEAR Intent Architecture Guide](https://docs.near.org/tutorials/intents/introduction)   | Provides a deep dive into the intent concepts from Module 2         | Beginner     |
| [NEAR SDK for Smart Contracts](https://docs.near.org/tools/sdk)                          | The foundation for the Rust contracts we built in Module 3          | Intermediate |
| [NEAR Examples Repository](https://github.com/near-examples)                             | Collection of example NEAR applications and contracts               | Beginner     |
| [NEAR API JS Documentation](https://docs.near.org/tools/near-api-js/quick-reference)     | The JavaScript library we used for frontend integration in Module 5 | Intermediate |
| [Session Keys Documentation](https://docs.near.org/concepts/basics/accounts/access-keys) | Expanded explanation of the session keys concepts from Module 4     | Intermediate |

## Module-Specific Resources

### Intent Architecture (Modules 2-3)

| Resource                                                                                  | Description                                                 | Difficulty   |
| ----------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------ |
| [NEAR Intents Overview](https://near.org/intents)                                         | Official overview of NEAR's intent architecture             | Beginner     |
| [NEAR Intents Agent Example](https://github.com/near-examples/near-intents-agent-example) | Example implementation of intent-based agent                | Intermediate |
| [NEAR Rust SDK Reference](https://docs.rs/near-sdk/latest/near_sdk/)                      | Technical details about SDK features for building contracts | Intermediate |

### Smart Wallet Experience (Module 4)

| Resource                                                                                | Description                                                    | Difficulty   |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------ |
| [Access Keys Documentation](https://docs.near.org/concepts/basics/accounts/access-keys) | Guide to the session key functionality we implemented          | Intermediate |
| [FastAuth Integration](https://docs.near.org/tools/fastauth)                            | Authentication solution that builds on the session key concept | Intermediate |
| [Smart Wallet Security](https://docs.near.org/concepts/basics/accounts/security)        | Best practices for securing your smart wallet implementation   | Advanced     |

### Frontend Development (Module 5)

| Resource                                                           | Description                                                 | Difficulty   |
| ------------------------------------------------------------------ | ----------------------------------------------------------- | ------------ |
| [NEAR Wallet Selector](https://github.com/near/wallet-selector)    | The wallet connection library we used in our frontend       | Beginner     |
| [NEAR Components](https://github.com/near/components)              | Ready-to-use React components for NEAR applications         | Beginner     |
| [BOS Widget Examples](https://docs.near.org/bos/tutorial/todo-app) | Component examples using NEAR's Blockchain Operating System | Intermediate |

### Testnet Deployment (Module 6)

| Resource                                                                    | Description                                               | Difficulty |
| --------------------------------------------------------------------------- | --------------------------------------------------------- | ---------- |
| [NEAR CLI Reference](https://docs.near.org/tools/near-cli)                  | Complete guide to the CLI commands we used for deployment | Beginner   |
| [Contract Testing Guide](https://docs.near.org/sdk/rust/testing/unit-tests) | Advanced techniques for testing and gas optimization      | Advanced   |
| [Testnet Explorer](https://explorer.testnet.near.org/)                      | Tool to view deployed contracts and transactions          | Beginner   |

## Advanced Concepts (Module 7)

| Resource                                                                       | Description                                                               | Difficulty |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ---------- |
| [NEAR <> Ethereum Bridge](https://rainbowbridge.app/transfer)                  | Bridge for cross-chain functionality discussed in Module 7.3              | Advanced   |
| [NEAR Chain Abstraction](https://docs.near.org/build/chain-abstraction)        | Details on the cross-chain technology                                     | Advanced   |
| [Meta Transactions Guide](https://docs.near.org/tutorials/basic/gas-economics) | Implementation guide for the gasless transactions discussed in Module 7.2 | Advanced   |
| [DAO Integration](https://docs.near.org/build/dapps/dao)                       | Resources for the DAO integration patterns from Module 7.2                | Advanced   |

## Real-World Implementations

These projects implement the concepts we covered in real production environments:

| Project                                | Description                              | Relation to Workshop                            |
| -------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| [NEAR Wallet](https://wallet.near.org) | The official NEAR wallet                 | Showcases wallet integration from Module 5      |
| [Ref Finance](https://app.ref.finance) | DeFi platform using intent-based swaps   | Implementation of DeFi concepts from Module 7.2 |
| [I Am Human](https://i-am-human.app)   | Identity verification using SBTs         | Example of advanced NEAR contracts              |
| [NEAR Social](https://near.social)     | Social platform with integrated identity | Cross-chain concepts from Module 7.3            |

## Community & Support

Get help, share your projects, and connect with other intent developers:

- [NEAR Developer Discord](https://near.chat): Join the #intents-and-abstractions channel
- [NEAR Developer Forum](https://gov.near.org/c/dev/6): Post questions and share your implementations
- [NEAR Workshops Calendar](https://near.org/events): Find upcoming live workshops and events
- [Stack Overflow](https://stackoverflow.com/questions/tagged/nearprotocol): Find answers to technical questions

## Open Source Contributions

Ready to contribute to the ecosystem? These projects actively welcome contributions:

- [NEAR SDK JS](https://github.com/near/near-sdk-js): Help improve the JavaScript SDK
- [NEAR SDK RS](https://github.com/near/near-sdk-rs): Contribute to the Rust SDK used in this workshop
- [NEAR Wallet Selector](https://github.com/near/wallet-selector): Enhance wallet connection UX
- [NEAR Documentation](https://github.com/near/docs): Contribute to improving the documentation

---

The resources above provide pathways to deepen your understanding of the concepts we covered in this workshop and extend your implementation with additional features. We encourage you to experiment with the code you've built and adapt it to your specific use cases.

## Next Steps

In the [next section (8.2: What's Next)](mdc:./02-whats-next.md), we'll explore specific project ideas and extensions you can build on top of your workshop implementation to enhance your skills and create more sophisticated intent-based applications.
