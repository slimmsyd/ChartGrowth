import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData } from '../utils/aggregationUtils';

interface BarChartProps {
  data: AggregatedTradeData[];
  width?: number;
  height?: number;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  width = 800, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Set margins
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('font-family', 'Inter, system-ui, sans-serif')
      .style('background', '#f8f9fa')
      .style('border-radius', '8px');
    
    // Create chart group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X scale
    const x = d3.scaleBand()
      .domain(data.map(d => d.period))
      .range([0, innerWidth])
      .padding(0.2);
    
    // Y scale
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalTradeSize) || 0])
      .nice()
      .range([innerHeight, 0]);
    
    // Color scale
    const color = d3.scaleLinear<string>()
      .domain([0, d3.max(data, d => d.totalTradeSize) || 0])
      .range(['#69b3a2', '#276955']);
    
    // Add X axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => {
        // Truncate long period labels
        const label = d.toString();
        return label.length > 10 ? label.substring(0, 10) + '...' : label;
      }))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');
    
    // Add Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format(',.0f')(d as number)))
      .style('font-size', '12px');
    
    // Add Y axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', '#555')
      .text('Total Trade Size');
    
    // Add bars
    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.period) || 0)
      .attr('y', d => y(d.totalTradeSize))
      .attr('width', x.bandwidth())
      .attr('height', d => innerHeight - y(d.totalTradeSize))
      .attr('fill', d => color(d.totalTradeSize))
      .attr('rx', 4)
      .attr('ry', 4)
      .style('opacity', 0.85)
      .on('mouseover', function() {
        d3.select(this).style('opacity', 1);
      })
      .on('mouseout', function() {
        d3.select(this).style('opacity', 0.85);
      });
    
    // Add tooltips
    g.selectAll('.bar-value')
      .data(data)
      .join('text')
      .attr('class', 'bar-value')
      .attr('x', d => (x(d.period) || 0) + x.bandwidth() / 2)
      .attr('y', d => y(d.totalTradeSize) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', '#333')
      .text(d => d3.format(',.0f')(d.totalTradeSize));
    
  }, [data, width, height]);
  
  return (
    <div className="barchart-container" style={{ 
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
        Trade Volume by Period
      </h3>
      <svg ref={svgRef} />
    </div>
  );
};

export default BarChart; 