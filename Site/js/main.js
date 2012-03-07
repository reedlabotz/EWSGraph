(function(){
   var vars = [];
   var machines = [];
   var numMachines = 0;
   var hasDrawn = false;
   var resizeTimer = null;
   
   var redrawTimer = null;
   
   var lastJSON = null;
   var hasDrawn = false;
   
   $(function(){
      $(window).resize(function(){
         clearTimeout(resizeTimer);
         resizeTimer = setTimeout(resizeDraw, 100);
      });
         
      init();
   });
   
   function init(){
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
         
         showBlackOut();
         drawGraph();
      });
   };
   
   function drawGraph(){
      d3.json('json.php?request=data', function(json){
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
   
   function resizeDraw(){
      innerDraw(lastJSON);
   }
   
   function innerDraw(json){
      lastJSON = json;
      var width = $(window).width();
      var height = $(window).height();
      
      var allUsers = [];
      
      for(i in json){
         var totalCPU = parseFloat(json[i]['cpu_user'])+parseFloat(json[i]['cpu_system']);
         var CPUPerUser = parseInt(json[i]['unique_user_count'])/totalCPU;
         var time = json[i]['time'];
         var machine = machines[json[i]['machine_id']];
         var users = $.parseJSON(json[i]['users']);

         if(users != null){
            for(u in users){
               allUsers.push({'name':users[u],'machine':json[i]['machine_id'],'CPUPerUser':CPUPerUser});
            }
         }
      }
      
      var w = width;
      var h = height;
      
      var totalUsers = allUsers.length;
      
      var diameterPerUser = Math.sqrt(w*h/totalUsers);
      
      allUsers = allUsers.sort(sortNodes);
      
      var color = d3.scale.category20();//d3.interpolateRgb("#84baff", "#2e4592");
      
      var counterX = -1;
      var counterY = -1;
      
      var cols = Math.round(w/diameterPerUser) + 1;

      diameterPerUser = w/cols;
      
      if(!hasDrawn){
          var vis = d3.select("#chart").append("svg").attr("width",width)
                                 .attr("height",height).append("g");
         
         vis.selectAll("circle").data(allUsers).enter().append("circle")
                   .attr("cx", function(){ counterX++; return (counterX%cols)*diameterPerUser+diameterPerUser/2;})
                   .attr("cy", function(){ counterY++; return Math.floor(counterY/cols)*diameterPerUser+diameterPerUser/2;})
                   .attr("r", function(d){ return diameterPerUser/2*.9;})
                   .attr("id",function(d){ return d['machine']+"#"+d['name'];})
                   .style("fill",function(d){return color(d.machine);});        
      }else{
         var vis = d3.select("#chart");
         
         vis.select("svg").attr("width",width).attr("height",height);
         
         vis.selectAll("circle").data(allUsers).transition().duration(100)
            .attr("cx", function(){ counterX++; return (counterX%cols)*diameterPerUser+diameterPerUser/2;})
            .attr("cy", function(){ counterY++; return Math.floor(counterY/cols)*diameterPerUser+diameterPerUser/2;})
            .attr("r", function(d){ return diameterPerUser/2*.9;})
            .attr("id",function(d){ return d['machine']+"#"+d['name'];})
            .style("fill",function(d){return color(d.machine);});
      }       
               
      hasDrawn = true;
      hideBlackOut();
      clearTimeout(redrawTimer);
      redrawTimer = setTimeout(drawGraph, 30000);
   }
   
   function sortNodes(a,b){
      return a['name']>b['name'] ? 1 : a['name']<b['name'] ? -1 : 0
   }
   
   function throwError(error){
      alert("Error: "+ error + " Refresh the page.");
   }
})();
