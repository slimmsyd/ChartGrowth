import { useState, useEffect } from 'react';


interface ControlsPanelProps {
    timeRange: string;
    setTimeRange: (range: string) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    minSize: number;
    setMinSize: (size: number) => void;
    formatMinSize: (size: number) => string;
    handleMinSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isMobile: boolean;
    setIsMobile: (isMobile: boolean) => void;
    isMinSizeFocused: boolean;
    setIsMinSizeFocused: (isMinSizeFocused: boolean) => void;
    paramsChanged: boolean;
    setParamsChanged: (paramsChanged: boolean) => void;
    lastFetchParams: { timeRange: string; minSize: number };
    setLastFetchParams: (params: { timeRange: string; minSize: number }) => void;
}

export default function ControlsPanel({ timeRange, setTimeRange, startDate, setStartDate, minSize, setMinSize, formatMinSize, handleMinSizeChange, isMobile, setIsMobile }: ControlsPanelProps) {
    const [minSizeDisplay, setMinSizeDisplay] = useState('0');


    useEffect(() => {
        const handleResize = () => {
          setIsMobile(window.innerWidth <= 768);
        };
    
        window.addEventListener('resize', handleResize);
        return () => {
          window.removeEventListener('resize', handleResize);
        };
      }, []);

    return (
        <>
        
        <div className='controls-panel' style={{
          backgroundColor: '#1F2937',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          height: isMobile ? 'auto' : '100%',
          overflow: 'auto'
        }}>
          <div style={{
            marginBottom: '16px'
          }}>
            <button 
              onClick={() => {
                console.log("Back to Account button clicked");
                return null;
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#1F2937',
                color: '#E5E7EB',
                border: '1px solid #374151',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              Back to Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div style={{ 
            fontSize: '18px', 
            fontWeight: 600, 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#E5E7EB',
            padding: '0 4px'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V13.2M3 13.2V6.2C3 5.07989 3 4.51984 3.21799 4.09202C3.40973 3.71569 3.71569 3.40973 4.09202 3.21799C4.51984 3 5.07989 3 6.2 3H17.8C18.9201 3 19.4802 3 19.908 3.21799C20.2843 3.40973 20.5903 3.71569 20.782 4.09202C21 4.51984 21 5.07989 21 6.2V13.2M3 13.2H21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 17L7 15M12 17V13M17 17V11" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Trade Analytics
          </div>
          
          <div className='control-group'>
            <label style={{ 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: 500,
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Time Range
              <div 
              
                title="Select a predefined time range or choose 'Custom' for a specific date"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#4B5563',
                  color: '#E5E7EB',
                  fontSize: '10px',
                  cursor: 'help'
                }}
              >
                ?
              </div>
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
                gridTemplateRows: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                gap: '6px'
              }}>
                {(['1D', '1W', '1M', '3M', '6M', '1Y', 'YTD', 'Custom'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => handleTimeRangeChange(range)}
                    title={
                      range === '1D' ? 'Last 24 hours' :
                      range === '1W' ? 'Last 7 days' :
                      range === '1M' ? 'Last 30 days' :
                      range === '3M' ? 'Last 90 days' :
                      range === '6M' ? 'Last 180 days' :
                      range === '1Y' ? 'Last 365 days' :
                      range === 'YTD' ? 'Year to date' :
                      'Select custom date'
                    }
                    style={{
                      padding: isMobile ? '8px 4px' : '6px 8px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: timeRange === range ? 600 : 400,
                      backgroundColor: timeRange === range ? '#10B981' : '#2D3748',
                      color: timeRange === range ? '#111827' : '#E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px'
                    }}
                  >
                    <span>{range}</span>
                    {range !== 'Custom' && !isMobile && (
                      <span style={{ 
                        fontSize: '9px', 
                        opacity: 0.8,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}>
                        {range === '1D' && '24h'}
                        {range === '1W' && '7d'}
                        {range === '1M' && '30d'}
                        {range === '3M' && '90d'}
                        {range === '6M' && '180d'}
                        {range === '1Y' && '365d'}
                        {range === 'YTD' && 'Jan 1st'}
                      </span>
                    )}
                    {range === 'Custom' && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke={timeRange === 'Custom' ? '#111827' : '#E5E7EB'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              
              {timeRange === 'Custom' && (
                <div style={{ marginTop: '4px' }}>
                  <input 
                    type="date" 
                    id="start" 
                    name="trip-start"
                    value={startDate}
                    className="padding-left-10"
                    onChange={(e) => {
                      setStartDate(e.target.value);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      border: '1px solid #2D3748',
                      borderRadius: '6px',
                      fontSize: '13px',
                      backgroundColor: '#1F2937',
                      color: '#E5E7EB',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className='control-group'>
            <label style={{ 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: 500,
              color: '#9CA3AF',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              Min Shares
              <div 
                title="Set minimum number of shares per trade"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#4B5563',
                  color: '#E5E7EB',
                  fontSize: '10px',
                  cursor: 'help'
                }}
              >
                ?
              </div>
            </label>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, 1fr)',
                gridTemplateRows: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                gap: '6px'
              }}>
                {['0', '50', '100', '200', '300', '500', '750', '1000'].map((sizePreset) => (
                  <button
                    key={sizePreset}
                    onClick={() => handleMinSizeChange(sizePreset)}
                    title={`Set minimum shares to ${sizePreset}`}
                    style={{
                      padding: isMobile ? '8px 4px' : '6px 8px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: minSizeDisplay === sizePreset ? 600 : 400,
                      backgroundColor: minSizeDisplay === sizePreset ? '#10B981' : '#2D3748',
                      color: minSizeDisplay === sizePreset ? '#111827' : '#E5E7EB',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {sizePreset}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '100%',
                      height: '2px',
                      backgroundColor: minSizeDisplay === sizePreset ? '#111827' : '#4B5563',
                      opacity: 0.5
                    }} />
                  </button>
                ))}
              </div>
              
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: isMobile ? '10px' : '16px',
                position: 'relative',
                padding: isMobile ? '0 2px' : '0 4px',
                marginTop: isMobile ? '8px' : '20px',
                marginBottom: isMobile ? '8px' : '12px'
              }}>
                {/* Slider tick marks and labels */}
                <div style={{
                  position: 'relative',
                  height: '24px',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: '0',
                    left: '0',
                    right: isMobile ? '80px' : '100px', // Adjust for the input width
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: isMobile ? '9px' : '11px',
                    color: '#9CA3AF',
                    paddingLeft: '2px',
                    paddingRight: '2px'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1px', height: '6px', backgroundColor: '#4B5563', marginBottom: '4px' }}></div>
                      <span>0</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1px', height: '6px', backgroundColor: '#4B5563', marginBottom: '4px' }}></div>
                      <span>250</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1px', height: '6px', backgroundColor: '#4B5563', marginBottom: '4px' }}></div>
                      <span>500</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1px', height: '6px', backgroundColor: '#4B5563', marginBottom: '4px' }}></div>
                      <span>750</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '1px', height: '6px', backgroundColor: '#4B5563', marginBottom: '4px' }}></div>
                      <span>1000</span>
                    </div>
                  </div>
                </div>
                
                {/* Slider and input container */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  gap: isMobile ? '10px' : '16px',
                  height: '32px'
                }}>
                  {/* Custom styled slider track and thumb */}
                  <div style={{
                    position: 'relative',
                    flex: 1,
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 8px'
                  }}>
                    {/* Slider background track */}
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      right: '8px',
                      height: '6px',
                      backgroundColor: '#2D3748',
                      borderRadius: '6px'
                    }}></div>
                    
                    {/* Slider filled track */}
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      width: `calc(${(minSize / 1000) * 100}% - 8px)`,
                      height: '6px',
                      backgroundColor: '#10B981',
                      borderRadius: '6px',
                      transition: 'width 0.1s ease-out'
                    }}></div>
                    
                    {/* Actual range input (invisible but functional) */}
                    <input 
                      type="range" 
                      id="minSizeSlider" 
                      min="0"
                      max="1000"
                      step={isMobile ? '50' : '10'}
                      value={minSize}
                      onChange={(e) => {
                        const newValue = Number(e.target.value);
                        handleMinSizeChange(formatMinSize(newValue));
                      }}
                      style={{
                        position: 'absolute',
                        left: '8px',
                        right: '8px',
                        width: 'calc(100% - 16px)',
                        height: '24px',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 2,
                        margin: 0
                      }}
                    />
                    
                    {/* Custom thumb */}
                    <div style={{
                      position: 'absolute',
                      left: `calc(${(minSize / 1000) * 100}%)`,
                      transform: 'translateX(-50%)',
                      width: '18px',
                      height: '18px',
                      backgroundColor: '#10B981',
                      borderRadius: '50%',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      pointerEvents: 'none',
                      zIndex: 1,
                      transition: 'left 0.1s ease-out, transform 0.1s ease-out, box-shadow 0.2s ease',
                      border: '2px solid #0D9668'
                    }}></div>
                    
                    {/* Current value tooltip */}
                    {minSize > 0 && (
                      <div style={{
                        position: 'absolute',
                        left: `calc(${(minSize / 1000) * 100}%)`,
                        bottom: '28px',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#10B981',
                        color: '#111827',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        opacity: 0.95,
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                      }}>
                        {formatMinSize(minSize)} shares
                      </div>
                    )}
                    
                    {/* Subtle tick marks for better visual guidance */}
                    {[0, 0.25, 0.5, 0.75, 1].map((position) => (
                      <div 
                        key={position}
                        style={{
                          position: 'absolute',
                          left: `calc(${position * 100}%)`,
                          height: '10px',
                          width: '1px',
                          backgroundColor: '#4B5563',
                          opacity: 0.5,
                          pointerEvents: 'none'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Text input */}
                  <div style={{
                    position: 'relative',
                    width: isMobile ? '80px' : '100px'
                  }}>
                    <input 
                      type="number" 
                      id="minSize" 
                      name="min-shares"
                      value={minSizeDisplay}
                      onChange={(e) => handleMinSizeChange(e.target.value)}
                      onFocus={(e) => {
                        e.target.select();
                        setIsMinSizeFocused(true);
                      }}
                      onBlur={() => setIsMinSizeFocused(false)}
                      placeholder="Shares"
                      min="0"
                      max="1000"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        border: `1px solid ${isMinSizeFocused ? '#10B981' : '#2D3748'}`,
                        borderRadius: '6px',
                        fontSize: '13px',
                        backgroundColor: '#1F2937',
                        color: '#E5E7EB',
                        outline: 'none',
                        textAlign: 'right',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                        boxShadow: isMinSizeFocused ? '0 0 0 1px #10B981' : 'none'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      left: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                      fontSize: '10px',
                      color: '#9CA3AF',
                      opacity: 0.7
                    }}>
                      Shares
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className='control-group'>
            <label style={{ 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: 500,
              color: '#9CA3AF'
            }}>
              Aggregation
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px'
            }}>
              {(['Daily', 'Weekly', 'Monthly', 'Quarterly'] as const).map((agg) => (
                <button
                  key={agg}
                  onClick={() => setAggregation(agg)}
                  
                  style={{
                    padding: '6px 8px',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: aggregation === agg ? 600 : 400,
                    backgroundColor: aggregation === agg ? '#10B981' : '#2D3748',
                    color: aggregation === agg ? '#111827' : '#E5E7EB',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center'
                  }}
                >
                  {agg}
                </button>
              ))}
            </div>
          </div>
          
          <div className='control-group'>
            <label style={{ 
              marginBottom: '6px', 
              fontSize: '13px', 
              fontWeight: 500,
              color: '#9CA3AF'
            }}>
              Chart Type
            </label>
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              width: '100%' 
            }}>
              <button 
                onClick={() => setChart('BarChart')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: chart === 'BarChart' ? 600 : 400,
                  backgroundColor: chart === 'BarChart' ? '#10B981' : '#2D3748',
                  color: chart === 'BarChart' ? '#111827' : '#E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 20V10M12 20V4M18 20V14" stroke={chart === 'BarChart' ? '#111827' : '#E5E7EB'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Bar
              </button>
              <button 
                onClick={() => setChart('TreeMap')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: chart === 'TreeMap' ? 600 : 400,
                  backgroundColor: chart === 'TreeMap' ? '#10B981' : '#2D3748',
                  color: chart === 'TreeMap' ? '#111827' : '#E5E7EB',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              padding: '10px',
              backgroundColor: '#10B981',
              color: '#111827',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 0.2s ease',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6M12 18V22M6 12H2M22 12H18M19.0784 19.0784L16.25 16.25M19.0784 4.92157L16.25 7.75M4.92157 19.0784L7.75 16.25M4.92157 4.92157L7.75 7.75" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16M8 12H16" stroke="#E5E7EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {paramsChanged ? 'Refresh Trades' : 'Fetch Trades'}
              </>
            )}
          </button>
          
          <div style={{ marginTop: 'auto', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '12px', color: '#9CA3AF', textAlign: 'center' }}>
            Trade Analytics Dashboard v1.0
          </div>
        </div></>
    )
}