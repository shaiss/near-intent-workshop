# Advanced Use Cases for Intent Architecture

This section explores real-world applications and implementation patterns for intent-centric architecture and smart wallet abstraction on NEAR.

## Use Case 1: Unified DeFi Access

### Intent Structure
```javascript
{
  "intent": {
    "action": "swap",
    "input": {
      "token": "USDC",
      "amount": "100",
      "slippage": "0.5%"
    },
    "output": {
      "token": "wNEAR",
      "preference": "best_rate"
    },
    "constraints": {
      "max_gas": "0.1 NEAR",
      "timeout": "5 minutes"
    }
  }
}
```

### Implementation Flow
1. User submits intent through NEAR Intents Manager
2. Solvers (Defuse, custom AMM agents) evaluate routes:
   - Ref Finance
   - Jumbo
   - Other DEX aggregators
3. Selected solver executes optimal swap path

### Live Examples
- [NEAR Intents App](https://intents.near.org)
- [Turbo Swap](https://turbo.near.org)
- [Dogecoin DEX](https://doge.near.org) (experimental)

## Use Case 2: Cross-Chain Token Swaps

### Intent Structure
```javascript
{
  "intent": {
    "action": "cross_chain_swap",
    "source": {
      "chain": "bitcoin",
      "token": "BTC",
      "amount": "0.1"
    },
    "destination": {
      "chain": "arbitrum",
      "token": "USDC"
    },
    "security": {
      "timeout": "30 minutes",
      "fallback": "refund"
    }
  }
}
```

### Key Components
- **Chain Signatures**: Enables 1-click cross-chain operations
- **OmniBridge**: Secure asset transfer infrastructure
- **Atomic Fulfillment**: Ensures transaction atomicity

### Implementation Guide
1. Set up Chain Signatures:
```javascript
const chainSignatures = new ChainSignatures({
  network: "mainnet",
  bridge: "omnibridge"
});

await chainSignatures.initialize();
```

2. Configure cross-chain intent:
```javascript
const crossChainIntent = {
  source: {
    chain: "bitcoin",
    token: "BTC",
    amount: "0.1"
  },
  destination: {
    chain: "arbitrum",
    token: "USDC"
  }
};

const signature = await chainSignatures.signIntent(crossChainIntent);
```

## Use Case 3: Wallet Abstraction and Session UX

### Session Key Implementation
```javascript
const sessionKey = {
  publicKey: "ed25519:...",
  allowance: [
    {
      receiverId: "v2.ref-finance.near",
      methodNames: ["ft_transfer", "ft_transfer_call"],
      allowance: "1000000000000000000000000"
    }
  ],
  maxGas: "300000000000000"
};

await wallet.requestSignIn({
  contractId: "v2.ref-finance.near",
  methodNames: ["ft_transfer", "ft_transfer_call"],
  allowance: "1000000000000000000000000"
});
```

### Meta-transaction Example
```javascript
const metaTransaction = {
  signerId: "user.near",
  receiverId: "v2.ref-finance.near",
  actions: [
    {
      type: "FunctionCall",
      params: {
        methodName: "ft_transfer",
        args: {
          receiver_id: "pool.near",
          amount: "1000000000000000000000000"
        },
        gas: "300000000000000",
        deposit: "0"
      }
    }
  ]
};

const result = await wallet.signAndSendTransaction(metaTransaction);
```

## Use Case 4: DAO + Smart Wallets + Intents

### Multisig Contract Implementation
```javascript
const multisigContract = {
  owners: ["dao.near", "treasury.near"],
  threshold: 2,
  intent: {
    action: "cross_chain_yield",
    steps: [
      {
        action: "deposit_collateral",
        chain: "ethereum",
        token: "ETH",
        amount: "10"
      },
      {
        action: "borrow",
        chain: "arbitrum",
        token: "USDC",
        amount: "15000"
      }
    ]
  }
};
```

### DAO Governance Integration
```javascript
const daoProposal = {
  proposal: {
    description: "Execute cross-chain yield strategy",
    kind: "FunctionCall",
    receiverId: "multisig.near",
    actions: [
      {
        methodName: "execute_intent",
        args: {
          intent: multisigContract.intent
        },
        deposit: "0",
        gas: "300000000000000"
      }
    ]
  }
};

await astroDao.submitProposal(daoProposal);
```

## Implementation Resources
- [Chain Signatures Documentation](https://docs.near.org/chain-signatures)
- [Meta Transactions Guide](https://docs.near.org/meta-transactions)
- [FastAuth Introduction](https://docs.near.org/fastauth)
- [Multichain DAO Tutorial](https://docs.near.org/dao-multichain)
