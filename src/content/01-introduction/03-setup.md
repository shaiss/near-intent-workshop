# 1.3: Setting Up Your Developer Environment

Now that we've explored the key concepts behind NEAR's Intent-Centric architecture (as discussed in the [previous section](mdc:./02-overview.md)), it's time to roll up our sleeves and prepare your local development environment. This setup is crucial for building, testing, and deploying the components like Verifiers, Solvers, and Smart Wallets that bring intents to life.

## Core Software Requirements

First, let's ensure you have the basic software that most web and blockchain development relies on.

### 1. Node.js and npm

Node.js is a JavaScript runtime, and npm is its package manager. We'll use these for managing project dependencies and running various scripts.

- **Installation**: If you don't have them, we recommend using `nvm` (Node Version Manager) to install the latest LTS (Long-Term Support) version.
  ```bash
  # Install nvm (if you don't have it - see nvm docs for specific OS instructions)
  # Then, install and use the LTS version of Node.js:
  nvm install --lts
  nvm use --lts
  ```
- **Verification**:
  ```bash
  node --version
  npm --version
  ```
  You should see version numbers outputted for both.

### 2. Git

Git is a version control system essential for downloading the workshop project files and managing code changes.

- **Installation**: Most operating systems come with Git. If not, download it from [git-scm.com](https://git-scm.com/downloads).
- **Verification**:
  ```bash
  git --version
  ```

## NEAR-Specific Tooling

Next, we'll install tools specifically for interacting with the NEAR blockchain.

### 3. NEAR Command Line Interface (CLI)

The NEAR CLI is your command center for the NEAR network. It allows you to deploy smart contracts, call their functions, manage your testnet accounts, check network status, and much more, directly from your terminal.

- **Installation**:
  ```bash
  npm install -g near-cli
  ```
- **Verification**:
  ```bash
  near --version
  ```
  > **Troubleshooting**: If your terminal says `near: command not found`, ensure that the global npm binaries directory is in your system's PATH. You might need to restart your terminal session after installation.

## Smart Contract Development Tools (Rust)

In this workshop, the core backend components (like Verifiers and Solver logic intended for smart contracts) are built using **Rust**. Rust is a powerful language chosen for its performance, security features, and strong support for WebAssembly (WASM), making it ideal for blockchain development on NEAR.

### 4. Rust Toolchain

- **Why Rust & WASM?** NEAR smart contracts are compiled into WebAssembly (WASM) bytecode. WASM is a portable binary instruction format that allows contracts to run efficiently and securely on the NEAR blockchain, regardless of the original source language (though Rust and AssemblyScript are most common).
- **Installation**:

  ```bash
  # Install Rustup (the Rust toolchain installer)
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  # Follow the on-screen instructions. If prompted, choose the default installation.
  # Ensure your PATH is configured, usually by running: source $HOME/.cargo/env (or restarting your terminal)
  ```

  (For alternative installation methods or more details, visit the [official Rust installation page](https://www.rust-lang.org/tools/install).)

- **Add WASM Target**: After installing Rust, you need to add the specific compilation target for NEAR smart contracts:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
  This tells the Rust compiler to produce a WASM file compatible with the NEAR runtime.
- **Verification**:
  ```bash
  rustc --version
  cargo --version
  ```

## Setting Up Your NEAR Testnet Account

To deploy and interact with smart contracts on NEAR without spending real money, you'll need a **testnet account**. Think of the testnet as a full-featured staging or development environment for the NEAR blockchain.

1.  **Create Account**: Visit the [NEAR Wallet for Testnet](https://wallet.testnet.near.org).
2.  Click "Create Account" and follow the instructions to choose an account ID (e.g., `yourname.testnet`).
3.  **SECURE YOUR RECOVERY PHRASE!** You will be given a 12-word recovery phrase.
    - **Critical**: **Treat your testnet recovery phrase with the same care as a password for an important online service.** Write it down, store it offline, and keep it private. While testnet assets have no real-world monetary value, losing access to your testnet account means you'll lose any deployed contracts or state associated with it, and you'll have to start over with a new account for this workshop.

## Workshop Project Setup

With all the tools and your testnet account ready, let's get the workshop code.

1.  **Clone the Repository**:

    ```bash
    git clone https://github.com/near-examples/near-intents-example.git
    cd near-intents-example
    ```

    (Note: This URL is an example; use the specific URL provided for this workshop.)

2.  **Install Project Dependencies**:
    ```bash
    npm install
    ```
    This installs the libraries and packages defined in the project's `package.json` file.

## Configuring NEAR CLI with Your Testnet Account

Now, let's connect your NEAR CLI to the testnet account you just created.

```bash
near login
```

This command will open a web browser and ask you to authorize the NEAR CLI to use your testnet account. Select the account you created and approve the connection.

- **What does this do?** Authorizing the CLI allows it to perform actions on the NEAR testnet _on your behalf_ using the credentials securely stored locally. This includes deploying contracts, calling methods, and managing account keys for development purposes. It's similar to an OAuth flow where you grant an application permission to access your data on a web service.

## Testing Your Full Setup

Let's verify that your NEAR CLI is correctly configured and can communicate with your testnet account.

Replace `yourname.testnet` with your actual testnet account ID:

```bash
near state yourname.testnet
```

- **Expected Output**: You should see a JSON object detailing your account's current state, such as its balance (it might have a small amount of NEAR if automatically funded by the testnet wallet), code hash (if any contract is deployed), and storage usage. If you see an error like "Account ID #yourname.testnet does not exist", double-check the account ID and ensure the `near login` process was completed successfully.

## Troubleshooting Tips

- **`command not found` errors**: Usually means the tool wasn't installed correctly or its installation directory isn't in your system's PATH. Restart your terminal. For `near-cli` specifically, check npm global path configuration.
- **Node.js version issues**: Some projects require specific Node.js versions. `nvm` helps manage this easily.
- **NEAR CLI login issues**: Ensure pop-ups aren't blocked for the NEAR Wallet website during `near login`.
- **Internet Connection**: CLI operations often need an active internet connection.
- **Workshop Repository Issues**: Check the workshop's GitHub repository (`README.md` or `ISSUES` tab) for specific setup troubleshooting or updates.

## Support Resources

If you get stuck:

- NEAR Official Documentation: [https://docs.near.org](https://docs.near.org)
- NEAR Discord Community: [https://near.chat](https://near.chat) (Look for channels like `#developer-support` or workshop-specific channels if mentioned).
- Stack Overflow: Use the `nearprotocol` tag.

With your environment ready, you're all set to explore the structure of the workshop codebase in the next section. This foundation will allow you to start building and interacting with the intent-based components we've discussed!
