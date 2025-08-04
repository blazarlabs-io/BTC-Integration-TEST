import React, { useState, useEffect } from "react";
import "./App.css";
import BridgeForm from "./components/BridgeForm.js";
import WalletConnect from "./components/WalletConnect.js";
import TransactionStatus from "./components/TransactionStatus.js";

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [transactionData, setTransactionData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if Unisat wallet is available
  useEffect(() => {
    const checkUnisatWallet = () => {
      if (typeof window.unisat !== "undefined") {
        console.log("Unisat wallet is available");
      } else {
        console.log("Unisat wallet not found");
      }
    };

    checkUnisatWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.unisat !== "undefined") {
        const accounts = await window.unisat.requestAccounts();
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setWalletConnected(true);
        }
      } else {
        alert("Please install Unisat wallet extension");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet");
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress("");
    setTransactionData(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>BTC to ADA</h1>
        <p>Bridge tBTC (Bitcoin Testnet) to tADA (Cardano Preprod)</p>
      </header>

      <main className="App-main">
        <WalletConnect
          walletConnected={walletConnected}
          walletAddress={walletAddress}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
        />

        {walletConnected && (
          <BridgeForm
            walletAddress={walletAddress}
            onTransactionCreated={setTransactionData}
            setLoading={setLoading}
          />
        )}

        {transactionData && (
          <TransactionStatus
            transactionData={transactionData}
            onClose={() => setTransactionData(null)}
          />
        )}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>Processing bridge transaction...</p>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Powered by Wanchain Bridge API</p>
      </footer>
    </div>
  );
}

export default App;
