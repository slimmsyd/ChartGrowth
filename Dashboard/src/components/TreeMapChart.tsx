import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData } from '../utils/aggregationUtils';

interface TreeMapChartProps {
  data: AggregatedTradeData[];
  width?: number;
  height?: number;
}

interface TreeMapData {
  name: string;
  value: number;
  formattedValue: string;
  color?: string;
}

const TreeMapChart: React.FC<TreeMapChartProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Color scale for different symbols
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Transform data for treemap
    const treeMapData: TreeMapData[] = [];
    
    data.forEach(period => {
      Object.entries(period.symbols).forEach(([symbol, count]) => {
        // Find if this symbol already exists in our data
        const existingSymbol = treeMapData.find(item => item.name === symbol);
        
        if (existingSymbol) {
          existingSymbol.value += count;
        } else {
          treeMapData.push({
            name: symbol,
            value: count,
            formattedValue: `${symbol}: ${count} trades`,
            color: colorScale(symbol) as string
          });
        }
      });
    });
    
    // Sort by value (descending)
    treeMapData.sort((a, b) => b.value - a.value);
    
    // Create hierarchy
    const root = d3.hierarchy({ children: treeMapData })
      .sum(d => (d as any).value)
      .sort((a, b) => b.value! - a.value!);
    
    // Create treemap layout
    const treemap = d3.treemap<TreeMapData>()
      .size([width, height])
      .padding(2)
      .round(true);
    
    // Apply layout
    treemap(root as unknown as d3.HierarchyNode<TreeMapData>);
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('background', '#f8f9fa')
      .style('border-radius', '8px');
    
    // Create cells
    const cell = svg.selectAll('g')
      .data(root.leaves())
      .join('g')
      .attr('transform', d => `translate(${d.x0},${d.y0})`);
    
    // Add rectangles
    cell.append('rect')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('fill', d => (d.data as any).color || '#69b3a2')
      .attr('stroke', '#fff')
      .attr('rx', 4)
      .attr('ry', 4)
      .style('opacity', 0.85);
    
    // Add text labels
    cell.append('text')
      .attr('x', 5)
      .attr('y', 15)
      .attr('fill', '#fff')
      .attr('font-weight', 'bold')
      .text(d => d.data.name)
      .style('font-size', '12px')
      .style('pointer-events', 'none');
    
    cell.append('text')
      .attr('x', 5)
      .attr('y', 30)
      .attr('fill', '#fff')
      .text(d => `${d.value} trades`)
      .style('font-size', '10px')
      .style('pointer-events', 'none');
    
    // Add tooltips
    cell.append('title')
      .text(d => `${d.data.name}\nTrades: ${d.value}`);
    
  }, [data, width, height, colorScale]);
  
  return (
    <div className="treemap-container" style={{ 
      background: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      padding: '16px'
    }}>
      <h3 style={{ 
        margin: '0 0 16px 0', 
        fontSize: '18px', 
        fontWeight: 600, 
        color: '#333'
      }}>
        Trade Volume by Symbol
      </h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default TreeMapChart; 