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
      backgroundColor: '#f0f2f5', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'row',
      padding: '0',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      {/* Left Sidebar Controls */}
      <div className='sidebar-controls' style={{
        width: '280px',
        backgroundColor: '#111827',
        color: '#fff',
        padding: '24px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          fontSize: '22px', 
          fontWeight: 600, 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 13.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V13.2M3 13.2V6.2C3 5.07989 3 4.51984 3.21799 4.09202C3.40973 3.71569 3.71569 3.40973 4.09202 3.21799C4.51984 3 5.07989 3 6.2 3H17.8C18.9201 3 19.4802 3 19.908 3.21799C20.2843 3.40973 20.5903 3.71569 20.782 4.09202C21 4.51984 21 5.07989 21 6.2V13.2M3 13.2H21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 17L7 15M12 17V13M17 17V11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Trade Analytics
        </div>
        
        <div className='control-group'>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: 500,
            color: '#9CA3AF'
          }}>
            Start Date
          </label>
          <input 
            type="date" 
            id="start" 
            name="trip-start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#1F2937',
              color: '#E5E7EB',
              outline: 'none'
            }}
          />
        </div>
        
        <div className='control-group'>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: 500,
            color: '#9CA3AF'
          }}>
            Min Size
          </label>
          <input 
            type="number" 
            id="minSize" 
            name="min-size"
            value={minSize}
            onChange={(e) => setMinSize(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#1F2937',
              color: '#E5E7EB',
              outline: 'none'
            }}
          />
        </div>
        
        <div className='control-group'>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: 500,
            color: '#9CA3AF'
          }}>
            Aggregation
          </label>
          <select 
            name="aggregation" 
            id="aggregation"
            value={aggregation}
            onChange={(e) => setAggregation(e.target.value as Aggregation)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#1F2937',
              color: '#E5E7EB',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center'
            }}
          >
            <option value="Daily">Daily (1 Day)</option>
            <option value="Weekly">Weekly (7 Days)</option>
            <option value="Monthly">Monthly (30 Days)</option>
            <option value="Quarterly">Quarterly (91 Days)</option>
          </select>
        </div>
        
        <div className='control-group'>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontSize: '14px', 
            fontWeight: 500,
            color: '#9CA3AF'
          }}>
            Chart Type
          </label>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            width: '100%' 
          }}>
            <button 
              onClick={() => setChart('BarChart')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: chart === 'BarChart' ? 600 : 400,
                backgroundColor: chart === 'BarChart' ? '#10B981' : '#374151',
                color: chart === 'BarChart' ? '#111827' : '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 20V10M12 20V4M18 20V14" stroke={chart === 'BarChart' ? '#111827' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Bar
            </button>
            <button 
              onClick={() => setChart('TreeMap')}
              style={{
                flex: 1,
                padding: '10px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: chart === 'TreeMap' ? 600 : 400,
                backgroundColor: chart === 'TreeMap' ? '#10B981' : '#374151',
                color: chart === 'TreeMap' ? '#111827' : '#E5E7EB',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5Z" stroke={chart === 'TreeMap' ? '#111827' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 9H21M3 15H21M9 21V9M15 21V9" stroke={chart === 'TreeMap' ? '#111827' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Tree
            </button>
          </div>
        </div>
        
        <button 
          onClick={handleFetchTrades} 
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#10B981',
            color: '#111827',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1,
            transition: 'all 0.2s ease',
            marginTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.92157L16.25 7.75M4.92157 19.0784L7.75 16.25M4.92157 4.92157L7.75 7.75" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V16M8 12H16" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Fetch Trades
            </>
          )}
        </button>
      </div>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, padding: '20px 30px', overflow: 'auto' }}>
        <DashboardUI 
          trades={trades}
          aggregatedTrades={aggregatedTrades}
          aggregation={aggregation}
          chart={chart}
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
  )
}

export default App
