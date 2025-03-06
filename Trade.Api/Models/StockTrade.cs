namespace Trade.Api.Models;

public class StockTrade
{
    public int Id { get; set; }
    public DateTime Timestamp { get; set; }
    public int TradeSize { get; set; }
    public decimal Price { get; set; }
    public string Symbol { get; set; } = string.Empty;
}
