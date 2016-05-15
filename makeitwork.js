// Size of the main container with margins
var margin = {top: 30, right: 50, bottom: 70, left: 100},
    width = 1200 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

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

// append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
    .append("clipPath") 
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

// Initialize slider
var slider;

//d3.slider().on("slide", function(evt, value) {console.log(value)});

// Load the data
var myYDomain, myXDomain, power_demand_svg;
var result_sentence;
var toplot = [];
var toplot2 = [];
var mydata = [];
var sum = 0;
var sumpeak = 0;
var pcost = 0.28619;
var opcost = 0.21061;
var oldcost = 0;
var uid = '48492';
// var uid = "5350";
var token = '3f7a4d2a86a34f958e63e8e566da57d7';
// var token = "opendatatoken";
url = "https://utilityapi.com/api/services/" + uid + "/intervals.json?start=2016-05-12T00:00:00%2D07:00&end=2016-05-13T07:00:00%2D07:00&access_token=" + token;
d3.json(url, function(error, data) {

// parsing the date in d3 format
data.forEach(function(d) {
    d.interval_start = parseDate(d.interval_start.substring(0, 19)),
    toplot.push({time: d.interval_start, data: d.interval_kW})
    toplot2.push({time: d.interval_start, data: d.interval_kW})
});

mydata.push({color: "#5c5c3d", value: toplot, 'description': 'Today'})
mydata.push({color: "red", value: toplot2, 'description': 'Tomorrow'})

// Initialize ratio
for (i = 0; i < mydata[1].value.length; i++)
{
    if ((mydata[1].value[i].time.getHours()) >= 15
        && (mydata[1].value[i].time.getHours()) <= 20) {
        sumpeak = sumpeak + mydata[1].value[i].data;
    }
        sum = sum + mydata[1].value[i].data;
}


for (i = 0; i < mydata[0].value.length; i++)
{
    if ((mydata[0].value[i].time.getHours()) >= 15
        && (mydata[0].value[i].time.getHours()) <= 20) {
        oldcost = oldcost + pcost * mydata[0].value[i].data;
    } else {
        oldcost = oldcost + opcost * mydata[0].value[i].data;
    }
}
oldcost = oldcost * 30;

result_sentence = svg.append("text")
   .attr("id", "meantext")
   .attr("x", 800)
   .attr("y", 30)
   .attr("dy", ".71em")
   .style("text-anchor", "end")
   .text("You're paying $" + String(oldcost.toFixed(2)) + " /month, tomorrow you could pay $" + String(oldcost.toFixed(2)) + "/month");
 
slider = d3.slider().min(0).max(50).ticks(10).showRange(true).value(100 * sumpeak / sum).callback(function(evt) {
        update_power_demand(self.slider.value())
      });
// Render the slider in the div
d3.select('#slider').call(slider);

// myYDomain = d3.extent(data, function(d) { return d.interval_kW; })
power_scale.domain([0, 0.6]);
svg.select(".yAxis").call(yAxis);

myXDomain = d3.extent(data, function(d) { return d.interval_start; })
time_scale.domain(myXDomain);
svg.select(".xAxis").call(xAxis);

// select all locations and bound group to non existant location
power_demand_svg = svg.selectAll(".power_curve")
                .data(mydata)
                .enter().append("g")
                .attr("class", "power_curve");

// in each group append a path generator for lines and give it the bounded data 
power_demand_svg.append("path")
    .attr("class", "line")
    .attr("clip-path", "url(#clip)")
    .attr("d", function(d) {
    	return power_demand_line(d.value); })
    .style("stroke", function(d) { return d.color; })
    .attr("stroke-width", 5);

power_demand_svg.append("rect")
    .attr("width", 30)
    .attr("height", 15)                                    
    .attr("x", width + (margin.right/3) - 100) 
    .attr("y", function (d, i) { return (30)+i*(30) - 8; })  // spacing
    .attr("fill",function(d) {
        return d.color; // If array key "visible" = true then color rect, if not then make it grey 
        })
    .attr("class", "legend-box")
    .attr("stroke", "#000000")


power_demand_svg.append("text")
    .attr("x", width + (margin.right/3) + 15 - 80) 
    .attr("y", function (d, i) { return (30)+i*(30) + 4; })
    .attr("font-size", "16px")
    .text(function(d) { return d.description; }); 

});


function update_power_demand(slider_value){
	transitionTime = 0;
	roriginal = sumpeak / sum;
	rnew = slider_value / 100;

	for (i = 0; i < mydata[1]['value'].length; i++){

        if ((mydata[1].value[i].time.getHours()) >= 15
            && (mydata[1].value[i].time.getHours()) <= 20) {
            mydata[1].value[i].data = rnew / roriginal * mydata[0].value[i].data;
        }
        else
        {
            mydata[1].value[i].data = (1 - rnew) / (1 - roriginal) * mydata[0].value[i].data;
        }
    }

	// // Update y axis with new data
	// myYDomain1 = d3.extent(mydata[0].value, function(d) { return d.data; })
	// myYDomain2 = d3.extent(mydata[1].value, function(d) { return d.data; })
	// minY = d3.min([myYDomain1[0], myYDomain2[0]])
	// maxY = d3.max([myYDomain1[1], myYDomain2[1]])
	// power_scale.domain([minY, maxY]);
	// svg.select(".yAxis").call(yAxis);

	// Update line
	power_demand_svg.select(".line")
	  .transition(transitionTime)
	  .attr("d", function(d) { return power_demand_line(d.value); });

	cost();
	console.log(newcost)

	d3.select("#meantext").remove()

	result_sentence = svg.append("text")
	   .attr("id", "meantext")
	   .attr("x", 800)
	   .attr("y", 30)
	   .attr("dy", ".71em")
	   .style("text-anchor", "end")
	   .text("You're paying $" + String(oldcost.toFixed(2)) + " /month, tomorrow you could pay $" + String(newcost.toFixed(2)) + "/month");

}


function cost() {
	newcost = 0
	for (i = 0; i < mydata[0].value.length; i++)
	{
	    if ((mydata[1].value[i].time.getHours()) >= 15
	        && (mydata[1].value[i].time.getHours()) <= 20) {
	        newcost = newcost + pcost * mydata[1].value[i].data;
	    } else {
	        newcost = newcost + opcost * mydata[1].value[i].data;
	    }
	}
	newcost = newcost * 30;
}