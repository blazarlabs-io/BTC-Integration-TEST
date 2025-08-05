import React, { useState } from "react";
import axios from "axios";
import "./BridgeForm.css";
import OTATransactionModal from "./OTATransactionModal";

const BridgeForm = ({ walletAddress, onTransactionCreated, setLoading }) => {
  const [formData, setFormData] = useState({
    toAccount: "",
    amount: "",
  });
  const [error, setError] = useState("");
  const [showOTAModal, setShowOTAModal] = useState(false);
  const [otaData, setOtaData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleOTAModalClose = () => {
    setShowOTAModal(false);
    setOtaData(null);
  };

  const handleOTATransactionComplete = (transactionData) => {
    // Handle successful OTA transaction
    console.log("OTA Transaction completed:", transactionData);
    onTransactionCreated({
      success: true,
      type: "ota_transaction",
      data: transactionData,
    });
  };

  const validateForm = () => {
    if (!formData.toAccount.trim()) {
      setError("Please enter the destination ADA address");
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }
    if (parseFloat(formData.amount) < 0.0001) {
      setError("Minimum amount is 0.0001 tBTC");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/bridge/create-transaction",
        {
          fromAccount: walletAddress,
          toAccount: formData.toAccount,
          amount: formData.amount,
        }
      );

      if (response.data.success) {
        // Check if the response contains an OTA address
        const responseData = response.data.data || response.data;
        if (
          responseData.tx &&
          responseData.tx.toAccount &&
          responseData.tx.toAccount.startsWith("tb1")
        ) {
          // This is an OTA address, show the modal
          setOtaData({
            otaAddress: responseData.tx.toAccount,
            amount: formData.amount,
            fromAddress: walletAddress,
            memo: responseData.tx.memo,
          });
          setShowOTAModal(true);
        } else {
          // Regular bridge transaction
          onTransactionCreated(response.data);
        }
        setFormData({ toAccount: "", amount: "" });
      } else {
        setError(response.data.error || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Bridge API Error:", error);
      setError(
        error.response?.data?.error || "Failed to create bridge transaction"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bridge-form">
      <h3>🌉 Create Bridge Transaction</h3>
      <p>Bridge your tBTC to tADA on Cardano Preprod network</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fromAccount">From Account (BTC Testnet)</label>
          <input
            type="text"
            id="fromAccount"
            value={walletAddress}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="toAccount">To Account (ADA Preprod) *</label>
          <input
            type="text"
            id="toAccount"
            name="toAccount"
            value={formData.toAccount}
            onChange={handleInputChange}
            placeholder="addr_test1..."
            required
          />
          <small>Enter your Cardano Preprod wallet address</small>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount (tBTC) *</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            placeholder="0.0006"
            step="0.0001"
            min="0.0001"
            required
          />
          <small>Minimum: 0.0001 tBTC</small>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="submit-button">
          Create Bridge Transaction
        </button>

        {/* Test OTA Modal Button - Remove in production */}
        <button
          type="button"
          className="test-ota-button"
          onClick={() => {
            setOtaData({
              otaAddress:
                "tb1psrhm8vtwhq86galup86xq26dtxt3jflggvmkq7tpcxr25r1mm31qk6kpk8",
              amount: "0.0006",
              fromAddress: walletAddress,
            });
            setShowOTAModal(true);
          }}
          style={{ marginTop: "10px", backgroundColor: "#ff9800" }}
        >
          Test OTA Modal
        </button>
      </form>

      <div className="bridge-info">
        <h4>ℹ️ Bridge Information</h4>
        <ul>
          <li>
            <strong>From:</strong> Bitcoin Testnet (tBTC)
          </li>
          <li>
            <strong>To:</strong> Cardano Preprod (tADA)
          </li>
          <li>
            <strong>Fee:</strong> 0.2% operation fee
          </li>
          <li>
            <strong>Processing Time:</strong> ~10-30 minutes
          </li>
        </ul>
      </div>

      {/* OTA Transaction Modal */}
      {otaData && (
        <OTATransactionModal
          isOpen={showOTAModal}
          onClose={handleOTAModalClose}
          otaAddress={otaData.otaAddress}
          amount={otaData.amount}
          fromAddress={otaData.fromAddress}
          onTransactionComplete={handleOTATransactionComplete}
          memo={otaData.memo}
        />
      )}
    </div>
  );
};

export default BridgeForm;
