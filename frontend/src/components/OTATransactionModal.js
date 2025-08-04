import React, { useState, useEffect } from "react";
import "./OTATransactionModal.css";

const OTATransactionModal = ({
  isOpen,
  onClose,
  otaAddress,
  amount,
  fromAddress,
  onTransactionComplete,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");
  const [unisatAvailable, setUnisatAvailable] = useState(false);

  useEffect(() => {
    // Check if Unisat wallet is available
    if (typeof window.unisat !== "undefined") {
      setUnisatAvailable(true);
    } else {
      setError(
        "Unisat wallet is not installed. Please install Unisat wallet extension."
      );
    }
  }, []);

  const handleSendTransaction = async () => {
    if (!unisatAvailable) {
      setError("Unisat wallet is not available");
      return;
    }

    setIsLoading(true);
    setError("");

    let amountValue;
    let network;

    try {
      // Connect to Unisat wallet
      const accounts = await window.unisat.requestAccounts();
      const currentAccount = accounts[0];

      console.log("Connected account:", currentAccount);
      console.log("Expected address:", fromAddress);

      if (currentAccount !== fromAddress) {
        setError("Connected wallet address doesn't match the expected address");
        setIsLoading(false);
        return;
      }

      // Switch to testnet if not already on testnet
      network = await window.unisat.getNetwork();
      console.log("Current network:", network);

      if (network !== "testnet") {
        console.log("Switching to testnet...");
        await window.unisat.switchNetwork("testnet");
        console.log("Switched to testnet");

        // Wait for network switch to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Validate amount
      amountValue = parseFloat(amount);
      if (isNaN(amountValue) || amountValue <= 0) {
        throw new Error("Invalid amount: Amount must be a positive number");
      }

      if (amountValue < 0.00001) {
        throw new Error("Amount too small. Minimum amount is 0.00001 tBTC");
      }

      if (amountValue > 1) {
        throw new Error("Amount too large. Maximum amount is 1 tBTC");
      }

      // Ensure amount has proper precision (8 decimal places max)
      amountValue = parseFloat(amountValue.toFixed(8));

      // Check wallet balance
      const balance = await window.unisat.getBalance();
      console.log("Wallet balance:", balance);

      let confirmedBalance = 0;
      if (balance) {
        if (typeof balance === "number") {
          confirmedBalance = balance;
        } else if (balance.confirmed !== undefined) {
          confirmedBalance = balance.confirmed;
        } else if (balance.total !== undefined) {
          confirmedBalance = balance.total;
        } else if (balance.amount !== undefined) {
          confirmedBalance = balance.amount;
        }
      }

      if (confirmedBalance < amountValue) {
        throw new Error(
          `Insufficient balance. You have ${confirmedBalance} tBTC, but need ${amountValue} tBTC`
        );
      }

      console.log("Attempting to send tBTC:", {
        otaAddress,
        amount,
        amountType: typeof amount,
        parsedAmount: amountValue,
        network,
        walletAddress: currentAccount,
        balance: balance,
      });

      // Convert BTC to satoshis (integer) as required by Unisat API
      const satoshis = Math.round(amountValue * 100000000);

      console.log("Amount conversion:", {
        originalAmount: amount,
        parsedAmount: amountValue,
        satoshis: satoshis,
        amountType: typeof satoshis,
      });

      // Validate that the amount is not zero or too small
      if (satoshis < 1000) {
        // 1000 sats = 0.00001 BTC
        throw new Error("Amount is too small. Minimum amount is 0.00001 tBTC");
      }

      // Create memo data for OTA transaction
      // This should match the format from the working example
      const memoData =
        "07020500006e657744657800b9d2a2757cc7ea71eb79211377c8413bfdfdb74137d5d9b21fa168ae96a3f0e63bbcacaa0c0b7dfcaba49e2e0fee91761f2e769b8c175b26";

      // Validate OTA address format
      if (!otaAddress || !otaAddress.startsWith("tb1")) {
        throw new Error(
          "Invalid OTA address format. Must be a valid testnet address starting with 'tb1'"
        );
      }

      console.log("Transaction parameters:", {
        toAddress: otaAddress,
        amount: satoshis,
        feeRate: 1,
        memo: memoData,
        enableRBF: true,
      });

      // Send tBTC using the correct parameters that match the working example
      let txHash;

      try {
        // First try with satoshis (integer)
        console.log("Attempting to send with satoshis:", satoshis);
        txHash = await window.unisat.sendBitcoin(otaAddress, satoshis, {
          feeRate: 1, // Use 1 sat/vB as shown in the working example
          memo: memoData, // Include the memo data
          enableRBF: true, // Enable RBF as shown in the working example
        });
        console.log("Success with satoshis:", txHash);
      } catch (error) {
        console.log("Failed with satoshis, trying with BTC amount:", error);

        try {
          // Try with BTC amount (number)
          console.log("Attempting to send with BTC amount:", amountValue);
          txHash = await window.unisat.sendBitcoin(otaAddress, amountValue, {
            feeRate: 1, // Use 1 sat/vB as shown in the working example
            memo: memoData, // Include the memo data
            enableRBF: true, // Enable RBF as shown in the working example
          });
          console.log("Success with BTC amount:", txHash);
        } catch (btcError) {
          console.log(
            "Failed with BTC amount, trying with string format:",
            btcError
          );

          try {
            // Try with string format
            const amountString = amountValue.toFixed(8);
            console.log("Attempting to send with string format:", amountString);
            txHash = await window.unisat.sendBitcoin(otaAddress, amountString, {
              feeRate: 1, // Use 1 sat/vB as shown in the working example
              memo: memoData, // Include the memo data
              enableRBF: true, // Enable RBF as shown in the working example
            });
            console.log("Success with string format:", txHash);
          } catch (stringError) {
            console.log("All amount formats failed:", {
              satoshisError: error,
              btcError: btcError,
              stringError: stringError,
            });

            // Throw the most descriptive error
            if (stringError.message) {
              throw stringError;
            } else if (btcError.message) {
              throw btcError;
            } else {
              throw error;
            }
          }
        }
      }

      console.log("Transaction successful:", txHash);
      setTxHash(txHash);

      // Call the callback with transaction details
      if (onTransactionComplete) {
        onTransactionComplete({
          success: true,
          txHash,
          fromAddress: currentAccount,
          toAddress: otaAddress,
          amount,
          memo: memoData,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error sending tBTC:", error);

      // Provide more specific error messages
      let errorMessage = "Failed to send tBTC";

      if (error.code === 4001) {
        errorMessage = "Transaction rejected by user";
      } else if (error.code === -32603) {
        errorMessage = "Insufficient balance or invalid amount";
      } else if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(errorMessage);

      // Log detailed error information for debugging
      console.error("Detailed error info:", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorStack: error.stack,
        otaAddress,
        amount: amountValue,
        network,
        walletAddress: fromAddress,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setError("");
      setTxHash("");
    }
    setIsLoading(false);
  };

  // Check balance function for debugging
  const checkBalance = async () => {
    try {
      const balance = await window.unisat.getBalance();

      alert(`Balance check complete. Check console for details.`);
    } catch (error) {
      console.error("Balance check failed:", error);
      alert(`Balance check failed: ${error.message}`);
    }
  };

  // Test function using the same approach as working implementation
  const testSendTransaction = async () => {
    try {
      // Connect to wallet
      const accounts = await window.unisat.requestAccounts();
      const currentAccount = accounts[0];

      // Switch to testnet
      const network = await window.unisat.getNetwork();

      if (network !== "testnet") {
        console.log("Switching to testnet...");
        await window.unisat.switchNetwork("testnet");
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Check balance before testing
      const balance = await window.unisat.getBalance();

      // Convert test amount to satoshis (integer) as required by Unisat API
      const testAmount = 0.0001; // 0.0001 tBTC
      const testSatoshis = Math.round(testAmount * 100000000); // 10000 sats

      console.log("Test amount conversion:", {
        originalAmount: testAmount,
        satoshis: testSatoshis,
        amountType: typeof testSatoshis,
      });

      // Create memo data for OTA transaction (same as main function)
      const memoData =
        "07020500006e657744657800b9d2a2757cc7ea71eb79211377c8413bfdfdb74137d5d9b21fa168ae96a3f0e63bbcacaa0c0b7dfcaba49e2e0fee91761f2e769b8c175b26";

      // Send using fallback approach like the main function
      let result;

      try {
        // First try with satoshis (integer)
        result = await window.unisat.sendBitcoin(otaAddress, testSatoshis, {
          feeRate: 1, // Use 1 sat/vB as shown in the working example
          memo: memoData, // Include the memo data
          enableRBF: true, // Enable RBF as shown in the working example
        });
      } catch (error) {
        console.log(
          "Test: Failed with satoshis, trying with BTC amount:",
          error
        );

        try {
          // Try with BTC amount (number)
          result = await window.unisat.sendBitcoin(otaAddress, testAmount, {
            feeRate: 1, // Use 1 sat/vB as shown in the working example
            memo: memoData, // Include the memo data
            enableRBF: true, // Enable RBF as shown in the working example
          });
        } catch (btcError) {
          console.log(
            "Test: Failed with BTC amount, trying with string format:",
            btcError
          );

          try {
            // Try with string format
            const amountString = testAmount.toFixed(8);
            result = await window.unisat.sendBitcoin(otaAddress, amountString, {
              feeRate: 1, // Use 1 sat/vB as shown in the working example
              memo: memoData, // Include the memo data
              enableRBF: true, // Enable RBF as shown in the working example
            });
          } catch (stringError) {
            console.log("Test: All amount formats failed:", {
              satoshisError: error,
              btcError: btcError,
              stringError: stringError,
            });

            // Throw the most descriptive error
            if (stringError.message) {
              throw stringError;
            } else if (btcError.message) {
              throw btcError;
            } else {
              throw error;
            }
          }
        }
      }

      alert(`Test successful! TXID: ${result}`);
    } catch (error) {
      alert(`Test failed: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ota-modal-overlay">
      <div className="ota-modal">
        <div className="ota-modal-header">
          <h3>🚀 Send tBTC to OTA Address</h3>
          <button
            className="ota-modal-close"
            onClick={handleClose}
            disabled={isLoading}
          >
            ×
          </button>
        </div>

        <div className="ota-modal-content">
          <div className="ota-info-section">
            <div className="ota-info-item">
              <label>From Address (Testnet):</label>
              <div className="ota-address-display">
                {fromAddress || "Not connected"}
              </div>
            </div>

            <div className="ota-info-item">
              <label>To OTA Address:</label>
              <div className="ota-address-display">{otaAddress}</div>
            </div>

            <div className="ota-info-item">
              <label>Amount (tBTC):</label>
              <div className="ota-amount-display">{amount} tBTC</div>
            </div>
          </div>

          {error && <div className="ota-error-message">{error}</div>}

          {txHash && (
            <div className="ota-success-message">
              <h4>✅ Transaction Successful!</h4>
              <p>Transaction Hash:</p>
              <div className="ota-tx-hash">
                <a
                  href={`https://testnet.blockstream.info/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {txHash}
                </a>
              </div>
            </div>
          )}

          <div className="ota-modal-actions">
            {!txHash ? (
              <>
                <button
                  className="ota-send-button"
                  onClick={handleSendTransaction}
                  disabled={isLoading || !unisatAvailable}
                >
                  {isLoading ? "Sending..." : "Send tBTC to OTA"}
                </button>

                {/* Test button for debugging - remove in production */}
                <button
                  className="ota-test-button"
                  onClick={testSendTransaction}
                  disabled={isLoading || !unisatAvailable}
                  style={{
                    backgroundColor: "#ff9800",
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  Test Different Amount Formats
                </button>

                {/* Balance check button for debugging */}
                <button
                  className="ota-balance-button"
                  onClick={checkBalance}
                  disabled={isLoading || !unisatAvailable}
                  style={{
                    backgroundColor: "#2196F3",
                    marginTop: "10px",
                    width: "100%",
                  }}
                >
                  Check Balance Structure
                </button>
              </>
            ) : (
              <button className="ota-close-button" onClick={handleClose}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTATransactionModal;
