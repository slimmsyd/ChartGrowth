import { AggregatedTradeData } from "../utils/aggregationUtils";
import { StockTradeData } from "./StockTradeData";

export interface TreeMapChartProps {
    data: AggregatedTradeData[];
    width: number;
    height: number;
    rawTrades?: StockTradeData[]; // Optional raw trades data
    aggregation: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
    minSize: number;
    maxSize: number;
    minPrice: number;
    
  }