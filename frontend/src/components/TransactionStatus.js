import React from "react";
import "./TransactionStatus.css";

const TransactionStatus = ({ transactionData, onClose }) => {
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatMemo = (memo) => {
    if (!memo) return "";
    return `${memo.slice(0, 20)}...${memo.slice(-20)}`;
  };

  return (
    <div className="transaction-status">
      <div className="status-header">
        <h3>✅ Bridge Transaction Created</h3>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="transaction-details">
        <div className="detail-section">
          <h4>Transaction Details</h4>
          <div className="detail-row">
            <span className="label">From Account:</span>
            <span className="value">
              {formatAddress(transactionData.data?.tx?.fromAccount)}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">To Account:</span>
            <span className="value">
              {formatAddress(transactionData.data?.tx?.toAccount)}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Amount (sats):</span>
            <span className="value">
              {transactionData.data?.tx?.value?.toLocaleString()}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Receive Amount:</span>
            <span className="value">
              {transactionData.data?.receiveAmount} tADA
            </span>
          </div>
        </div>

        <div className="detail-section">
          <h4>Transaction Memo</h4>
          <div className="memo-container">
            <code className="memo-text">{transactionData.data?.tx?.memo}</code>
            <button
              className="copy-button"
              onClick={() =>
                navigator.clipboard.writeText(transactionData.data?.tx?.memo)
              }
            >
              Copy
            </button>
          </div>
        </div>

        <div className="detail-section">
          <h4>Fee Information</h4>
          <div className="detail-row">
            <span className="label">Network Fee:</span>
            <span className="value">
              {transactionData.data?.feeAndQuota?.networkFee?.value}{" "}
              {transactionData.data?.feeAndQuota?.symbol}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Operation Fee:</span>
            <span className="value">
              {transactionData.data?.feeAndQuota?.operationFee?.value}%
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Min Quota:</span>
            <span className="value">
              {transactionData.data?.feeAndQuota?.minQuota}
            </span>
          </div>
          <div className="detail-row">
            <span className="label">Max Quota:</span>
            <span className="value">
              {transactionData.data?.feeAndQuota?.maxQuota}
            </span>
          </div>
        </div>

        <div className="next-steps">
          <h4>📋 Next Steps</h4>
          <ol>
            <li>Copy the transaction memo above</li>
            <li>
              Send the exact amount of {transactionData.data?.tx?.value} sats to
              the destination address
            </li>
            <li>Include the memo in your Bitcoin transaction</li>
            <li>Wait for confirmation (10-30 minutes)</li>
            <li>Check your Cardano Preprod wallet for tADA</li>
          </ol>
        </div>

        <div className="warning">
          <p>
            ⚠️ <strong>Important:</strong> Make sure to include the exact memo
            in your Bitcoin transaction, otherwise the bridge will fail.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
