var mapSvg, lineSvg;
var lineWidth, lineHeight, lineInnerHeight, lineInnerWidth;
var lineMargin = { top: 50, right: 60, bottom: 60, left: 100 };
var mapData, schoolData, attribute;

// This will run when the page loads
document.addEventListener('DOMContentLoaded', () => {
    mapSvg = d3.select('#map');
    lineSvg = d3.select('#linechart');

    lineWidth = +lineSvg.style('width').replace('px','');
    lineHeight = +lineSvg.style('height').replace('px','');;
    lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
    lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

    // Load both files before doing anything else
    Promise.all([d3.json('static/data/us.geojson'),
                 d3.csv('static/data/school_scores.csv')])
                 .then(function(values){

        
        mapData = values[0];
        schoolData = values[1];
        //d3.select('#tooltip').attr('hidden',true);
        drawMap();
       
    });
});

// Draw the map in the #map svg
function drawMap() {
    mapSvg.select('g').remove()
    // create the map projection and geoPath
    let usaProjection = d3.geoAlbersUsa()
                          .fitSize([+mapSvg.style('width').replace('px',''),
                                    +mapSvg.style('width').replace('px','')], 
                                    mapData);
    let geoPath = d3.geoPath()
                    .projection(usaProjection);
    
    // Get the selected year based on the #year-input value and cast to a number
    let year = d3.select('#year-input').property('value');
    
    // Get an array of the states for the selected year
    let yearData = schoolData.filter( d => +d.Year == year);

    // Get the selected attribute that you want to visualize 
    attribute = 'Details.Health.Health Total Expenditure'
    attribute = d3.select('#attribute-select').property('value');
    
    // Get the min and max value for the selected attribute based on the currently selected year
    let extent = [+d3.min(yearData, d => d[attribute]),+d3.max(yearData,d => d[attribute])];    
    //console.log(extent);
    // Set the selected color scale based on the #color-scale-select dropdown value
    let selectedColor = d3.select('#color-scale-select').property('value');

    let colorScale = d3.scaleSequential(d3[selectedColor])
                       .domain(extent);
    //console.log(selectedColor);
    // Draw the map
    let g = mapSvg.append('g');
    var div = d3.select("#tooltip");

    g.selectAll('.stateMap')
          .data(mapData.features)
          .enter()
          .append('path')
            .attr('d',geoPath)
            .classed('stateMap',true)
            .attr('id', d => `${d.properties.name}_state`.replaceAll(' ','_'))
            .attr('fill', d => {
                // Based on the state's value for the currently selected year,
                // color it using the colorScale. If the state's data is missing 
                // for the selected year (e.g., West Virginia in 2006), you can 
                // return a default color for it (such as white).
                let stateName = d.properties.name;
                let value = yearData.filter(d=>d["State.Name"]==stateName);
                if(value[0])
                {
                    return colorScale((+value[0][attribute]));
                }
                else
                {
                    return 'white';
                }
                //console.log(value)
                

            })
            .on('mouseover', function(d,i) {
                d3.select(`#${d.properties.name}_state`.replaceAll(' ','_')).classed("highlighted",true);
                
                div.transition()
                   .duration(50)
                   .style("opacity", 1);
                let stateName = d.properties.name;
                let value = yearData.filter(d=>d["State.Name"]==stateName)[0];
                if(value)
                {
                    value = value[attribute]
                }
                else
                {
                    value = "Missing Data"
                }
                div.html(`State: ${stateName}<br>${attribute}: ${value}`)
                 .style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px");
            })
            .on('mouseout', function(d,i) {
                d3.select(`#${d.properties.name}_state`.replaceAll(' ','_')).classed("highlighted",false);
                div.transition()
                   .duration(0)
                   .style("opacity", 0)
                   .style("left", "0px")
                 .style("top", "0px");
                //console.log(`Mouseout on ${d.properties.name}`);
            })
                       
            .on('mousemove', function(d,i) {
                div.style("left", (d3.event.pageX+10) + "px")
                 .style("top", (d3.event.pageY-10) + "px");
                //console.log(`Mousemove on ${d.properties.name}`);
            })
            
            .on('click', function(d,i) {
                drawLineChart(d.properties.name);
            })
            
   
    // draw the map color key
    drawColorScale(g, attribute, colorScale);
    
}

// This function will draw the color legend below the map
function drawColorScale(g, attribute, colorScale) {
    const linearGradient = g.append("defs")
                            .append("linearGradient")
                            .attr("id", "linear-gradient");
    linearGradient.selectAll("stop")
                  .data(colorScale.ticks()
                  .map((t, i, n) => ({ 
                    offset: `${100*i/n.length}%`, 
                    color: colorScale(t) })))
                  .enter()
                    .append("stop")
                    .attr("offset", d => d.offset)
                    .attr("stop-color", d => d.color);
    g.append("rect")
     .attr('transform', `translate(100,520)`)
     .attr("width", 400)
     .attr("height", 20)
     .style("fill", "url(#linear-gradient)");
    const colorAxis = d3.axisBottom(d3.scaleLinear()
                        .domain(colorScale.domain())
                        .range([0,400]))
                        .ticks(5).tickSize(-20);
    g.append('g').call(colorAxis)
     .attr('class','colorLegend')
     .attr('transform','translate(100,540)')
     .selectAll('text')
     .style('text-anchor','end')
     .attr('dx','-10px')
     .attr('dy', '0px')
     .attr('transform','rotate(-45)');
    g.append('text')
     .attr("id","leg-text")
     .attr('x',100)
     .attr('y',510)
     .style('font-size','.9em')
     .text(attribute);
}

// Draw the line chart in the #linechart svg using 
// the provided state (e.g., `Arizona')
function drawLineChart(state) {
    lineSvg.select('g').remove()
    //console.log(`drawLineChart for ${state}`);
    let stateData = schoolData.filter( d=>d["State.Name"]==state);
    //attribute = d3.select('#attribute-select').property('value');
    console.log()

     const g = lineSvg.append('g')
                        .attr('transform',`translate(${lineMargin.left},${lineMargin.top})`);

    const yScale = d3.scaleLinear()
                            .domain([d3.min(stateData,d=>d[attribute])*0.98, d3.max(stateData,d=>d[attribute])*1.02])
                            .range([lineInnerHeight,0]);
    var xScale = d3.scaleTime();
    xScale.domain([new Date(2004),new Date(2016)])
                  .range([ 0, lineInnerWidth ]);

    g.append('g')
                .call(d3.axisLeft(yScale).tickSize(lineMargin.left - lineMargin.right-lineWidth));
    g.append('g')
                .attr('transform',`translate(0,${lineInnerHeight})`)
                .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    g.select(".domain").remove();
    g.selectAll(".tick:not(:first-of-type) line")
        .attr("stroke-opacity", 0.5)
        .attr("stroke-dasharray", "2,2");

    g.append("linearGradient")
      .attr("id", "line1-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", yScale.range()[0])
      .attr("x2", 0)
      .attr("y2", yScale.range()[1])
      .selectAll("stop")
        .data([
          
          {offset: "2%", color: "red"},
          {offset: "95%", color: "green"}
        ])
      .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });

    const singleLine = d3.line()
                        .x(d => xScale(d.Year))
                        .y(d => yScale(d[attribute]))  
                        .curve(d3.curveMonotoneX)
    g.append('path')
        .datum(stateData)  
        .attr('class','singleLine')      
        .style('fill','none')
        .attr("stroke", "url(#line1-gradient)")
        //.style('stroke','black')
        .style('stroke-width','2')
        .attr('d', singleLine);

    g.selectAll('circle')
        .data(stateData)
        .enter()
        .append('circle')
        .attr('class','singleCircles')      
        .style('fill','black')
        .attr('cx', i => xScale(i.Year))
        .attr('cy', d => yScale(d[attribute]))
        .attr('r', 4);
    g.append('text')
        .attr('transform','rotate(-90)')
        .attr('dx',`${100-(lineInnerHeight/2)}`)
        .attr('dy','-45')
        .style('text-anchor','end')
        .style('fill','grey')
        .text(attribute);
    g.append('text')
        .attr('transform',`translate(${(lineWidth/2)},0)`)
        .style('text-anchor','end')
        .style('fill','grey')
        .text(`Selected State: ${state} `);
}