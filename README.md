# Solana SPL Token Transfer

This project provides a simple way to transfer SPL tokens on the Solana blockchain using TypeScript. It utilizes the Solana Web3.js library and the SPL Token library to facilitate token transfers between wallets.

## Table of Contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Error Handling](#error-handling)
- [License](#license)

## Features

- Transfer SPL tokens between wallets on the Solana blockchain.
- Supports both mainnet and devnet environments.
- Handles token account creation if it does not exist.
- Provides detailed logging for transaction status.

## Requirements

- Node.js (version 14 or higher)
- npm (Node package manager)
- A Solana wallet with some SOL for transaction fees.
- SPL tokens to transfer.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/solana-spl-token-transfer.git
   cd solana-spl-token-transfer
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your wallet private key and receiver public key:
   ```plaintext
   SENDER_WALLET_PRIVATE_KEY=your_sender_wallet_private_key
   RECEIVER_WALLET_PUBLIC_KEY=your_receiver_wallet_public_key
   ```

## Configuration

You can configure the network type by modifying the `network` parameter in the `transferSplToken` function call in `src/index.ts`. The available options are:

- `"mainnet"`: For the main Solana network.
- `"devnet"`: For the development network.

## Usage

To execute a token transfer, run the following command:
```bash
npm start
```

This will initiate the transfer of the specified amount of SPL tokens from the sender's wallet to the receiver's wallet.

## Error Handling

If you encounter errors during the transaction, the following common issues may arise:

- **Insufficient SOL balance**: Ensure that your sender wallet has enough SOL to cover transaction fees.
- **Incorrect program ID**: This error indicates that the token program ID is incorrect. Ensure that you are using the correct SPL token program.

For detailed error logs, check the console output after running the transfer command.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
