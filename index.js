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

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Stock Automation System backend is running...'
  });
});

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
    service: 'Stock Automation Backend System'
  });
});

app.get('/alerts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching alerts:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      data, 
      count: data.length 
    });
  } catch (error) {
    console.error('Unexpected error fetching alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/watchlist', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('watchlist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching watchlist:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ 
      success: true, 
      data, 
      count: data.length 
    });
  } catch (error) {
    console.error('Unexpected error fetching watchlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log("Bolt server listening on port 3000");
});
