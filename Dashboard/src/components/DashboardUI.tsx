import React from 'react';
import { StockTradeData } from '../models/StockTradeData';
import { AggregatedTradeData } from '../utils/aggregationUtils';
import BarChart from './BarChart';
import TreeMapChart from './TreeMapChart';

interface DashboardUIProps {
  trades: StockTradeData[];
  aggregatedTrades: AggregatedTradeData[];
  aggregation: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  chart: 'BarChart' | 'TreeMap';
  isLoading: boolean;
  error: string | null;
}

const DashboardUI: React.FC<DashboardUIProps> = ({
  trades,
  aggregatedTrades,
  aggregation,
  chart,
  isLoading,
  error
}) => {
  // Calculate summary metrics
  const totalTrades = trades.length;
  const totalTradeSize = trades.reduce((sum, trade) => sum + trade.tradeSize, 0);
  const averagePrice = trades.length > 0 
    ? trades.reduce((sum, trade) => sum + trade.price, 0) / trades.length 
    : 0;
  
  // Get unique symbols
  const uniqueSymbols = [...new Set(trades.map(trade => trade.symbol))];
  
  // Get date range
  const dateRange = trades.length > 0 
    ? {
        start: new Date(Math.min(...trades.map(t => new Date(t.timeStamp).getTime()))),
        end: new Date(Math.max(...trades.map(t => new Date(t.timeStamp).getTime())))
      }
    : null;
  
  return (
    <div className="dashboard-container" style={{
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#333',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px'
    }}>
      {/* Header */}
      <div className="dashboard-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 600, 
          margin: 0,
          color: '#1a1a1a'
        }}>
          Trade Analytics Dashboard
        </h1>
        
        <div className="date-range" style={{
          fontSize: '14px',
          color: '#666',
          backgroundColor: '#f0f2f5',
          padding: '8px 16px',
          borderRadius: '20px'
        }}>
          {dateRange 
            ? `${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}`
            : 'No date range available'}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Trades</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a' }}>{totalTrades.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>across {uniqueSymbols.length} symbols</div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Trade Size</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a' }}>{totalTradeSize.toLocaleString()}</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>volume</div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Average Price</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a' }}>${averagePrice.toFixed(2)}</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>per trade</div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Aggregation</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#1a1a1a' }}>{aggregation}</div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>{aggregatedTrades.length} periods</div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="chart-section" style={{ marginBottom: '24px' }}>
        {isLoading && (
          <div className="loading" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '400px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '16px', color: '#666' }}>Loading data...</div>
          </div>
        )}
        
        {error && (
          <div className="error" style={{
            padding: '20px',
            backgroundColor: '#fff0f0',
            borderRadius: '8px',
            color: '#d32f2f',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            {error}
          </div>
        )}
        
        {!isLoading && !error && trades.length > 0 && (
          <div style={{ width: '100%', height: '500px' }}>
            {chart === 'BarChart' ? (
              <BarChart data={aggregatedTrades} width={1150} height={500} />
            ) : (
              <TreeMapChart data={aggregatedTrades} width={1150} height={500} />
            )}
          </div>
        )}
      </div>
      
      {/* Data Table */}
      {!isLoading && !error && trades.length > 0 && (
        <div className="data-table-section" style={{ marginBottom: '24px' }}>
          <div className="data-table" style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <div className="table-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #eee'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Recent Trades</h3>
              <div style={{ fontSize: '14px', color: '#666' }}>Showing {Math.min(10, trades.length)} of {trades.length}</div>
            </div>
            
            <div className="table-content" style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>Date & Time</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>Symbol</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>Trade Size</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#666', borderBottom: '1px solid #eee' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trade.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{new Date(trade.timeStamp).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500 }}>{trade.symbol}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right' }}>{trade.tradeSize.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', fontWeight: 500 }}>${trade.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* No Data State */}
      {!isLoading && !error && trades.length === 0 && (
        <div className="no-data" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 500, marginBottom: '8px' }}>No trade data available</div>
          <div style={{ fontSize: '14px', color: '#666' }}>Use the controls above to fetch trade data</div>
        </div>
      )}
    </div>
  );
};

export default DashboardUI; 