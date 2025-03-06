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
    <div className="dashboard-container">
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
          color: '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          Dashboard
          {dateRange && (
            <span style={{
              fontSize: '14px',
              color: '#6B7280',
              backgroundColor: '#F3F4F6',
              padding: '6px 12px',
              borderRadius: '20px',
              fontWeight: 500
            }}>
              {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
            </span>
          )}
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6B7280',
            backgroundColor: '#F3F4F6',
            padding: '6px 12px',
            borderRadius: '20px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: '#10B981',
              display: 'inline-block'
            }}></span>
            {aggregation} View
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="summary-cards" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          ':hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Total Trades</div>
            <div style={{ 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              color: '#10B981',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 10L12 14L16 10" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14V4" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20 16V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V16" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            {totalTrades.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            across {uniqueSymbols.length} symbols
          </div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Total Volume</div>
            <div style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.1)', 
              color: '#4F46E5',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V13.2M3 13.2V6.2C3 5.07989 3 4.51984 3.21799 4.09202C3.40973 3.71569 3.71569 3.40973 4.09202 3.21799C4.51984 3 5.07989 3 6.2 3H17.8C18.9201 3 19.4802 3 19.908 3.21799C20.2843 3.40973 20.5903 3.71569 20.782 4.09202C21 4.51984 21 5.07989 21 6.2V13.2M3 13.2H21" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 17L7 15M12 17V13M17 17V11" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            {totalTradeSize.toLocaleString()}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            trade size
          </div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Average Price</div>
            <div style={{ 
              backgroundColor: 'rgba(236, 72, 153, 0.1)', 
              color: '#EC4899',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.92157L16.25 7.75M4.92157 19.0784L7.75 16.25M4.92157 4.92157L7.75 7.75" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            ${averagePrice.toFixed(2)}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            per trade
          </div>
        </div>
        
        <div className="summary-card" style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', fontWeight: 500 }}>Periods</div>
            <div style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              color: '#F59E0B',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 18.8856 21 19.8284 20.4142 20.4142C19.8284 21 18.8856 21 17 21H7C5.11438 21 4.17157 21 3.58579 20.4142C3 19.8284 3 18.8856 3 17V8.5C3 6.61438 3 5.67157 3.58579 5.08579C4.17157 4.5 5.11438 4.5 7 4.5H17C18.8856 4.5 19.8284 4.5 20.4142 5.08579C21 5.67157 21 6.61438 21 8.5Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 13H9M15 13H17M7 17H9M15 17H17" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
            {aggregatedTrades.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            {aggregation} periods
          </div>
        </div>
      </div>
      
      {/* Chart Section */}
      <div className="chart-section" style={{ marginBottom: '32px' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: 600,
              color: '#111827'
            }}>
              {chart === 'BarChart' ? 'Trade Volume by Period' : 'Trade Volume by Symbol'}
            </h2>
            <div style={{
              fontSize: '14px',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Updated just now
            </div>
          </div>
          
          <div style={{ padding: '20px' }}>
            {isLoading && (
              <div className="loading" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px'
              }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <svg className="animate-spin" width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.92157L16.25 7.75M4.92157 19.0784L7.75 16.25M4.92157 4.92157L7.75 7.75" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div style={{ fontSize: '16px', color: '#6B7280', fontWeight: 500 }}>Loading data...</div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="error" style={{
                padding: '20px',
                backgroundColor: '#FEF2F2',
                borderRadius: '8px',
                color: '#B91C1C',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 9V13M12 17H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
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
            
            {!isLoading && !error && trades.length === 0 && (
              <div className="no-data" style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                padding: '40px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 13.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V13.2M3 13.2V6.2C3 5.07989 3 4.51984 3.21799 4.09202C3.40973 3.71569 3.71569 3.40973 4.09202 3.21799C4.51984 3 5.07989 3 6.2 3H17.8C18.9201 3 19.4802 3 19.908 3.21799C20.2843 3.40973 20.5903 3.71569 20.782 4.09202C21 4.51984 21 5.07989 21 6.2V13.2M3 13.2H21" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 17L7 15M12 17V13M17 17V11" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#374151' }}>No trade data available</div>
                <div style={{ fontSize: '14px', color: '#6B7280', textAlign: 'center', maxWidth: '300px' }}>
                  Use the controls on the left to fetch trade data and visualize it here
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Data Table */}
      {!isLoading && !error && trades.length > 0 && (
        <div className="data-table-section">
          <div className="data-table" style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <div className="table-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #F3F4F6'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111827' }}>Recent Trades</h3>
              <div style={{ fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12H15M9 16H15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Showing {Math.min(10, trades.length)} of {trades.length}
              </div>
            </div>
            
            <div className="table-content" style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>ID</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>Date & Time</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>Symbol</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>Trade Size</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '13px', fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #F3F4F6' }}>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 10).map((trade) => (
                    <tr key={trade.id} style={{ borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s ease' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#6B7280' }}>{trade.id}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', color: '#374151' }}>{new Date(trade.timeStamp).toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        <div style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          backgroundColor: '#F3F4F6', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          {trade.symbol}
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', color: '#374151' }}>{trade.tradeSize.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', textAlign: 'right', fontWeight: 500, color: '#111827' }}>${trade.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{ 
              padding: '12px 20px', 
              borderTop: '1px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button style={{
                backgroundColor: 'transparent',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#6B7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9L12 16L5 9" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                View more
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUI; 