// Hint: declare global variables here
let female_data
let male_data
let data
//const width = +svg.style('width').replace('px','');
//const height = +svg.style('height').replace('px','');
// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function
    
   // This will load your two CSV files and store them into two arrays.
   Promise.all([d3.csv('static/data/females_data.csv', d3.autoType),d3.csv('static/data/males_data.csv', d3.autoType)])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];
            // Hint: This is a good spot for doing data wrangling
            //female_data
            
            drawLolliPopChart();
        });
});

// Use this function to draw the lollipop chart.
function drawLolliPopChart() {
    console.log('trace:drawLollipopChart()');
            const svg = d3.select('svg');
            const width = +svg.style('width').replace('px','');
            const height = +svg.style('height').replace('px','');
            const margin = { top:100, bottom: 50, right: 10, left: 60 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;
            const country = d3.select("#select1").property("value");
            f_max = d3.max(female_data, d=>d[country])
            m_max = d3.max(male_data, d=>d[country])

            const xScale = d3.scaleTime()
            .domain([new Date(1990),new Date(2023)])
            .range([0,innerWidth]);
            const yScale = d3.scaleLinear()
            .domain([0,d3.max([f_max,m_max])])
            .range([innerHeight,0]);

            svg.select('g').remove();
            const g = svg.append('g').attr('transform', 'translate('+margin.left+', '+margin.top+')');

            g.selectAll("femaleline")
              .data(female_data)
              .enter()
              .append("line")
                .attr("x1", function(d) { return xScale(new Date(d["Year"])); })
                .attr("x2", function(d) { return xScale(new Date(d["Year"])); })
                .attr("y1", function(d) { return yScale(d[country]); })
                .attr("y2", yScale(0))
                .attr("stroke", "Coral")
                .attr('transform', 'translate(7, 0)');
            g.selectAll("femalecircle")
              .data(female_data)
              .enter()
              .append("circle")
                .attr("cx", function(d) { return xScale(new Date(d["Year"])); })
                .attr("cy", function(d) { return yScale(d[country]); })
                .attr("r", "4")
                .style("fill", "Coral")
                .attr('transform', 'translate(7, 0)');
            g.selectAll("maleline")
              .data(male_data)
              .enter()
              .append("line")
                .attr("x1", function(d) { return xScale(new Date(d["Year"])); })
                .attr("x2", function(d) { return xScale(new Date(d["Year"])); })
                .attr("y1", function(d) { return yScale(d[country]); })
                .attr("y2", yScale(0))
                .attr("stroke", "DarkCyan")
                .attr('transform', 'translate(-7, 0)');
            g.selectAll("malecircle")
              .data(male_data)
              .enter()
              .append("circle")
                .attr("cx", function(d) { return xScale(new Date(d["Year"])); })
                .attr("cy", function(d) { return yScale(d[country]); })
                .attr("r", "4")
                .style("fill", "DarkCyan")
                .attr('transform', 'translate(-7, 0)');

            g.append("circle").attr("cx",width-250).attr("cy",-35).attr("r", 6).style("fill", "Coral");
            g.append("circle").attr("cx",width-250).attr("cy",-65).attr("r", 6).style("fill", "DarkCyan");
            g.append("text").attr("x", width-240).attr("y", -30).text("Female Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle");
            g.append("text").attr("x", width-240).attr("y", -60).text("Male Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle");

            const yAxis = d3.axisLeft(yScale);
            g.append('g').call(yAxis);
            const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
            g.append('g').call(xAxis).attr('transform',`translate(0,${innerHeight})`)

            g.append('text')
                .attr('x',innerWidth/2)
                .attr('y',innerHeight+40)
                .text("Year");
            g.append('text')
                .attr('transform','rotate(-90)')
                .attr('y','-40px')
                .attr('x',-innerHeight/2)
                .attr('text-anchor','middle')
                .text("Employment Rate" );

      
    //console.log(female_data)
}

