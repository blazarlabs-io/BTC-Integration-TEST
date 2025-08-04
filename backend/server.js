const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.post("/api/bridge/create-transaction", async (req, res) => {
  try {
    const { fromAccount, toAccount, amount } = req.body;

    if (!fromAccount || !toAccount || !amount) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const bridgePayload = {
      fromChain: "BTC",
      toChain: "ADA",
      fromAccount,
      fromToken: "0x0000000000000000000000000000000000000000",
      toToken:
        "0x64326138353932656339363733616331386665613130343438383566393435313865393534616230636232623662623061333238643261662e343235343433",
      toAccount,
      amount,
      partner: "newDex",
    };

    const response = await axios.post(
      "https://bridge-api.wanchain.org/api/testnet/createTx2?fromChain=BTC",
      bridgePayload
    );

    console.log("Bridge Payload:");
    console.log(response.data);

    res.json(response.data);
  } catch (error) {
    console.error("Bridge API Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to create bridge transaction",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "BTC Bridge API is running",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 BTC Bridge Backend running on port ${PORT}`);
});
