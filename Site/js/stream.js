var width = 960;
var height = 400;

d3.json('data.php', function(json){
   var minX = d3.min(json,function(d){ return d3.min(d,function(d){ return d.x; }); });
   var maxX = d3.max(json,function(d){ return d3.max(d,function(d){ return d.x; }); });
   var maxY = d3.max(json,function(d){ return d3.max(d,function(d){ return d.y }); });
   
   var data0 = d3.layout.stack().offset("silhouette")(json);

   var x = d3.time.scale().domain([new Date(minX), new Date(maxX)]).range([0, width]);

   var y = d3.scale.linear().domain([0, maxY]).range([0, height/4]);

   
   var vis = d3.select("#chart").append("svg").attr("width",width).attr("height",height);
   
   var rules = vis.selectAll("g.rule")
       .data(x.ticks(12))
     .enter().append("g")
       .attr("class", "rule");

   rules.append("line")
       .attr("x1", x)
       .attr("x2", x)
       .attr("y1", 0)
       .attr("y2", height - 1);

   rules.append("text")
       .attr("x", x)
       .attr("y", height - 13)
       .attr("dy", ".71em")
       .attr("text-anchor", "middle")
       .text(x.tickFormat(12));
   
   var area = d3.svg.area()
                    .x(function(d){ return x(new Date(d.x)); })
                    .y0(function(d){ return y(d.y0); })
                    .y1(function(d){ return y(d.y + d.y0); });

   var color = d3.interpolateRgb("#aad", "#556");

   var i = 0;
   vis.selectAll("path").data(data0).enter().append("path").style("fill",function(){ return color(i++/4); }).attr("d",area);
   
  });
