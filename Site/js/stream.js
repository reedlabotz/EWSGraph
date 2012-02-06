(function(){
   var vars = [];
   var machines = [];
   var numMachines = 0;
   var currentVar = null;
   var currentStartTime = null;
   var currentEndTime = null;
   var lastDrawTimeRange = "";
   var hasDrawn = false;
   var resizeTimer = null;
   var isDemo = false;
   var demoTimer = null;
   
   var DEMO_TIME = 20000;
   
   $(function(){
      $("#start_date").change(function(e){
         $("#start_text").dropdown('toggle');
         setStartAndEndTime();
         drawGraph();
      });
      
      $("#end_date").change(function(e){
         $("#end_text").dropdown('toggle');
         setStartAndEndTime();
         drawGraph();
      });
      
      $("#var_choices").click(function(e){
         var id = e.target.id;
         setVar(id.substring(4,id.length));
         window.location.hash = currentVar;
         drawGraph();
      });
      
      $("#endDemo").click(function(e){
         isDemo = false;
         clearTimeout(demoTimer);
         $("#controls").show();
         $(".demo").hide();
      });
      
      $(window).resize(function(){
         showBlackOut();
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(drawGraph, 500);
      });
         
      init();
   });
   
   function init(){
      if(parseHash(window.location.hash)[0] == "demo"){
         isDemo = true;
         demoTimer = setTimeout(nextDemo, DEMO_TIME);
         $("#controls").hide();
         $(".demo").show();
      }
      
      $.getJSON('json.php?request=meta',function(json){
         if(json['error']){
            throwError(json['error']);
         }
         vars = json['vars'];
         machines = json['machines'];
         //get number of machines
         var i=0;
         for(m in machines) i++;
         numMachines = i;
         
         //set the vars dropdown
         for (v in vars){
            $("#var_choices").append("<li><a id='var-"+v+"'>" + vars[v] + "</a></li>");
         }
         
         //set the end time to now
         currentEndTime = new Date();  
         //set the start time to yesturday
         currentStartTime = new Date();
         currentStartTime.setDate(currentStartTime.getDate()-1);
         
         drawStartAndEndTime();

         setVar(parseHash(window.location.hash)[0]);
         
         drawGraph();
      });
   };
   
   function drawGraph(){
      showBlackOut();
      d3.json('json.php?request=data&var='+currentVar+'&start='+currentStartTime.getTime()+'&end='+currentEndTime.getTime(), function(json){
         if(json['error']){
            throwError(json['error']);
         }else{
           innerDraw(json);
         }
      });
   }
   
   function showBlackOut(){
      if(!isDemo){
         $('.modal').fadeIn('fast');
         $('.modal-backdrop').fadeIn('fast');
      }
   }
   
   function hideBlackOut(){
      $('.modal').fadeOut('fast');
      $('.modal-backdrop').fadeOut('fast');
   }
   
   function innerDraw(json){
      var axisMargin = 20;
      var marginBottom = 10;
      var width = $(window).width();
      var height = $(window).height() - 58 - axisMargin - marginBottom; //58 for header bar
      
      var minX = d3.min(json,function(d){ return d3.min(d,function(d){ return d.x; }); });
      var maxX = d3.max(json,function(d){ return d3.max(d,function(d){ return d.x; }); });
      
      currentStartTime = new Date(minX);
      currentEndTime = new Date(maxX);
      drawStartAndEndTime();

      var data = d3.layout.stack().offset("silhouette")(json);
      
      //calculate the max y stack
      var maxY = d3.max(json,function(d){ return d3.max(d,function(d){ return d.y+d.y0 }); });

      var x = d3.time.scale().domain([new Date(minX), new Date(maxX)]).range([0, width]);
      var y = d3.scale.linear().domain([0, maxY]).range([0, height]);

      var area = d3.svg.area()
                       .x(function(d){ return x(new Date(d.x)); })
                       .y0(function(d){ return y(d.y0); })
                       .y1(function(d){ return y(d.y + d.y0); });
                       
      var xAxis = d3.svg.axis().scale(x).orient("bottom");

      hideBlackOut();
      
      if(!hasDrawn){
         var vis = d3.select("#chart").append("svg").attr("width",width)
                     .attr("height",height+axisMargin+marginBottom).append("g");
                     
         var color = d3.interpolateRgb("#84baff", "#2e4592");
         
         var i = 0;    
         vis.selectAll("path").data(data).enter().append("path").style("fill","#fff")
            .transition().duration(1000).style("fill",function(){ return color(i++/numMachines); }).attr("d",area);
         
         vis.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + (height + marginBottom) + ")")
              .call(xAxis);
      }else{
         var vis = d3.select("#chart")
         
         //resize the overall graph
         vis.select("svg").attr("width",width).attr("height",height+axisMargin+marginBottom);
      
         d3.selectAll("path").data(data).transition().duration(1000).attr("d", area);
         
         //change the axis
         vis.select(".x.axis").transition().duration(1000).call(xAxis)
            .attr("transform", "translate(0," + (height + marginBottom) + ")");
      }
      
      if(isDemo){
         flashVar();
      }
      
      hasDrawn = true;
      lastDrawTimeRange = currentStartTime + ":" + currentEndTime
   }
   
   function drawStartAndEndTime(){
      $("#start_text span").html(formatDate(currentStartTime));
      var start_datepicker = $("#start_date").data('datepicker');
      start_datepicker.selectDate(currentStartTime);
      
      $("#end_text span").html(formatDate(currentEndTime));
      var end_datepicker = $("#end_date").data('datepicker');
      end_datepicker.selectDate(currentEndTime);
   }
   
   function setStartAndEndTime(){
      currentEndTime = $("#end_date").data('datepicker').selectedDate;
      currentStartTime = $("#start_date").data('datepicker').selectedDate;
      
      drawStartAndEndTime();
   }
   
   function setVar(id){
      if(vars[id]){
         currentVar = id;
      }else{
         //set the current var to the first var
         for (first in vars) break;
         currentVar = first;
      }
      $("#var_choices a").removeClass('active');
      $("#var-"+currentVar).addClass('active');
      $(".var_text").html(vars[currentVar]);
   }
   
   function formatDate(date){
      var format = d3.time.format("%x");
      return format(date);
   }
   
   function throwError(error){
      alert("Error: "+ error + " Refresh the page.");
   }
   
   function parseHash(hash){
      hash = hash.substr(1,hash.length-1);
      return hash.split("/");
   }
   
   function nextDemo(){
      var lastVar = currentVar;
      var nextBreak = false;
      var first = true;
      for (v in vars){
         if(nextBreak){
            currentVar = v;
            break;
         }
         if(first){
            first = false;
            currentVar = v;
         }
         if(v == lastVar){
            nextBreak = true;
         }
      }
      
      setVar(currentVar);
      
      //set the end time to now
      currentEndTime = new Date();  
      //set the start time to yesturday
      currentStartTime = new Date();
      currentStartTime.setDate(currentStartTime.getDate()-1);
      
      drawStartAndEndTime();
      
      drawGraph();
      
      demoTimer = setTimeout(nextDemo, DEMO_TIME);
   }
   
   function flashVar(){
      $("#flashVar").html(vars[currentVar]);
      $("#flashVar").fadeIn('fast');
      setTimeout(function(){$("#flashVar").fadeOut('slow');},3000);
   }
})();
