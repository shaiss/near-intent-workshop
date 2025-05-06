# Deploying to Testnet

**Time**: 10 minutes  
**Pre-requisite**: Use an existing testnet account


### 🚀 Upload Verifier

```bash
near deploy --accountId yourname.testnet --wasmFile ./verifier/target/wasm32-unknown-unknown/release/verifier.wasm
```

### 🧩 Upload Solver

```bash
near deploy --accountId solver.yourname.testnet --wasmFile ./solver/target/wasm32-unknown-unknown/release/solver.wasm
```

### 🧪 Test Call

```bash
near call yourname.testnet verify_intent '{"intent":{"action":"swap","input_token":"USDC","input_amount":100,"output_token":"wNEAR","max_slippage":0.5}}' --accountId yourname.testnet
```
