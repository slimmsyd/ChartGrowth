using Trade.Api.Models;

public interface ITradesQueryable
{
    IEnumerable<StockTrade> QueryTrades(DateTime startTimestamp, decimal minQuoteSize);
}
