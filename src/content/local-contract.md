
# Local Smart Contract

## Setting Up Your Development Environment

Before creating our smart contract, let's make sure our development environment is properly configured.

```bash
# Install required tools
npm install -g near-cli
```

## Creating a Basic NEAR Contract

We'll start by creating a simple smart contract to understand the basics.

```rust
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, near_bindgen};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Contract {
    greeting: String,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            greeting: "Hello".to_string(),
        }
    }
}

#[near_bindgen]
impl Contract {
    pub fn get_greeting(&self) -> String {
        self.greeting.clone()
    }
    
    pub fn set_greeting(&mut self, greeting: String) {
        self.greeting = greeting;
    }
}
```

## Compiling the Contract

To compile the contract, we'll use the NEAR development tools:

```bash
cargo build --target wasm32-unknown-unknown --release
```

## Testing the Contract Locally

We can test our contract using NEAR's simulation testing:

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    #[test]
    fn test_get_greeting() {
        let contract = Contract {
            greeting: "Hello".to_string(),
        };
        assert_eq!(contract.get_greeting(), "Hello");
    }

    #[test]
    fn test_set_greeting() {
        let mut contract = Contract {
            greeting: "Hello".to_string(),
        };
        contract.set_greeting("Howdy".to_string());
        assert_eq!(contract.get_greeting(), "Howdy");
    }
}
```

## Preparing for Intent Integration

Now that we have a basic contract, we'll modify it to work with intents in the next section.
