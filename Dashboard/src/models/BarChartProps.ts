import { AggregatedTradeData } from "../utils/aggregationUtils";

export interface BarChartProps {
    data: AggregatedTradeData[];
    width: number;
    height: number;
  }