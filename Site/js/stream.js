var width = 960;
var height = 300;

$.getJSON('data.php',function(data){
  var data0 = d3.layout.stack().offset("wiggle")(data);
  console.log(data0);
  
  var color = d3.interpolateRgb("#aad", "#556");
  
  var area = 

  var vis = d3.select("#chart").append("svg").attr("width",width).attr("height",height);
  vis.selectAll("path").data(data0).enter().append("path").style("fill",function(){ return color(Math.random()); }).attr("d",area);
});

