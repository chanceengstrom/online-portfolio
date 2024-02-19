
      //Todo: Make a rotation function to spin to a selected node.
      //Highlight a node when mousing over it
      //Make a tool tip or another svg that gives information on the node clicked on

      let svg = d3.select('#map')
      var svgWidth = svg.node().clientWidth;
      var svgHeight = svg.node().clientHeight;
      var earthR = svgWidth/5;
      const one = /died/g
      const both = /both/g
      d3.csv('/static/data/Flights-Database.csv',d3.autoType).then(data => {
        

      data.forEach(function(d){
        if(one.test(d.Result))
        {
          if(both.test(d.Result)){
            d.deaths = 2
          }
          else{
            d.deaths = 1
          }
        }
        else
        {
          d.deaths = 0
        }
        if(Number.isInteger(d['Altitude (km)']))
        {
          d.height = d['Altitude (km)']+d.Date.getMonth()*30
        }
        else if(d['Altitude (km)'] == 'orbital')
        {
          d.height = 600+d.Date.getMonth()*15
        }
        else
        {
          d.height = 0
        }
      });
      console.log(data);
      var earth = svg.append("circle")
          .attr("cx",svgWidth/2)
          .attr("cy",svgHeight/2)
          .attr("r",earthR)
          .attr("fill","#98B4D4")
          .attr("stroke","black");

        updateCircles(data,0);


      });
      function updateInfo(datum)
      {
        const formatTime = d3.timeFormat("%B %d, %Y");
        d3.select("#date")
          .text(`Date: ${formatTime(datum.Date)}`);
        d3.select("#dogs")
          .text(`Dogs: ${datum.Dogs}`);
        d3.select("#deaths")
          .text(`Dogs Died: ${datum.deaths}`);
        d3.select("#notes")
          .text(`Notes: ${datum.Notes}`);
        d3.select("#result")
          .text(`Results: ${datum.Result}`);
        d3.select("#rocket")
          .text(`Rocket Type: ${datum.Rocket}`);
        d3.select("#altitude")
          .text(`Altitude (km): ${datum["Altitude (km)"]}`);
      }
      function updateCircles(data,angle){

        var pointX = svgWidth/2 + ((earthR) * Math.sin(0));
        var pointY = svgHeight/2 - ((earthR) * Math.cos(0));

        var scale = d3.scaleTime().domain([data[0].Date,data[data.length-1].Date])
          .range([0,330]);

        svg.selectAll('rect').data(data)
        .join(
          enter => enter.append('rect')          
            .attr('r',4)
            .attr('x',pointX)
            .attr('y',d=>pointY-d.height/4)
            .attr('width',1)
            .attr('height',d=>d.height/4)
            .attr('stroke','grey')
            .attr("transform",d=> `rotate(${scale(d.Date)}, ${svgWidth/2}, ${svgHeight/2})`),
          update => update
            .transition().duration(1000)
            .attr("transform",d=> `rotate(${scale(d.Date)-angle}, ${svgWidth/2}, ${svgHeight/2})`)
          );

        svg.selectAll('circle').data(data)
        .join(
          enter => enter.append('circle')
            .attr('r',4)
            .attr('cx',pointX)
            .attr('cy',d=>pointY-d.height/4)
            .attr('fill',d=>(d.deaths>0)?"red":"black")
            .attr("transform",d=> `rotate(${scale(d.Date)}, ${svgWidth/2}, ${svgHeight/2})`),
          update => update
          .transition().duration(750)
          .attr("transform",d=> `rotate(${scale(d.Date)-angle}, ${svgWidth/2}, ${svgHeight/2})`)
            )
         .on('click',function(d) {
                            updateCircles(data,scale(d.Date));
                            updateInfo(d);})
         .on('mouseover',function (d,i){
            d3.select(this)
               .classed('highlighted', true);
         })
         .on('mouseout',function (d,i){
            d3.select(this)
               .classed('highlighted', false);
         });
          

        var years = [1951, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1966]
        var yearScale = d3.scaleLinear().domain([d3.min(years),d3.max(years)]).range([0,330]);
        svg.selectAll('text').data(years)
        .join(
          enter => enter.append('text')
            .attr('x',pointX-8)
            .attr('y',d=>pointY+18)
            .attr('font-size',14)
            .attr('fill','white')
            .text(d=>d)
            .attr("transform",d=> `rotate(${yearScale(d)}, ${svgWidth/2}, ${svgHeight/2})`),
          update => update
            .transition().duration(1000)
            .attr("transform",d=> `rotate(${yearScale(d)-angle}, ${svgWidth/2}, ${svgHeight/2})`)
          );

      }
