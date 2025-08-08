const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require('cors');
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/webhook", async (req, res) => {
  const { ticker, price } = req.body;
  console.log("ticker", ticker, price);

  if (price < 200) {
    const { error } = await supabase
      .from("alerts")
      .insert({
        symbol: ticker,
        current_price: price,
        // date: new Date().toISOString(),
        reason: "Price < $200 alert",
        target_price: 200,
        action_taken: 'Alert logged'
      });

    if (error) return res.status(500).json({ error });
    console.log('Alert logged');
  }

  res.status(200).json({ message: "Processed", ticker, price });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'GPT Stock Automation System'
  });
});

app.listen(3000, () => {
  console.log("Bolt server listening on port 3000");
});
