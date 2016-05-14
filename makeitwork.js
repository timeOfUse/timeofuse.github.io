// Size of the main container with margins
var margin = {top: 30, right: 50, bottom: 70, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parsedData;

// Parsing date
var parseDate = d3.time.format.utc("%Y-%m-%dT%H:%M:%S").parse;

// a scale for the time
var time_scale = d3.time.scale().range([0, width]);
// .domain([parseDate('2016-05-12T00:00:00'), parseDate('2016-05-13T00:00:00')]);

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
    .attr("class", "xAxis")
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

// // append clip path for lines plotted, hiding those part out of bounds
// svg.append("defs")
//     .append("clipPath") 
//     .attr("id", "clip")
//     .append("rect")
//     .attr("width", width)
//     .attr("height", height);

// Load the data
var myYDomain, myXDomain;
url = "https://utilityapi.com/api/services/48492/intervals.json?start=2016-05-12&end=2016-05-13&access_token=3f7a4d2a86a34f958e63e8e566da57d7"
d3.json(url, function(error, data) {

// parsing the date in d3 format
data.forEach(function(d) {
    d.interval_start = parseDate(d.interval_start.substring(0, 19)),
    d.values = {time: d.interval_start, data: d.interval_kW}
});

parsedData = data;

myYDomain = d3.extent(data, function(d) { return d.interval_kW; })
power_scale.domain(myYDomain);
svg.select(".yAxis").call(yAxis);

myXDomain = d3.extent(data, function(d) { return d.interval_start; })
time_scale.domain(myXDomain);
svg.select(".xAxis").call(xAxis);

// select all locations and bound group to non existant location
power_demand_svg = svg.selectAll(".power_curve")
                .data(data)
                .enter().append("g")
                .attr("class", "power_curve");

// in each group append a path generator for lines and give it the bounded data 
power_demand_svg.append("path")
    .attr("class", "line")
    // .attr("clip-path", "url(#clip)")
    .attr("d", function(d) {
    	return power_demand_line(d.values); });
});
