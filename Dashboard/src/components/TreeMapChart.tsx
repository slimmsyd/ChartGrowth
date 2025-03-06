import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { aggregateTrades } from '../utils/aggregationUtils';
import { TreeMapChartProps } from '../models/TreeMapChartProps';

/**
 * TreeMapChart Component
 * 
 * A React component that renders a D3-based treemap visualization for stock trade data.
 * The treemap provides a hierarchical view of trade data, showing the relative sizes 
 * and distributions of trades across different stocks and time periods.
 * 
 * Features:
 * - Hierarchical visualization of trade data grouped by stock symbols
 * - Area of each rectangle proportional to trade size/volume
 * - Color coding to represent different metrics (e.g., price, trade frequency)
 * - Interactive tooltips showing detailed trade information
 * - Automatic quarterly aggregation of trade data
 * - Responsive design that adapts to container dimensions
 * 
 * Props:
 * - data: Array of aggregated trade data containing period and trade metrics
 * - width: Width of the chart container in pixels
 * - height: Height of the chart container in pixels
 * - rawTrades: Optional array of raw trade data for reaggregation
 * 
 * The component uses D3.js for rendering and handles data transformations
 * to create a hierarchical structure suitable for treemap visualization.
 * It automatically aggregates data to quarterly periods for optimal visualization
 * and comparison across time periods.
 */


// Define the TreeMapNode type to fix TypeScript errors
interface TreeMapNode extends d3.HierarchyNode<any> {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

// Define the TreeMapData interface
interface TreeMapData {
  symbol: string;
  count: number;
  period: string;
  totalSize: number;
  totalPrice: number;
  children?: TreeMapData[];  // Make children optional
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({ data, width, height, rawTrades }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    // Set margins
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add drop shadow filter for hover effect
    const defs = svg.append('defs');
    defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%')
      .append('feDropShadow')
      .attr('flood-color', 'rgba(255, 255, 255, 0.3)')
      .attr('flood-opacity', 0.3)
      .attr('dx', 0)
      .attr('dy', 0)
      .attr('stdDeviation', 4);

    // Use quarterly aggregation regardless of what's passed in
    let quarterlyData = data;
    
    // If we have raw trades and the current data is not quarterly, reaggregate to quarterly
    if (rawTrades && rawTrades.length > 0) {
      // Check if the current data is not quarterly by examining period format
      const isQuarterly = data.length > 0 && data[0].period.includes('Q');
      
      if (!isQuarterly) {
        quarterlyData = aggregateTrades(rawTrades, 'Quarterly');
      }
    }
    
    // If no data after trying to get quarterly data, show a message
    if (quarterlyData.length === 0) {
      svg.append('text')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#9CA3AF')
        .text('TreeMap is optimized for quarterly data. No quarterly data available.');
      return;
    }

    // Prepare data for treemap
    const treeMapData = quarterlyData.map(item => {
      // Extract symbol counts from the symbols object
      const symbolEntries = Object.entries(item.symbols);
      
      // Create an array of symbol data objects
      return symbolEntries.map(([symbol, count]) => ({
        symbol,
        count,
        period: item.period,
        totalSize: item.totalTradeSize / symbolEntries.length, // Approximate distribution
        totalPrice: item.averagePrice * count
      }));
    }).flat();

    // Transform data for treemap
    const root = d3.hierarchy<{children: TreeMapData[]}>({ children: treeMapData })
      .sum(d => {
        // Check if this is a leaf node with totalSize property
        return 'symbol' in d ? (d as unknown as TreeMapData).totalSize : 0;
      })
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    // Create treemap layout
    const treemap = d3.treemap<any>()
      .size([innerWidth, innerHeight])
      .paddingOuter(4)
      .paddingInner(2)
      .round(true);

    treemap(root);

    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(treeMapData.map(d => d.symbol))
      .range([
        '#4F46E5', '#10B981', '#EC4899', '#F59E0B', '#6366F1', 
        '#8B5CF6', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
        '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
      ]);

    // Create tooltip
    const tooltip = d3.select('body')
      .append('div')
      .attr('class', 'treemap-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('opacity', 0)
      .style('background-color', '#1F2937')
      .style('color', '#E5E7EB')
      .style('padding', '12px 16px')
      .style('border-radius', '8px')
      .style('font-size', '13px')
      .style('box-shadow', '0 6px 16px rgba(0, 0, 0, 0.4)')
      .style('border', '1px solid rgba(255, 255, 255, 0.1)')
      .style('pointer-events', 'none')
      .style('z-index', '10')
      .style('max-width', '280px');

    // Add a title indicating this is quarterly data
    svg.append('text')
      .attr('x', 10)
      .attr('y', 20)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', '#9CA3AF')
      .text('Quarterly Trade Distribution');

    // Create cells
    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${(d as TreeMapNode).x0},${(d as TreeMapNode).y0})`);

    // Add rectangles
    cell
      .append('rect')
      .attr('width', d => (d as TreeMapNode).x1 - (d as TreeMapNode).x0)
      .attr('height', d => (d as TreeMapNode).y1 - (d as TreeMapNode).y0)
      .attr('fill', d => {
        // Ensure we're accessing the symbol property safely
        const nodeData = d.data as TreeMapData;
        return colorScale(nodeData.symbol);
      })
      .attr('opacity', 0.85)
      .attr('rx', 4)
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', 1)
      .style('cursor', 'pointer')
      .style('transition', 'all 0.2s ease-in-out')
      .on('mouseover', function(event, d) {
        // First cast to unknown, then to the correct type
        const node = d as unknown as d3.HierarchyNode<TreeMapData>;
        const data = node.data;
        
        // Highlight the hovered rectangle
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1)
          .style('stroke', 'rgba(255, 255, 255, 0.3)')
          .style('stroke-width', 2)
          .attr('filter', 'url(#drop-shadow)')
          .attr('transform', 'scale(1.02)');
        
        // Calculate percentage of total for this period
        const periodTotal = quarterlyData.find(q => q.period === data.period)?.totalTradeSize || 0;
        const percentage = periodTotal > 0 ? ((data.totalSize / periodTotal) * 100).toFixed(1) : '0';
        
        // Calculate average trade size
        const avgTradeSize = data.count > 0 ? (data.totalSize / data.count).toFixed(0) : '0';
        
        // Format the period for better readability
        const formattedPeriod = data.period.replace('Q', ' Quarter ');
        
        // Set the tooltip content first
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600; font-size: 15px; margin-bottom: 8px; color: ${colorScale(data.symbol)}; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 6px;">
                ${data.symbol}
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #9CA3AF;">Period:</span>
                <span style="font-weight: 500;">${formattedPeriod}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #9CA3AF;">Total Volume:</span>
                <span style="font-weight: 500;">${data.totalSize.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #9CA3AF;">% of Period:</span>
                <span style="font-weight: 500;">${percentage}%</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #9CA3AF;">Trade Count:</span>
                <span style="font-weight: 500;">${data.count.toLocaleString()}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span style="color: #9CA3AF;">Avg Trade Size:</span>
                <span style="font-weight: 500;">${avgTradeSize}</span>
              </div>
              
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #9CA3AF;">Avg Price:</span>
                <span style="font-weight: 500; color: #10B981;">$${(data.totalPrice / data.count).toFixed(2)}</span>
              </div>
            </div>
          `);
          
        // Then animate the opacity
        tooltip
          .style('opacity', 1)
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 0.85)
          .style('stroke', 'rgba(255, 255, 255, 0.1)')
          .style('stroke-width', 1)
          .attr('filter', null)
          .attr('transform', null);
        
        // Hide tooltip immediately
        tooltip
          .style('opacity', 0)
          .style('visibility', 'hidden');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('top', (event.pageY - 10) + 'px')
          .style('left', (event.pageX + 10) + 'px');
      });

    // Add text labels
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 14)
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', 'white')
      .style('pointer-events', 'none')
      .text(d => (d.data as TreeMapData).symbol);

    // Add size labels
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 30)
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('pointer-events', 'none')
      .text(d => {
        const size = (d.data as TreeMapData).totalSize;
        if (size >= 1000000) {
          return `${(size / 1000000).toFixed(1)}M`;
        } else if (size >= 1000) {
          return `${(size / 1000).toFixed(1)}K`;
        }
        return size;
      });

    // Clean up tooltip on unmount
    return () => {
      tooltip.remove();
    };
  }, [data, width, height, rawTrades]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        padding: '4px 8px',
        background: 'rgba(31, 41, 55, 0.7)',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#9CA3AF',
      }}>
        Always showing quarterly data
      </div>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default TreeMapChart; 