import React, { useState } from 'react';
import { StockTradeData } from '../models/StockTradeData';

interface TradesTableProps {
  trades: StockTradeData[];
  pageSize?: number;
}

const TradesTable: React.FC<TradesTableProps> = ({ 
  trades, 
  pageSize = 10 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate total pages
  const totalPages = Math.ceil(trades.length / pageSize);
  
  // Get current page data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTrades = trades.slice(startIndex, endIndex);
  
  // Handle page navigation
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show a subset of pages with ellipsis
      if (currentPage <= 3) {
        // Near the start
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="data-table" style={{
      backgroundColor: '#171B26',
      borderRadius: '8px',
      border: '1px solid rgba(255,255,255,0.05)',
      overflow: 'hidden'
    }}>
      <div className="table-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#E5E7EB' }}>Recent Trades</h3>
        <div style={{ fontSize: '13px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 12H15M9 16H15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Showing {startIndex + 1}-{Math.min(endIndex, trades.length)} of {trades.length}
        </div>
      </div>
      
      <div className="table-content" style={{ maxHeight: '400px', overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>ID</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Date & Time</th>
              <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Symbol</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Trade Size</th>
              <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#9CA3AF', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>Price</th>
            </tr>
          </thead>
          <tbody>
            {currentTrades.map((trade) => (
              <tr key={trade.id} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.05)', 
                transition: 'background-color 0.2s ease',
                backgroundColor: 'transparent',
              }}
              className="hover:bg-[rgba(255,255,255,0.02)]"
              >
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#9CA3AF' }}>{trade.id}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', color: '#E5E7EB' }}>{new Date(trade.timeStamp).toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', fontWeight: 500, color: '#E5E7EB' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    backgroundColor: 'rgba(255,255,255,0.05)', 
                    padding: '3px 8px', 
                    borderRadius: '4px',
                    fontWeight: 500
                  }}>
                    {trade.symbol}
                  </div>
                </td>
                <td style={{ padding: '10px 16px', fontSize: '13px', textAlign: 'right', color: '#E5E7EB' }}>{trade.tradeSize.toLocaleString()}</td>
                <td style={{ padding: '10px 16px', fontSize: '13px', textAlign: 'right', fontWeight: 500, color: '#10B981' }}>${trade.price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          padding: '12px 16px', 
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          {/* Previous page button */}
          <button 
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              backgroundColor: currentPage === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '13px',
              color: currentPage === 1 ? '#6B7280' : '#E5E7EB',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 19L8 12L15 5" stroke={currentPage === 1 ? '#6B7280' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Prev
          </button>
          
          {/* Page numbers */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {getPageNumbers().map((page, index) => (
              page === 'ellipsis' ? (
                <div key={`ellipsis-${index}`} style={{ 
                  padding: '6px 4px', 
                  color: '#9CA3AF',
                  fontSize: '13px'
                }}>...</div>
              ) : (
                <button 
                  key={`page-${page}`}
                  onClick={() => goToPage(page as number)}
                  style={{
                    backgroundColor: currentPage === page ? '#10B981' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '6px 10px',
                    minWidth: '32px',
                    fontSize: '13px',
                    fontWeight: currentPage === page ? 600 : 400,
                    color: currentPage === page ? '#111827' : '#E5E7EB',
                    cursor: 'pointer'
                  }}
                >
                  {page}
                </button>
              )
            ))}
          </div>
          
          {/* Next page button */}
          <button 
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              backgroundColor: currentPage === totalPages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 10px',
              fontSize: '13px',
              color: currentPage === totalPages ? '#6B7280' : '#E5E7EB',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            Next
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke={currentPage === totalPages ? '#6B7280' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default TradesTable; 