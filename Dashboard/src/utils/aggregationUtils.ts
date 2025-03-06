import { StockTradeData } from '../models/StockTradeData';

/**
 * Represents a group of aggregated trade data
 */
export interface AggregatedTradeData {
  period: string;
  totalTradeSize: number;
  averagePrice: number;
  tradeCount: number;
  symbols: Record<string, number>; // Symbol -> count mapping
}

/**
 * Aggregates trade data by the specified time period
 * @param trades - Array of trade data to aggregate
 * @param aggregationType - Type of aggregation to perform (Daily, Weekly, Monthly, Quarterly)
 * @returns Array of aggregated trade data
 */
export function aggregateTrades(
  trades: StockTradeData[],
  aggregationType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'
): AggregatedTradeData[] {
  if (!trades.length) return [];

  // Sort trades by timestamp (oldest first)
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.timeStamp).getTime() - new Date(b.timeStamp).getTime()
  );

  // Determine the period length in milliseconds based on aggregation type
  const periodLength = getPeriodLengthInDays(aggregationType) * 24 * 60 * 60 * 1000;
  
  // Group trades by period
  const tradesByPeriod = groupTradesByPeriod(sortedTrades, periodLength, aggregationType);
  
  // Calculate aggregated data for each period
  return calculateAggregatedData(tradesByPeriod);
}

/**
 * Gets the period length in days based on aggregation type
 */
function getPeriodLengthInDays(aggregationType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'): number {
  switch (aggregationType) {
    case 'Daily':
      return 1;
    case 'Weekly':
      return 7;
    case 'Monthly':
      return 30;
    case 'Quarterly':
      return 91;
    default:
      return 1;
  }
}

/**
 * Groups trades by time period
 */
function groupTradesByPeriod(
  sortedTrades: StockTradeData[],
  periodLength: number,
  aggregationType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'
): Record<string, StockTradeData[]> {
  const tradesByPeriod: Record<string, StockTradeData[]> = {};
  
  sortedTrades.forEach(trade => {
    const tradeDate = new Date(trade.timeStamp);
    const periodKey = getPeriodKey(tradeDate, aggregationType);
    
    if (!tradesByPeriod[periodKey]) {
      tradesByPeriod[periodKey] = [];
    }
    
    tradesByPeriod[periodKey].push(trade);
  });
  
  return tradesByPeriod;
}

/**
 * Generates a key for a period based on the date and aggregation type
 */
function getPeriodKey(date: Date, aggregationType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'): string {
  const year = date.getFullYear();
  
  switch (aggregationType) {
    case 'Daily':
      // Format: YYYY-MM-DD
      return `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    
    case 'Weekly':
      // Get the week number (approximate)
      const weekNumber = Math.ceil((date.getDate() + new Date(year, date.getMonth(), 1).getDay()) / 7);
      return `${year}-W${weekNumber}-${date.getMonth() + 1}`;
    
    case 'Monthly':
      // Format: YYYY-MM
      return `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    case 'Quarterly':
      // Format: YYYY-Q#
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      return `${year}-Q${quarter}`;
    
    default:
      return date.toISOString().split('T')[0];
  }
}

/**
 * Calculates aggregated data for each period
 */
function calculateAggregatedData(tradesByPeriod: Record<string, StockTradeData[]>): AggregatedTradeData[] {
  return Object.entries(tradesByPeriod).map(([period, trades]) => {
    // Calculate total trade size
    const totalTradeSize = trades.reduce((sum, trade) => sum + trade.tradeSize, 0);
    
    // Calculate average price (weighted by trade size)
    const weightedPriceSum = trades.reduce((sum, trade) => sum + (trade.price * trade.tradeSize), 0);
    const averagePrice = totalTradeSize > 0 ? weightedPriceSum / totalTradeSize : 0;
    
    // Count trades by symbol
    const symbols: Record<string, number> = {};
    trades.forEach(trade => {
      symbols[trade.symbol] = (symbols[trade.symbol] || 0) + 1;
    });
    
    return {
      period,
      totalTradeSize,
      averagePrice,
      tradeCount: trades.length,
      symbols
    };
  }).sort((a, b) => a.period.localeCompare(b.period)); // Sort by period
}

/**
 * Formats the period key for display
 */
export function formatPeriodForDisplay(periodKey: string, aggregationType: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'): string {
  switch (aggregationType) {
    case 'Daily':
      // Already in YYYY-MM-DD format
      return periodKey;
    
    case 'Weekly':
      // Format: YYYY-W#-M
      const [year, weekPart, month] = periodKey.split('-');
      return `${year} Week ${weekPart.substring(1)} (Month ${month})`;
    
    case 'Monthly':
      // Format: YYYY-MM
      const [yearM, monthM] = periodKey.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(monthM) - 1]} ${yearM}`;
    
    case 'Quarterly':
      // Format: YYYY-Q#
      const [yearQ, quarterQ] = periodKey.split('-');
      return `${yearQ} ${quarterQ}`;
    
    default:
      return periodKey;
  }
} 