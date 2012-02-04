(function(){
   var vars = [];
   var currentVar = null;
   var currentStartTime = null;
   var currentEndTime = null;
   var hasDrawn = false;
   var resizeTimer = null;
   
   $(function(){
      //prevent the textboxs in the nav bar to close the dropdown menus
      $('.dropdown-menu input[type="text"]').click(function (e) {
         e.stopPropagation();
      });
      
      $("#start_done").click(function(e){
         setStartAndEndTime();
      });
      
      $("#end_done").click(function(e){
         setStartAndEndTime();
      });
      
      $("#var_choices").click(function(e){
         var id = e.srcElement.id;
         setVar(id.substring(4,id.length));
      });
      
      $("#display_btn").click(function(){
         drawGraph();
         window.location.hash = currentVar;
      });
      
      $(window).resize(function(){
         showBlackOut();
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(drawGraph, 500);
      });
         
      init();
   });
   
   function init(){
      $.getJSON('json.php?request=vars',function(json){
         if(json['error']){
            throwError(json['error']);
         }
         vars = json;
         //set the end time to now
         currentEndTime = new Date();  
         //set the start time to yesturday
         currentStartTime = new Date();
         currentStartTime.setDate(currentStartTime.getDate()-1);
         
         //set the vars dropdown
         for (v in vars){
            $("#var_choices").append("<li><a id='var-"+v+"'>" + vars[v] + "</a></li>");
         }
         
         var hash = window.location.hash;
         setVar(hash.substr(1,hash.length-1));
         
         drawStartAndEndTime();
         
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
      $('.modal').fadeIn('fast');
      $('.modal-backdrop').fadeIn('fast');
   }
   
   function hideBlackOut(){
      $('.modal').fadeOut('fast');
      $('.modal-backdrop').fadeOut('fast');
   }
   
   function innerDraw(json){
      var axisMargin = 20;
      var width = $(window).width();
      var height = $(window).height() - 58 - axisMargin; //58 for header bar
      
      var minX = d3.min(json,function(d){ return d3.min(d,function(d){ return d.x; }); });
      var maxX = d3.max(json,function(d){ return d3.max(d,function(d){ return d.x; }); });
      
      var maxY = d3.max(json,function(d){ return d3.max(d,function(d){ return d.y }); });
      
      currentStartTime = new Date(minX);
      currentEndTime = new Date(maxX);
      drawStartAndEndTime();
      

      var data0 = d3.layout.stack().offset("silhouette")(json);

      var x = d3.time.scale().domain([new Date(minX), new Date(maxX)]).range([0, width]);

      var y = d3.scale.linear().domain([0, maxY]).range([0, height/4]);

      var area = d3.svg.area()
                       .x(function(d){ return x(new Date(d.x)); })
                       .y0(function(d){ return y(d.y0); })
                       .y1(function(d){ return y(d.y + d.y0); });
                       
      var xAxis = d3.svg.axis().scale(x).orient("bottom");

      hideBlackOut();
      
      if(!hasDrawn){
         var vis = d3.select("#chart").append("svg").attr("width",width).attr("height",height+axisMargin)
                                      .append("g");
         var color = d3.interpolateRgb("#aad", "#556");
         
         var i = 0;    
         vis.selectAll("path").data(data0).enter().append("path").style("fill",function(){ return color(i++/4); }).attr("d",area);
         
         vis.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);
      }else{
         var vis = d3.select("#chart")
         
         //resize the overall graph
         vis.select("svg").attr("width",width).attr("height",height+axisMargin);
         
         //change the graph areas
         d3.selectAll("path").data(data0).transition().duration(1000).attr("d", area);;
         
         //change the axis
         vis.select(".x.axis").transition().duration(1000).call(xAxis);
      }
      
      
      hasDrawn = true;
   }
   
   function drawStartAndEndTime(){
      $("#start_text span").html(formatDateTime(currentStartTime));
      $("#start_date").val(formatDate(currentStartTime));
      $("#start_time").val(formatTime(currentStartTime));
      var start_datepicker = $("#start_date").data('datepicker');
      start_datepicker.selectDate(currentStartTime);
      
      $("#end_text span").html(formatDateTime(currentEndTime));
      $("#end_date").val(formatDate(currentEndTime));
      $("#end_time").val(formatTime(currentEndTime));
      var end_datepicker = $("#end_date").data('datepicker');
      end_datepicker.selectDate(currentEndTime);
   }
   
   function setStartAndEndTime(){
      var end_date = $("#end_date").data('datepicker').selectedDate;
      var end_time = Date.parse($("#end_time").val());
      currentEndTime = new Date(end_date.getFullYear(),end_date.getMonth(),end_date.getDate(),end_time.getHours(),end_time.getMinutes());
      
      var start_date = $("#start_date").data('datepicker').selectedDate;
      var start_time = Date.parse($("#start_time").val());
      currentStartTime = new Date(start_date.getFullYear(),start_date.getMonth(),start_date.getDate(),start_time.getHours(),start_time.getMinutes());
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
      $("#var_text span").html(vars[currentVar]);
   }
   
   function formatDateTime(date) {
      var format = d3.time.format("%x %I:%M %p");
      return format(date);
   }
   
   function formatDate(date){
      var format = d3.time.format("%x");
      return format(date);
   }
   
   function formatTime(date){
      var format = d3.time.format("%I:%M %p");
      return format(date);
   }
   
   function throwError(error){
      alert("Error: "+ error + " Refresh the page.");
   }
})();
