
# Showcase of Advanced Use Cases

This section explores real-world applications for intent-centric architecture and smart wallet abstraction on NEAR.

## Use Case 1: Unified DeFi Access

**Intent Example**:  
"I want to swap my USDC for wNEAR at the best rate."

**What Happens**:
- Intent is submitted to NEAR Intents Manager
- Solvers (like Defuse or custom AMM agents) evaluate the best route (e.g., Ref Finance, Jumbo)
- The selected solver executes the swap—possibly across chains

**Live Demos / Examples**:
- NEAR Intents App
- Turbo Swap
- Dogecoin DEX (experimental)

## Use Case 2: Cross-Chain Token Swaps

**Intent Example**:  
"Swap 0.1 BTC on Bitcoin → USDC on Arbitrum"

**Key Concepts**:
- Intents + **Chain Signatures** = 1-click cross-chain swaps
- Uses NEAR's **OmniBridge** for secure asset transfer
- Atomic fulfillment avoids manual bridging

**Demo Resource**:
- Chain Signatures Documentation
- MoreMarkets — Cross-chain DeFi with native assets like XRP, BTC

## Use Case 3: Wallet Abstraction and Session UX

**Pattern**: Use **Function Call Access Keys** for gasless or delegated execution

**Intent Example**:  
"Stake 100 NEAR into my favorite validator"

**Key Abstraction Tools**:
- **Session Keys** with allowances
- **Meta-transactions** via NEP-366
- **FastAuth** onboarding with email login

**Try It**:
- Meta Transactions Guide
- FastAuth Introduction

## Use Case 4: DAO + Smart Wallets + Intents

**Scenario**:  
A DAO proposes a cross-chain yield strategy.

**Features**:
- DAO uses a **Multisig Contract Wallet**
- Signs an intent to deposit ETH collateral, borrow USDC
- All governed by votes on AstroDAO

**Multichain DAO Tutorial**:  
Building DAO-Controlled Accounts with Chain Signatures
