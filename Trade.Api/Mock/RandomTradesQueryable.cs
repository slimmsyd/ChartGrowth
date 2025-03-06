using System.Globalization;
using Trade.Api.Models;

public class RandomTradesQueryable : ITradesQueryable
{
    private readonly Random _random;
    private readonly string[] _symbols = { "AAPL", "MSFT", "GOOGL", "AMZN", "META" };
    private List<StockTrade> _cachedTrades;

    public RandomTradesQueryable(int seed = 42)
    {
        _random = new Random(seed);
        _cachedTrades = new List<StockTrade>();
    }

    public void Initialize()
    {
        var endDate = DateTime.Now;
        var startDate = endDate.AddYears(-1);

        _cachedTrades = new List<StockTrade>();

        // Base prices for each symbol
        var basePrices = new Dictionary<string, decimal>
    {
        {"AAPL", 175m},
        {"MSFT", 350m},
        {"GOOGL", 130m},
        {"AMZN", 130m},
        {"META", 300m}
    };

        // Trading hours 9:30 AM - 4:00 PM EST
        var marketOpen = new TimeSpan(9, 30, 0);
        var marketClose = new TimeSpan(16, 0, 0);

        for (int i = 0; i < 5000; i++)
        {
            var timestamp = RandomDateTime(startDate, endDate);

            // Adjust time to trading hours
            timestamp = timestamp.Date + marketOpen +
                TimeSpan.FromTicks((long)(_random.NextDouble() * (marketClose - marketOpen).Ticks));

            // Select symbol with weights (more activity for popular stocks)
            var symbolWeights = new[] { 0.3, 0.25, 0.2, 0.15, 0.1 };
            var symbolIndex = WeightedRandom(symbolWeights);
            var symbol = _symbols[symbolIndex];

            // Price variation within 5% of base price
            var basePrice = basePrices[symbol];
            var priceVariation = basePrice * 0.05m * (decimal)(_random.NextDouble() * 2 - 1);
            var price = basePrice + priceVariation;

            // TradeSize follows power law distribution for more realistic trade sizes
            var size = (int)(Math.Pow(_random.NextDouble(), -0.5) * 100);
            if (size > 1000) size = 1000; // Cap maximum size

            _cachedTrades.Add(new StockTrade
            {
                Id = i + 1,
                Timestamp = timestamp,
                TradeSize = size, 
                Price = Math.Round(price, 2),
                Symbol = symbol
            });
        }

        _cachedTrades = _cachedTrades.OrderBy(t => t.Timestamp).ToList();
    }

    private int WeightedRandom(double[] weights)
    {
        var sum = weights.Sum();
        var normalized = weights.Select(w => w / sum).ToArray();
        var r = _random.NextDouble();
        var accum = 0.0;

        for (int i = 0; i < normalized.Length; i++)
        {
            accum += normalized[i];
            if (r <= accum) return i;
        }

        return normalized.Length - 1;
    }

    public IEnumerable<StockTrade> QueryTrades(DateTime startTimestamp, decimal minQuoteSize)
    {
        return _cachedTrades
            .Where(t => t.Timestamp >= startTimestamp &&
                    t.TradeSize >= minQuoteSize)
            .OrderBy(t => t.Timestamp);
    }

    private DateTime RandomDateTime(DateTime start, DateTime end)
    {
        var timeSpan = end - start;
        var randomSpan = new TimeSpan((long)(_random.NextDouble() * timeSpan.Ticks));
        return start + randomSpan;
    }
}