import React from "react";
import "./WalletConnect.css";

const WalletConnect = ({
  walletConnected,
  walletAddress,
  onConnect,
  onDisconnect,
}) => {
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {!walletConnected ? (
        <div className="wallet-not-connected">
          <h3>🔗 Connect Your Wallet</h3>
          <p>Connect your Unisat wallet to start bridging</p>
          <button className="connect-button" onClick={onConnect}>
            Connect Unisat Wallet
          </button>
          <div className="wallet-instructions">
            <p>Don't have Unisat wallet?</p>
            <a
              href="https://unisat.io/download"
              target="_blank"
              rel="noopener noreferrer"
              className="install-link"
            >
              Install Unisat Extension
            </a>
          </div>
        </div>
      ) : (
        <div className="wallet-connected">
          <h3>✅ Wallet Connected</h3>
          <div className="wallet-info">
            <p>
              <strong>Address:</strong> {formatAddress(walletAddress)}
            </p>
            <p>
              <strong>Network:</strong> Bitcoin Testnet
            </p>
          </div>
          <button className="disconnect-button" onClick={onDisconnect}>
            Disconnect Wallet
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
