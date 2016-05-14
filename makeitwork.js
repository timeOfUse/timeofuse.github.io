// Size of the main container with margins
var margin = {top: 30, right: 50, bottom: 70, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Parsing date
var parseDate = d3.time.format("%m/%d %H:%M:%S").parse;

// a scale for the time
var time_scale = d3.time.scale().nice().range([0, width])
.domain([parseDate('5/13 00:00:00'), parseDate('5/14 23:00:00')]);

// Scale for power demand
var power_scale = d3.scale.linear().range([height, 0]);

// Create actual X axis
var xAxis = d3.svg.axis().ticks(10).scale(time_scale) 
    .orient("bottom");

// Create actual y axis
var yAxis = d3.svg.axis().ticks(5).scale(power_scale)
    .orient("left");

// Create the line
var power_demand_line = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return time_scale(d.time); })
    .y(function(d) { return power_scale(d.data); });

// Add a SVG which will contain the parallel coordinates
var svg = d3.select("#thegraph").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + 20)
  	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Show x axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

// Show y axis
svg.append("g")
    .attr("class", "yAxis")
    .call(yAxis)
    .append("g")
    .attr("transform", "translate(-60, -10)")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Power demand (unit)");

// append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
    .append("clipPath") 
    .attr("id", "clipLoad")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

console.log('Hello')
// Load the data
// d3.csv("../../../someMoreData/parallel.csv", function(error, data) {
// }