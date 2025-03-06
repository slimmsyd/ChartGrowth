import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData } from '../utils/aggregationUtils';
import { BarChartProps } from '../models/BarChartProps';

/**
 * BarChart Component
 * 
 * A React component that renders a D3-based bar chart visualization for trade data.
 * The chart displays both bar chart of trade sizes and an optional cumulative line chart.
 * 
 * Features:
 * - Interactive bar chart showing trade sizes over time periods
 * - Optional cumulative line chart overlay
 * - Zoom and pan capabilities for data exploration
 * - Responsive design that adapts to container dimensions
 * - Tooltip with detailed information on hover
 * 
 * Props:
 * - data: Array of AggregatedTradeData containing period and trade size information
 * - width: Width of the chart container in pixels
 * - height: Height of the chart container in pixels
 * 
 * The component uses D3.js for rendering and handles data updates, zooming,
 * and window resizing efficiently through React hooks.
 */


// Extended interface for data with cumulative totals
interface CumulativeTradeData extends AggregatedTradeData {
  cumulativeTotal: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [showCumulativeLine, setShowCumulativeLine] = useState<boolean>(true);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [chartWidth, setChartWidth] = useState<number>(width);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setChartWidth(Math.max(window.innerWidth - 300, 1150));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update chart width when prop changes
  useEffect(() => {
    setChartWidth(width);
  }, [width]);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins with increased right margin for more space
    const margin = { top: 20, right: 100, bottom: 60, left: 80 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', chartWidth)
      .attr('height', height);
      
    // Create a clip path to ensure elements don't render outside the chart area
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'chart-area-clip')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', innerWidth)
      .attr('height', innerHeight);
      
    // Create a group for all chart elements that will be transformed during zoom/pan
    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    // Create a group for elements that should be clipped
    const clippedGroup = chartGroup.append('g')
      .attr('clip-path', 'url(#chart-area-clip)');

    // Calculate cumulative data for the line chart
    let runningTotal = 0;
    const cumulativeData: CumulativeTradeData[] = data.map(d => {
      runningTotal += d.totalTradeSize;
      return {
        ...d,
        cumulativeTotal: runningTotal
      };
    });

    // Create scales
    const x = d3
      .scaleBand()
      .domain(data.map(d => d.period))
      .range([0, innerWidth])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d.totalTradeSize) as number * 1.1])
      .range([innerHeight, 0]);
      
    // Create scale for cumulative line
    const yLine = d3
      .scaleLinear()
      .domain([0, d3.max(cumulativeData, d => d.cumulativeTotal) || 0 * 1.05])
      .range([innerHeight, 0]);
      
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 10]) // Limit zoom scale from 1x to 10x
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on('zoom', (event) => {
        // Update zoom state
        setIsZoomed(event.transform.k > 1 || event.transform.x !== 0);
        
        // Get the new transform
        const newTransform = event.transform;
        
        // Create new scales based on the zoom transform
        const newX = newTransform.rescaleX(x);
        
        // Update the x-axis with dynamic tick display
        updateXAxis(xAxis, newX, newTransform.k);
        
        // Update the bars
        clippedGroup.selectAll<SVGRectElement, CumulativeTradeData>('.bar')
          .attr('x', (d) => newX(d.period) as number)
          .attr('width', newX.bandwidth());
        
        // Update the line if it exists
        if (showCumulativeLine) {
          // Update line generator with new x scale
          const newLine = d3.line<CumulativeTradeData>()
            .x(d => (newX(d.period) as number) + newX.bandwidth() / 2)
            .y(d => yLine(d.cumulativeTotal))
            .curve(d3.curveMonotoneX);
          
          // Update the path
          clippedGroup.select('.cumulative-line')
            .attr('d', newLine as any);
          
          // Update the points
          clippedGroup.selectAll<SVGCircleElement, CumulativeTradeData>('.line-point')
            .attr('cx', (d) => (newX(d.period) as number) + newX.bandwidth() / 2);
        }
      });
      
    // Apply zoom behavior to the SVG
    svg.call(zoom);
    
    // Double-click to reset zoom
    svg.on('dblclick', function() {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    });

    // Helper function to update x-axis with dynamic tick display
    const updateXAxis = (axis: d3.Selection<SVGGElement, unknown, null, undefined>, scale: d3.ScaleBand<string>, zoomLevel: number) => {
      // Determine how many ticks to show based on data length and zoom level
      const tickValues = getTickValues(data.map(d => d.period), zoomLevel);
      
      // Create a custom axis that only shows the selected ticks
      const customAxis = d3.axisBottom(scale)
        .tickValues(tickValues);
      
      // Update the axis
      axis.call(customAxis);
      
      // Style the ticks
      axis.selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-45)')
        .style('font-size', '12px')
        .style('fill', '#9CA3AF');
    };
    
    // Helper function to determine which ticks to show
    const getTickValues = (allPeriods: string[], zoomLevel: number): string[] => {
      const totalPeriods = allPeriods.length;
      
      // If we have a reasonable number of periods or we're zoomed in, show more ticks
      if (totalPeriods <= 20 || zoomLevel > 2) {
        return allPeriods;
      }
      
      // For large datasets, show fewer ticks based on the total number
      let interval: number;
      if (totalPeriods > 300) {
        interval = Math.ceil(totalPeriods / 12); // For yearly view, show ~12 ticks (monthly)
      } else if (totalPeriods > 100) {
        interval = Math.ceil(totalPeriods / 20); // For quarterly view, show ~20 ticks
      } else if (totalPeriods > 50) {
        interval = Math.ceil(totalPeriods / 25); // For monthly view, show ~25 ticks
      } else {
        interval = Math.ceil(totalPeriods / 30); // For weekly view, show ~30 ticks
      }
      
      // Select ticks at regular intervals
      return allPeriods.filter((_, i) => i % interval === 0);
    };

    // Create axes
    const xAxis = chartGroup
      .append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .attr('color', '#9CA3AF');
      
    // Initialize x-axis with dynamic tick display
    updateXAxis(xAxis, x, 1);

    const yAxis = chartGroup
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format('~s')(d as number)))
      .attr('color', '#9CA3AF');

    yAxis.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#9CA3AF');
      
    // Add right y-axis for cumulative line (only if showing cumulative line)
    let yAxisRight;
    if (showCumulativeLine) {
      yAxisRight = chartGroup
        .append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(d3.axisRight(yLine).ticks(5).tickFormat(d => d3.format('~s')(d as number)))
        .attr('color', '#9CA3AF');
        
      yAxisRight.selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#9CA3AF');
        
      // Add right y-axis label
      chartGroup.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -chartWidth + margin.right)
        .attr('x', innerHeight / 2)
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .style('fill', '#9CA3AF')
        .style('font-size', '13px')
        .text('Cumulative Trade Size');
    }

    // Add grid lines
    chartGroup.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('color', 'rgba(255, 255, 255, 0.05)');

    // Add Y axis label
    chartGroup.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '13px')
      .text('Trade Size');

    // Add X axis label
    chartGroup.append('text')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 50})`)
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '13px')
      .text('Period');

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background-color', '#1F2937')
      .style('color', '#E5E7EB')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '13px')
      .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.3)')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '10');

    // Create bars
    clippedGroup.selectAll<SVGRectElement, CumulativeTradeData>('.bar')
      .data(cumulativeData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: CumulativeTradeData) => x(d.period) as number)
      .attr('width', x.bandwidth())
      .attr('y', (d: CumulativeTradeData) => y(d.totalTradeSize))
      .attr('height', (d: CumulativeTradeData) => innerHeight - y(d.totalTradeSize))
      .attr('fill', '#4F46E5')
      .attr('rx', 4)
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d: CumulativeTradeData) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .attr('fill', '#6366F1');
        
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${d.period}</div>
              <div>Trade Size: ${d.totalTradeSize.toLocaleString()}</div>
              ${showCumulativeLine ? `<div>Cumulative: ${d.cumulativeTotal.toLocaleString()}</div>` : ''}
              <div>Trades: ${d.tradeCount.toLocaleString()}</div>
              <div>Avg Price: $${d.averagePrice.toFixed(2)}</div>
            </div>
          `)
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.8)
          .attr('fill', '#4F46E5');
        
        tooltip.style('visibility', 'hidden');
      });
      
    // Only add the cumulative line if showCumulativeLine is true
    if (showCumulativeLine) {
      // Create line generator
      const line = d3.line<CumulativeTradeData>()
        .x(d => (x(d.period) as number) + x.bandwidth() / 2)
        .y(d => yLine(d.cumulativeTotal))
        .curve(d3.curveMonotoneX);
        
      // Add a drop shadow filter for the line
      svg.append("defs")
        .append("filter")
        .attr("id", "glow")
        .append("feGaussianBlur")
        .attr("stdDeviation", "2.5")
        .attr("result", "coloredBlur");
      
      const filter = svg.select("#glow")
        .append("feMerge");
      
      filter.append("feMergeNode")
        .attr("in", "coloredBlur");
      filter.append("feMergeNode")
        .attr("in", "SourceGraphic");
        
      // Add the line path with enhanced styling
      const path = clippedGroup.append('path')
        .datum(cumulativeData)
        .attr('class', 'cumulative-line')
        .attr('fill', 'none')
        .attr('stroke', '#10B981')
        .attr('stroke-width', 3.5)
        .attr('stroke-linecap', 'round')
        .attr('stroke-linejoin', 'round')
        .attr('filter', 'url(#glow)')
        .attr('d', line);
      
      // Add animated dash effect for visibility
      const totalLength = path.node()?.getTotalLength() || 0;
      path.attr("stroke-dasharray", totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", 0);
        
      // Add gradient to make the line more visually appealing
      const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", "line-gradient")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", innerHeight)
        .attr("x2", 0)
        .attr("y2", 0);
        
      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#059669");
        
      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#10B981");
      
      path.attr('stroke', 'url(#line-gradient)');
        
      // Add line points with improved visibility
      const points = clippedGroup.selectAll<SVGCircleElement, CumulativeTradeData>('.line-point')
        .data(cumulativeData)
        .enter()
        .append('circle')
        .attr('class', 'line-point')
        .attr('cx', (d) => (x(d.period) as number) + x.bandwidth() / 2)
        .attr('cy', (d) => yLine(d.cumulativeTotal))
        .attr('r', 0) // Start with radius 0 for animation
        .attr('fill', '#10B981')
        .attr('stroke', '#064E3B')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .style('filter', 'url(#glow)')
        .transition() // Animate the points appearing
        .delay((_, i) => i * (1000 / cumulativeData.length))
        .duration(300)
        .attr('r', (d, i) => {
          // Make key points (first, last, and local maxima) larger
          if (i === 0 || i === cumulativeData.length - 1) return 6;
          
          // Check if this is a local maximum
          if (i > 0 && i < cumulativeData.length - 1) {
            const prev = cumulativeData[i-1].cumulativeTotal;
            const curr = d.cumulativeTotal;
            const next = cumulativeData[i+1].cumulativeTotal;
            
            if (curr > prev && curr > next) return 6;
          }
          
          // For points with significant jumps
          if (i > 0) {
            const change = d.cumulativeTotal - cumulativeData[i-1].cumulativeTotal;
            const percentChange = change / cumulativeData[i-1].cumulativeTotal;
            if (percentChange > 0.1) return 6; // 10% jump
          }
          
          // Reduce the number of visible points for better readability
          // Show fewer points when there are many data points
          if (cumulativeData.length > 50) {
            // For large datasets, only show every nth point
            const interval = Math.ceil(cumulativeData.length / 30);
            return i % interval === 0 ? 5 : 0;
          }
          
          return 5;
        });
      
      // Re-add event listeners after the transition
      clippedGroup.selectAll<SVGCircleElement, CumulativeTradeData>('.line-point')
        .on('mouseover', function(event, d: CumulativeTradeData) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('stroke-width', 3);
            
          // Enhanced tooltip with more information
          tooltip
            .style('visibility', 'visible')
            .html(`
              <div style="min-width: 180px;">
                <div style="font-weight: 600; margin-bottom: 6px; font-size: 14px; color: #10B981;">${d.period}</div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Cumulative:</span>
                  <span style="font-weight: 600;">${d.cumulativeTotal.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Period Size:</span>
                  <span style="font-weight: 600;">${d.totalTradeSize.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Avg Price:</span>
                  <span style="font-weight: 600;">$${d.averagePrice.toFixed(2)}</span>
                </div>
              </div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('top', (event.pageY - 10) + 'px')
            .style('left', (event.pageX + 10) + 'px');
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', function(d: unknown, i: number) {
              // Cast the unknown datum to our expected type
              const datum = d as CumulativeTradeData;
              
              // Maintain the same sizing logic as in the initial rendering
              if (i === 0 || i === cumulativeData.length - 1) return 6;
              
              if (i > 0 && i < cumulativeData.length - 1) {
                const prev = cumulativeData[i-1].cumulativeTotal;
                const curr = datum.cumulativeTotal;
                const next = cumulativeData[i+1].cumulativeTotal;
                
                if (curr > prev && curr > next) return 6;
              }
              
              if (i > 0) {
                const change = datum.cumulativeTotal - cumulativeData[i-1].cumulativeTotal;
                const percentChange = change / cumulativeData[i-1].cumulativeTotal;
                if (percentChange > 0.1) return 6;
              }
              
              if (cumulativeData.length > 50) {
                const interval = Math.ceil(cumulativeData.length / 30);
                return i % interval === 0 ? 5 : 0;
              }
              
              return 5;
            })
            .attr('stroke-width', 2);
            
          tooltip.style('visibility', 'hidden');
        });
        
      // Add area under the line for better visual emphasis
      const area = d3.area<CumulativeTradeData>()
        .x(d => (x(d.period) as number) + x.bandwidth() / 2)
        .y0(innerHeight)
        .y1(d => yLine(d.cumulativeTotal))
        .curve(d3.curveMonotoneX);
        
      clippedGroup.append('path')
        .datum(cumulativeData)
        .attr('class', 'cumulative-area')
        .attr('fill', 'url(#line-gradient)')
        .attr('fill-opacity', 0.1)
        .attr('d', area);
    }
      
    // Add legend
    const legend = chartGroup.append('g')
      .attr('transform', `translate(${innerWidth + 20}, 0)`);
      
    // Bar legend
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', '#4F46E5')
      .attr('rx', 2);
      
    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text('Period Trade Size')
      .style('font-size', '12px')
      .style('fill', '#9CA3AF');
      
    // Line legend (only if showing cumulative line)
    if (showCumulativeLine) {
      // Enhanced legend for cumulative line
      const lineLegend = legend.append('g')
        .attr('transform', 'translate(0, 30)');
        
      lineLegend.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', 15)
        .attr('y2', 0)
        .attr('stroke', 'url(#line-gradient)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round');
        
      lineLegend.append('circle')
        .attr('cx', 7.5)
        .attr('cy', 0)
        .attr('r', 4)
        .attr('fill', '#10B981')
        .attr('stroke', '#064E3B')
        .attr('stroke-width', 1);
        
      lineLegend.append('text')
        .attr('x', 20)
        .attr('y', 4)
        .text('Cumulative Total')
        .style('font-size', '12px')
        .style('fill', '#9CA3AF');
    }

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, chartWidth, height, showCumulativeLine]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 10, 
        right: 10, 
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(31, 41, 55, 0.7)',
        padding: '6px 10px',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <label 
          htmlFor="toggle-cumulative" 
          style={{ 
            marginRight: '8px', 
            fontSize: '13px',
            color: '#E5E7EB',
            userSelect: 'none',
            cursor: 'pointer'
          }}
        >
          Show Cumulative Line
        </label>
        <div 
          style={{ 
            position: 'relative',
            width: '36px',
            height: '20px'
          }}
        >
          <input
            id="toggle-cumulative"
            type="checkbox"
            checked={showCumulativeLine}
            onChange={() => setShowCumulativeLine(!showCumulativeLine)}
            style={{
              opacity: 0,
              width: '100%',
              height: '100%',
              position: 'absolute',
              zIndex: 1,
              cursor: 'pointer'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: showCumulativeLine ? '#10B981' : '#4B5563',
              borderRadius: '20px',
              transition: 'background-color 0.2s',
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '2px',
                left: showCumulativeLine ? '18px' : '2px',
                width: '16px',
                height: '16px',
                backgroundColor: 'white',
                borderRadius: '50%',
                transition: 'left 0.2s',
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Zoom instructions */}
      {/* <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        zIndex: 5,
        fontSize: '12px',
        color: '#9CA3AF',
        background: 'rgba(31, 41, 55, 0.7)',
        padding: '6px 10px',
        borderRadius: '6px',
        opacity: isZoomed ? 0.3 : 0.8,
        transition: 'opacity 0.3s',
        pointerEvents: 'none',
      }}>
        <div>• Scroll to zoom in/out</div>
        <div>• Drag to pan</div>
        <div>• Double-click to reset</div>
      </div> */}
      
      <svg 
        ref={svgRef} 
        width={chartWidth} 
        height={height} 
        style={{ cursor: isZoomed ? 'move' : 'default' }}
      />
    </div>
  );
};

export default BarChart; 