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
   var xScale = null;
   var lastJson = null;
   
   var yAxisHold = null;
   
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
      
      $("#chart").mousemove(chartMouseover);
      
      $(window).resize(function(){
         showBlackOut();
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(drawGraph, 500);
      });
         
      init();
   });
   
   function chartMouseover(e){
      var x = e.pageX;
      var width = $(window).width();
      var guessIndex = Math.round(x/width*lastJson[0].length);
      var ourPoints = new Array();
      for(i=0;i<numMachines;i++){
         ourPoints.push(lastJson[i][guessIndex]);
      }
      
      yAxisHold.attr("transform", "translate("+x+",0)");
      $(yAxisHold.select("line")).tooltip({animation:false,
                                           delay:{ show: 0, hide: 500 },
                                           placement:'right',
                                           trigger: 'manual',
                                           title: '<div id="hoverInfo"></div>',      
                                           }).tooltip('show');
                                           
      $("#hoverInfo").html(formatInfo(ourPoints));
                                           
                               
   }
   
   function formatInfo(ourPoints){
      var theDate = new Date(ourPoints[0].x);
      var format = d3.time.format("%a %b %e %H:%M %Y")
      var text = "";
      for(var i=0;i<numMachines;i++){
         if(ourPoints[i].y > -1){
            text += machines[i+1] + ": " + ourPoints[i].y + "<br>";
         }else{
            text += machines[i+1] + ": error<br>";
         }
      }
      return "<p><strong>" + format(theDate) + "</strong></p>" + text;
   }
   
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
      lastJson = json;
      var axisMargin = 20;
      var marginBottom = 10;
      var width = $(window).width();
      var height = $(window).height() - 58 - axisMargin - marginBottom; //58 for header bar
      
     
      hideBlackOut();
      var i=0;
      var vis = d3.select("#chart").append("svg").attr("width",width)
                     .attr("height",height+axisMargin+marginBottom);             
      
      var color = d3.interpolateRgb("#84baff", "#2e4592");
      var data = new Array(100);
      var i=0;
      vis.selectAll("circle")
          .data(data)
        .enter().append("circle")
          .attr("cy", function(){ return Math.random()*height-100 + 100;})
          .attr("cx", function(){ return Math.random()*width-100 + 100;})
          .attr("r", function(){ return 15;})
          .style("fill",function(){ return color(i++/100); });
      
          var force = d3.layout.force().charge(20).linkDistance(30).nodes(data).size([width, height]).start();
          
      vis.selectAll("circle").call(function(d){console.log(d);});
          
        
         
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
