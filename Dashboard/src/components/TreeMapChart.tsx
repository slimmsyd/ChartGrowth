import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData } from '../utils/aggregationUtils';

interface TreeMapChartProps {
  data: AggregatedTradeData[];
  width: number;
  height: number;
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({ data, width, height }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

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

    // Prepare data for treemap
    const treeMapData = data.map(item => {
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
      .sum(d => (d as any).totalSize)
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

    // Create cells
    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);

    // Add rectangles
    cell
      .append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => colorScale((d.data as any).symbol))
      .attr('opacity', 0.85)
      .attr('rx', 4)
      .style('stroke', 'rgba(255, 255, 255, 0.1)')
      .style('stroke-width', 1)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('opacity', 1);
        
        const data = d.data as any;
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
      .text(d => (d.data as any).symbol);

    // Add size labels
    cell
      .append('text')
      .attr('x', 4)
      .attr('y', 30)
      .style('font-size', '11px')
      .style('fill', 'rgba(255, 255, 255, 0.8)')
      .style('pointer-events', 'none')
      .text(d => {
        const size = (d.data as any).totalSize;
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
  }, [data, width, height]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef} width={width} height={height} />
    </div>
  );
};

export default TreeMapChart; 