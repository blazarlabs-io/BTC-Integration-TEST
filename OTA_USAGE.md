# OTA (One-Time Address) Transaction Feature

## Overview

This feature allows you to automatically send tBTC to OTA addresses when they are received from the bridge API. The system detects OTA addresses (starting with 'tb1') and opens a modal for sending tBTC using the Unisat wallet.

## How It Works

### 1. Automatic Detection

When you create a bridge transaction and receive an OTA address in the response, the system automatically:

- Detects the OTA address (format: `tb1...`)
- Opens the OTA Transaction Modal
- Pre-fills the transaction details

### 2. OTA Transaction Modal

The modal displays:

- **From Address**: Your connected Unisat testnet wallet address
- **To OTA Address**: The received OTA address
- **Amount**: The amount of tBTC to send
- **Send Button**: Initiates the transaction

### 3. Transaction Process

When you click "Send tBTC to OTA":

1. Connects to your Unisat wallet
2. Switches to testnet network
3. Sends the specified amount to the OTA address
4. Returns the transaction hash
5. Provides a link to view the transaction on Blockstream testnet explorer

## Requirements

### Frontend Requirements

- Unisat wallet browser extension installed
- Connected to testnet network
- Sufficient tBTC balance in your wallet

### Backend Requirements

- Node.js server running on port 5000
- Bridge API accessible

## Usage

### Testing the Feature

1. Click the "Test OTA Modal" button to manually open the modal
2. This will pre-fill with a sample OTA address for testing
3. Connect your Unisat wallet and send a test transaction

### Production Usage

1. Create a bridge transaction normally
2. If an OTA address is returned, the modal will open automatically
3. Review the transaction details
4. Click "Send tBTC to OTA" to complete the transaction

## Error Handling

The system handles various error scenarios:

- Unisat wallet not installed
- Wrong network (not on testnet)
- Insufficient balance
- Transaction failures
- Network connectivity issues

## Transaction Details

### Fee Structure

- Network fee: ~0.000001 BTC
- Operation fee: ~0.000001 BTC
- Total fee: ~0.000002 BTC per transaction

### Confirmation

- Transactions are confirmed on the Bitcoin testnet
- Transaction hash is provided for verification
- Link to Blockstream testnet explorer included

## Security Features

- Address validation (must start with 'tb1')
- Network validation (ensures testnet)
- Wallet address verification
- Transaction amount validation

## Troubleshooting

### Common Issues

1. **"Unisat wallet is not installed"**

   - Install the Unisat wallet browser extension
   - Refresh the page

2. **"Connected wallet address doesn't match"**

   - Ensure you're connected with the correct wallet
   - Check that the wallet address matches your bridge transaction

3. **"Network error"**

   - Switch to testnet in Unisat wallet
   - Check your internet connection

4. **"Insufficient balance"**
   - Add more tBTC to your testnet wallet
   - Check your balance in Unisat wallet

### Support

For issues or questions, check the browser console for detailed error messages.
