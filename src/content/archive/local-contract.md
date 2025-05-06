# Local Smart Contract Development

## Understanding Smart Contracts in Intent Architecture

Smart contracts form the backbone of the intent verification and execution system. In this section, we'll set up two critical components:

1. **Verifier Contract**: Validates user intents and ensures they meet requirements
2. **Solver Contract**: Executes the verified intents to achieve the desired outcome

## Setting Up Your Rust Development Environment

For NEAR smart contracts, we'll use Rust as our programming language. Make sure you have Rust and Cargo installed:

```bash
cd contracts
cargo new --lib verifier --vcs none
cd verifier
```

## Configuring Your First Contract

Update your `Cargo.toml` with the necessary dependencies:

```toml
[package]
name = "verifier"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
near-sdk = "4.0.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
```

## Writing the Verifier Contract

Create a basic intent verification contract in `src/lib.rs`:

```rust
use near_sdk::{env, near_bindgen, serde::{Deserialize, Serialize}};

#[near_bindgen]
#[derive(Default)]
pub struct Verifier {}

#[derive(Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Intent {
    pub action: String,
    pub input_token: String,
    pub input_amount: u128,
    pub output_token: String,
    pub max_slippage: f64,
}

#[near_bindgen]
impl Verifier {
    pub fn verify_intent(&self, intent: Intent) -> bool {
        // placeholder logic
        env::log_str(&format!("Verifying intent: {:?}", intent.action));
        true
    }
}
```

## Building the Contract

Compile your contract to WebAssembly:

```bash
cargo build --target wasm32-unknown-unknown --release
```

This produces a `.wasm` file in the `target/wasm32-unknown-unknown/release/` directory that can be deployed to the NEAR blockchain.

## Next Steps

Once your basic verifier is set up, we'll move on to:
1. Implementing more sophisticated verification logic
2. Building a solver contract that can fulfill intents
3. Connecting these components together

In the next section, we'll develop the intent verifier with more comprehensive validation logic.