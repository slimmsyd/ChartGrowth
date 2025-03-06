using Trade.Api.Models;

namespace Trade.Api.Services;

public interface ITradesService
{
    IEnumerable<StockTrade> GetTradesAsync(DateTime startTimestamp, decimal minQuoteSize);
}
