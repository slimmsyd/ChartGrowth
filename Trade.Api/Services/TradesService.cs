using Trade.Api.Models;

namespace Trade.Api.Services;
public class TradesService : ITradesService
{
    private readonly ITradesQueryable _tradesQueryable;

    public TradesService(ITradesQueryable tradesQueryable)
    {
        _tradesQueryable = tradesQueryable;
    }

    public IEnumerable<StockTrade> GetTradesAsync(DateTime startTimestamp, decimal minQuoteSize)
    {
        return _tradesQueryable.QueryTrades(startTimestamp, minQuoteSize);
    }
}
