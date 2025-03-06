import express from 'express';
import cors from 'cors';

const app = express();
const port = 5072;

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mock data generator function
function generateMockTrades(startTimestamp, minQuoteSize) {
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
  const basePrices = {
    'AAPL': 175,
    'MSFT': 350,
    'GOOGL': 130,
    'AMZN': 130,
    'META': 300
  };
  
  const startDate = new Date(startTimestamp);
  const endDate = new Date();
  const trades = [];
  
  // Generate 50 random trades
  for (let i = 0; i < 50; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const basePrice = basePrices[symbol];
    const priceVariation = (Math.random() * 20) - 10; // -10 to +10
    const price = basePrice + priceVariation;
    
    // Generate a random trade size, ensuring it's above minQuoteSize
    const tradeSize = Math.max(
      Math.floor(Math.random() * 100) + 1,
      minQuoteSize
    );
    
    // Generate a random timestamp between startDate and endDate
    const timestamp = new Date(
      startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
    );
    
    trades.push({
      id: i.toString(),
      timeStamp: timestamp.toISOString(),
      tradeSize: tradeSize,
      price: price,
      symbol: symbol
    });
  }
  
  return trades;
}

// API endpoint for trades
app.get('/api/trades', (req, res) => {
  try {
    const startTimestamp = req.query.startTimestamp || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
    const minQuoteSize = parseFloat(req.query.minQuoteSize) || 0;
    
    console.log(`Received request with startTimestamp=${startTimestamp}, minQuoteSize=${minQuoteSize}`);
    
    const trades = generateMockTrades(startTimestamp, minQuoteSize);
    
    res.json(trades);
  } catch (error) {
    console.error('Error generating mock trades:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Mock API server running at http://localhost:${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/swagger/index.html`);
}); 