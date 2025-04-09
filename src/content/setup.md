
# Prerequisites & Environment Setup

## Required Software

To complete this workshop, you'll need the following software installed:

- Node.js (LTS version recommended)
- npm (usually comes with Node.js)
- Git
- Rust toolchain (if using Rust contracts)

## Installation Steps

### Node.js & npm

If you haven't installed Node.js and npm yet:

```bash
# Using nvm (Node Version Manager)
nvm install --lts
nvm use --lts

# Verify installation
node --version
npm --version
```

### NEAR CLI

The NEAR Command Line Interface is essential for interacting with the NEAR blockchain:

```bash
# Install globally
npm install -g near-cli

# Verify installation
near --version
```

### Rust Toolchain (for Rust contracts)

If you'll be working with Rust-based smart contracts:

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Verify installation
rustc --version
cargo --version
```

## NEAR Testnet Account

1. Visit [https://wallet.testnet.near.org](https://wallet.testnet.near.org)
2. Create a testnet account (e.g., `yourname.testnet`)
3. Save your recovery phrase or key file securely

## NEAR CLI Configuration

Configure the NEAR CLI to work with your testnet account:

```bash
near login
```

This will open a browser. Log in with your testnet account and authorize the CLI.

## Testing Your Setup

Verify that everything is working correctly:

```bash
# Check your account balance
near state yourname.testnet
```

## Environment Setup

1. Clone the workshop repository
2. Install dependencies
3. Configure the project for NEAR testnet

```bash
git clone https://github.com/near-examples/near-intents-example.git
cd near-intents-example
npm install
```

## Troubleshooting

If you encounter issues during setup:

- Make sure you're using the correct Node.js version
- Verify your NEAR account is properly configured
- Check your internet connection for CLI operations
- Consult the workshop GitHub repository for updated instructions

## Support Resources

If you get stuck, here are some helpful resources:
- NEAR Documentation: https://docs.near.org
- NEAR Discord community
- Stack Overflow with the "near-protocol" tag
