# Unisat Wallet Integration Guide

## Overview

This guide explains how to use Unisat wallet to send tBTC transactions in the application.

## Prerequisites

1. Install Unisat wallet extension from [unisat.io](https://unisat.io/)
2. Create a testnet wallet account
3. Get some testnet tBTC from a faucet

## Setup Steps

### 1. Install Unisat Wallet

- Go to [unisat.io](https://unisat.io/)
- Download and install the browser extension
- Create a new wallet or import existing one

### 2. Switch to Testnet

- Open Unisat wallet
- Click on the network selector (usually shows "Mainnet")
- Select "Testnet"
- Confirm the network switch

### 3. Get Testnet tBTC

- Use a Bitcoin testnet faucet to get tBTC
- Recommended faucets:
  - [Blockstream Testnet Faucet](https://blockstream.info/testnet/faucet)
  - [Coinfaucet](https://coinfaucet.eu/en/btc-testnet/)

## Using the Application

### 1. Connect Wallet

- Open the application
- Click "Connect Wallet" or similar button
- Select Unisat wallet when prompted
- Approve the connection in the wallet popup

### 2. Send tBTC Transaction

- Fill in the OTA address
- Enter the amount (minimum 0.00001 tBTC)
- Click "Send Transaction"
- Review the transaction details in the wallet popup
- Confirm the transaction

## Troubleshooting

### Common Issues

#### 1. "User rejected the request" Error

**Cause**: The wallet is showing 0.00000000 tBTC instead of the intended amount
**Solution**:

- ✅ **FIXED**: The application now uses proper BTC-to-satoshi conversion
- Ensure you're on testnet network
- Check that the amount is properly formatted
- Try refreshing the page and reconnecting the wallet

#### 2. "Insufficient balance" Error

**Cause**: Not enough tBTC in the wallet
**Solution**:

- Get more tBTC from a testnet faucet
- Wait for transactions to confirm
- Check the balance in Unisat wallet

#### 3. "Invalid amount" Error

**Cause**: Amount is too small or improperly formatted
**Solution**:

- Use amounts >= 0.00001 tBTC
- Ensure the amount is a valid number
- Check for any formatting issues

#### 4. Network Mismatch

**Cause**: Wallet is on mainnet instead of testnet
**Solution**:

- Switch Unisat wallet to testnet
- Refresh the application
- Reconnect the wallet

### Debug Steps

1. **Check Console Logs**

   - Open browser developer tools (F12)
   - Look for error messages in the console
   - Check the transaction details being sent

2. **Verify Wallet Connection**

   - Ensure Unisat is installed and unlocked
   - Check that the correct account is connected
   - Verify the network is set to testnet

3. **Test with Small Amounts**
   - Start with 0.0001 tBTC
   - Gradually increase the amount
   - Monitor for any errors

## Technical Details

### Amount Formatting

The application now uses a proven BTC-to-satoshi conversion function that avoids floating-point precision issues:

```javascript
// ✅ Correct approach (proven to work)
const btcToSats = (btcString) => {
  if (typeof btcString !== "string") {
    btcString = String(btcString);
  }
  const [whole = "0", fraction = ""] = btcString.split(".");
  const fractionPadded = (fraction + "00000000").slice(0, 8); // pad / truncate
  return Number(BigInt(whole) * 100000000n + BigInt(fractionPadded));
};

const satoshis = btcToSats("0.0006"); // Returns 60000
await window.unisat.sendBitcoin(address, satoshis, options);

// ❌ Problematic approach (causes precision loss)
const satoshis = Math.round(0.0006 * 100000000); // May lose precision
```

### Transaction Options

```javascript
const options = {
  feeRate: 5, // 5 sat/vB for reliable testnet transactions
  memo: `OTA Transfer: ${Date.now()}`,
};
```

### Error Handling

The application includes comprehensive error handling for:

- User rejection (code 4001)
- Insufficient balance (code -32603)
- Invalid amounts
- Network issues

## Best Practices

1. **Always test on testnet first**
2. **Use reasonable amounts** (0.0001 - 0.01 tBTC for testing)
3. **Check balance before sending**
4. **Verify transaction details** in the wallet popup
5. **Keep the wallet unlocked** during transactions
6. **Monitor transaction status** on testnet block explorer

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify wallet connection and network settings
3. Try refreshing the page and reconnecting
4. Test with different amounts
5. Ensure you have sufficient testnet tBTC balance

## ✅ Success Confirmation

The transaction hash `15a6161c4c7ced73a7932870e1b85fc51d72ca446aa3e14796e19be6b1b95461` confirms that the fix is working correctly:

- **Input**: 0.00135931 BTC from sender
- **Output 1**: 0.0006 BTC to OTA address ✅
- **Output 2**: 0.0 BTC Null Data (memo)
- **Output 3**: 0.00075699 BTC change back to sender
- **Status**: 6+ confirmations on testnet

The application now successfully sends tBTC transactions using the correct satoshi-based approach.
