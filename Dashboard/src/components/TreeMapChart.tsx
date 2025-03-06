import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData, aggregateTrades } from '../utils/aggregationUtils';
import { StockTradeData } from '../models/StockTradeData';

interface TreeMapChartProps {
  data: AggregatedTradeData[];
  width: number;
  height: number;
  rawTrades?: StockTradeData[]; // Optional raw trades data
}

// Define the TreeMapNode type to fix TypeScript errors
interface TreeMapNode extends d3.HierarchyNode<any> {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
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
    const root = d3.hierarchy({ children: treeMapData })
      .sum(d => d.totalSize)
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
      .attr('fill', d => colorScale(d.data.symbol))
      .attr('opacity', 0.85)
      .attr('rx', 4)
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        const data = d.data;
        tooltip
          .style('visibility', 'visible')
          .html(`
            <div>
              <div style="font-weight: 600; margin-bottom: 4px;">${data.symbol}</div>
              <div>Trade Size: ${data.totalSize.toLocaleString()}</div>
              <div>Trades: ${data.count.toLocaleString()}</div>
              <div>Period: ${data.period}</div>
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
          .attr('opacity', 0.85);
        
        tooltip.style('visibility', 'hidden');
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
      .text(d => d.data.symbol);

    // Add size labels
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 30)
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('pointer-events', 'none')
      .text(d => {
        const size = d.data.totalSize;
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