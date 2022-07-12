import React from 'react';
import * as d3 from 'd3';
import { useState, Dispatch } from 'react';
import Select from 'react-select';
import CSS from 'csstype';
import { NumberValue } from 'd3';

const SelectStyle: CSS.Properties = {
  position: 'absolute',
  top : '3rem',
  left : '43rem',
  width : '7rem',
}

type Linedata = {
  date: Date,
  point: number
}

const dimensions = {
  width: 1000,
  height: 500,
  margin: {
    top: 100, 
    right: 100, 
    bottom: 30, 
    left: 100 
  }
};



export interface IStockChartProps {
  symbol: string
}

export interface IStockChartState {
  symbol: string;
}

  
class LineChart extends React.Component<IStockChartProps, IStockChartState> {
  ref!: SVGSVGElement;  
  data!: Array<Linedata>;
  state: IStockChartState = {
    symbol: "",
  };

  constructor(props:IStockChartProps){
    super(props);
    this.data = [];
  }

  // TODO :: Dynamic allocate
  stocks = [
    { value: '', label:'Select Stock'},
    { value: 'IBM', label: 'IBM' },
    { value: 'MSFT', label: 'Microsoft' },
    { value: 'AAPL', label: 'Apple' },
  ];
  
  private fetchdata():any{
    //console.log(this.state.symbol);
    fetch(`http://localhost:3001/game/stock/${this.state.symbol}`,{
      method: 'GET',
      body: JSON.stringify({
        "user": "kwon",
        "token": "9951c7d3-aada-4b7a-a050-f2504fe5d2ae", // hardcoded -> cookie
      }),
    })
    .then(res => {
      return res.text();
    })
    .then(data => {
      this.parseData(JSON.parse(data)["rows"]);
      
    }).then(res => {
      console.log("hi!");
      console.log(this.data)
      this.plotChart();
    })
  }

  private parseData(data:Array<any>){
    const parseTime = d3.timeParse("%Y-%m-%d %H:%M:%S");
    const points:Linedata[] = data.map(function(e:any){
      let point:Linedata = {
        date: parseTime(e["time"])!, 
        point: e["close"]
      };
      return point;
    });
    
    this.data = points;
  }

  private plotChart() {
    //cleanout before plotting.
    d3.select(this.ref)
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);
    
    d3.select(this.ref).selectAll("*").remove();

    const wrapper = d3.select(this.ref)
      .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);
    
    wrapper
      .append("g")
      .style("transform", `translate(${50}px,${15}px)`)
      .append("text")
      .attr("class", "title")
      .attr("x", dimensions.width / 2)
      .attr("y", dimensions.margin.top / 2)
      .attr("text-anchor", "middle")
      .text("Stock Price")
      .style("font-size", "36px")
      .style("text-decoration", "underline");
    
    const bounds = wrapper
      .append("g")
            .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    const xAxisLine = bounds.append("g")
      .append("rect")
      .attr("class", "dotted")
      .attr("stroke-width", "1px")
      .attr("width", ".5px")
      .attr("height", dimensions.height - dimensions.margin.top - dimensions.margin.bottom);

    
    var xScale = d3.scaleTime()
      .domain(d3.extent(this.data, function(e) { return e.date }) as [Date, Date])
      .range([0, dimensions.width - dimensions.margin.left - dimensions.margin.right]);

    let yextent = d3.extent(this.data, function(e) { return e.point}) as [number, number]; 
    var yScale = d3.scaleLinear()
      .domain([yextent[0] - 10, yextent[1] + 10])
      .range([dimensions.height - dimensions.margin.top - dimensions.margin.bottom, 0]);

      
    var xAxis = d3.axisBottom(xScale);
    var xAxisGroup = bounds.append("g")
      .attr("transform",`translate(0, ${dimensions.height - dimensions.margin.top - dimensions.margin.bottom})`)
      .call(xAxis);
    var yAxis = d3.axisLeft(yScale);
    var yAxisGroup = bounds.append("g")
      .call(yAxis);
      
    var yAxisLabel = yAxisGroup
      .append("text")
      .attr("fill", "black")
      .attr("font-size", "1.4em")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(270)")
      .attr("x", - dimensions.height / 2 + 50) 
      .attr("y", -dimensions.margin.left + 40)
      .attr("fill", "black")
      .text("Stock Price (USD)");
    
      if (this.state.symbol == ""){
      return;
    }
    
    var lineGenerator = d3.line<Linedata>()
      .x((p) => xScale(p.date))
      .y((p) => yScale(p.point));

    var line = bounds.selectAll(".line")
      .data(this.data)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", "black")
      .attr("stroke-width" ,3)
      .attr("d", lineGenerator(this.data));

    this.setInteraction(bounds, xScale, yScale);
  }

  private setInteraction(select:d3.Selection<SVGGElement, unknown, null, undefined>, xScale:d3.ScaleTime<number, number, never>, yScale:d3.ScaleLinear<number, number, never>){
    const formatValue = d3.format(",");
    const dateFormatter = d3.timeFormat("%m/%d/%y");
    
    var focus = select.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("circle")
      .attr("fill", "black")
      .attr("r", 5);

    focus.append("rect")
      .attr("class", "tooltip")
      .attr("width", 100)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("x", 10)
      .attr("y", -22)
      .attr("rx", 4)
      .attr("ry", 4);

    focus.append("text")
      .attr("class", "tooltip-date")
      .attr("x", 18)
      .attr("y", -2);

    focus.append("text")
      .attr("x", 18)
      .attr("y", 18)
        
    focus.append("text")
      .attr("class", "tooltip-price")
      .attr("x", 18)
      .attr("y", 18);

    const onMouseMove = (event:any) => {
      const mousePosition = d3.pointer(event);
      const hoveredDate = xScale.invert(mousePosition[0]);
      const xAccessor = (d:Linedata) => d.date;
      const getDistanceFromHoveredDate = (d:Linedata) => 
        Math.abs(xAccessor(d).getTime() - hoveredDate.getTime());
        const closestIndex = d3.leastIndex(
          this.data,
          (a, b) => getDistanceFromHoveredDate(a) - getDistanceFromHoveredDate(b)
        );
    
      ///console.log(closestIndex);
      const d = this.data[closestIndex!];
      focus.attr("transform", "translate(" + xScale(d.date) + "," + yScale(d.point) + ")");
      focus.select(".tooltip-date").text(dateFormatter(d.date));
      focus.select(".tooltip-price").text(formatValue(d.point));
    }
    select.append("rect")
      .attr("class", "overlay")
      .attr("width", dimensions.width - dimensions.margin.left - dimensions.margin.right)
      .attr("height", dimensions.height - dimensions.margin.top - dimensions.margin.top)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("mouseover", function() { focus.style("display", null); })
      .on("mouseout", function() { focus.style("display", "none"); })
      .on("mousemove", onMouseMove);

    
  }
  
  componentDidMount() {
    // initial state
    this.setState({symbol: ""}, this.plotChart)
  }
  
  

  stockSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    this.setState({symbol: value}, this.fetchdata);
  };


  render() {
    return (<div className="svg">
      <select id="chartselect" value={this.state.symbol} onChange={this.stockSelect} style={SelectStyle}>
        {this.stocks.map(option => (
          <option value={option.value} key={option.label}>{option.label}</option>
        ))}
        </select>
      <svg id="chartsvg" className="container" ref={(ref: SVGSVGElement) => this.ref = ref}></svg>
          
    </div>);
  }
}


export default LineChart;