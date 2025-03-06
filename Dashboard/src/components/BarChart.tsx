import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AggregatedTradeData } from '../utils/aggregationUtils';

interface BarChartProps {
  data: AggregatedTradeData[];
  width: number;
  height: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, width, height }) => {
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
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

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

    // Create axes
    const xAxis = svg
      .append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x))
      .attr('color', '#9CA3AF');

    xAxis.selectAll('text')
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px')
      .style('fill', '#9CA3AF');

    const yAxis = svg
      .append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d => d3.format('~s')(d as number)))
      .attr('color', '#9CA3AF');

    yAxis.selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#9CA3AF');

    // Add grid lines
    svg.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(y)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .attr('color', 'rgba(255, 255, 255, 0.05)');

    // Add Y axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -innerHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('fill', '#9CA3AF')
      .style('font-size', '13px')
      .text('Trade Size');

    // Add X axis label
    svg.append('text')
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
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.period) as number)
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.totalTradeSize))
      .attr('height', d => innerHeight - y(d.totalTradeSize))
      .attr('fill', '#4F46E5')
      .attr('rx', 4)
      .attr('opacity', 0.8)
      .on('mouseover', function(event, d) {
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
              <div>Trades: ${d.tradeCount.toLocaleString()}</div>
              <div>Avg Price: $${d.averagePrice.toFixed(2)}</div>
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
          .attr('opacity', 0.8)
          .attr('fill', '#4F46E5');
        
        tooltip.style('visibility', 'hidden');
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

export default BarChart; 