import { useCallback, useState, useEffect } from 'react'
import './App.css'
import { StockTradeData } from './models/StockTradeData'
import { aggregateTrades, AggregatedTradeData, formatPeriodForDisplay } from './utils/aggregationUtils'
import DashboardUI from './components/DashboardUI'

type Aggregation = "Daily" | "Weekly" | "Monthly" | "Quarterly"
type Chart = "BarChart" | "TreeMap"

/**
 * Fetches stock trade data from the API based on specified parameters
 * @param startTimestamp - ISO string representing the start date for filtering trades
 * @param minQuoteSize - Minimum trade size to filter results (in thousands)
 * @returns Promise containing an array of StockTradeData objects
 */
const fetchTrades = async (startTimestamp: string, minQuoteSize: number): Promise<StockTradeData[]> => {
  try {
    // Construct the API URL with query parameters
    const apiUrl = `http://localhost:5072/api/trades?startTimestamp=${startTimestamp}&minQuoteSize=${minQuoteSize}`;
    
    console.log(`Fetching trades from: ${apiUrl}`);
    
    // Make the network request to fetch trade data
    const response = await fetch(apiUrl);
    
    // Check if the response was successful
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`);
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Validate that the data matches the StockTradeData interface
    const validatedData: StockTradeData[] = data.map((item: any) => ({
      id: item.id,
      timeStamp: item.timeStamp,
      tradeSize: item.tradeSize,
      price: item.price,
      symbol: item.symbol
    }));
    
    console.log(`Fetched ${validatedData.length} trades successfully`);
    
    // Return the parsed and validated trade data that matches the StockTradeData interface
    // (id, timeStamp, tradeSize, price, symbol)
    return validatedData;
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.error('Error fetching trade data:', error);
    
    // Return an empty array in case of error
    return [];
  }
};

function App() {
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDay()).toISOString().split('T')[0])
  const [minSize, setMinSize] = useState(0)
  const [aggregation, setAggregation] = useState<Aggregation>('Daily')
  const [chart, setChart] = useState<Chart>('BarChart')
  const [trades, setTrades] = useState<StockTradeData[]>([])
  const [aggregatedTrades, setAggregatedTrades] = useState<AggregatedTradeData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Effect to reaggregate data when trades or aggregation type changes
  useEffect(() => {
    if (trades.length > 0) {
      const newAggregatedTrades = aggregateTrades(trades, aggregation);
      setAggregatedTrades(newAggregatedTrades);
      console.log(`Aggregated ${trades.length} trades into ${newAggregatedTrades.length} ${aggregation} periods`);
    } else {
      setAggregatedTrades([]);
    }
  }, [trades, aggregation]);

  const handleFetchTrades = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Convert the startDate string to a Date object and then to an ISO string
      const startTimestamp = new Date(startDate).toISOString();
      console.log('Fetching trades with parameters:', { startTimestamp, minQuoteSize: minSize });
      
      const fetchedTrades = await fetchTrades(startTimestamp, minSize);
      
      if (fetchedTrades.length === 0) {
        setError('No trades found for the specified criteria');
      } else {
        setTrades(fetchedTrades);
        
        // Log the first trade to verify all required fields are present
        if (fetchedTrades.length > 0) {
          const sampleTrade = fetchedTrades[0];
          console.log('Sample trade data:', {
            id: sampleTrade.id,
            timeStamp: sampleTrade.timeStamp,
            tradeSize: sampleTrade.tradeSize,
            price: sampleTrade.price,
            symbol: sampleTrade.symbol
          });
        }
      }
    } catch (err) {
      setError('Failed to fetch trades');
      console.error(err);
    } finally {
      setIsLoading(false);
    }

    // TODO #2 : After fetching trades, add any aggregation logic needed here to support the options below.
  }, [startDate, minSize])


  // TODO #3 : If the user changes the aggregation or chart type, you should update the display without making a call to get new data

  return (
    <div className="app-container" style={{ 
      backgroundColor: '#f5f7fa', 
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      <div className='menu-container' style={{
        maxWidth: '1200px',
        margin: '0 auto 20px',
        padding: '16px 24px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'flex-end'
      }}>
        <div className='input-group' style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Start Date</label>
          <input 
            type="date" 
            id="start" 
            name="trip-start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div className='input-group' style={{ flex: '1', minWidth: '120px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Min Size</label>
          <input 
            type="number" 
            id="minSize" 
            name="trip-start"
            value={minSize}
            onChange={(e) => setMinSize(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div className='input-group' style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Aggregation</label>
          <select 
            name="aggregation" 
            id="aggregation"
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="Daily">Daily (1 Day)</option>
            <option value="Weekly">Weekly (7 Days)</option>
            <option value="Monthly">Monthly (30 Days)</option>
            <option value="Quarterly">Quarterly (91 Days)</option>
          </select>
        </div>
        <div className='input-group' style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>Chart</label>
          <select 
            name="chart" 
            id="chart"
            value={chart}
            onChange={(e) => setChart(e.target.value as Chart)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="BarChart">Bar Chart</option>
            <option value="TreeMap">Tree Map</option>
          </select>
        </div>
        <button 
          onClick={handleFetchTrades} 
          disabled={isLoading}
          style={{
            padding: '10px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all 0.2s ease'
          }}
        >
          {isLoading ? 'Loading...' : 'Fetch Trades'}
        </button>
      </div>
      
      <DashboardUI 
        trades={trades}
        aggregatedTrades={aggregatedTrades}
        aggregation={aggregation}
        chart={chart}
        isLoading={isLoading}
        error={error}
      />
    </div>
  )
}

export default App
