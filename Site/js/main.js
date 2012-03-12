(function(){
   var vars = [];
   var machines = [];
   var numMachines = 0;
   var hasDrawn = false;
   var resizeTimer = null;
   
   var redrawTimer = null;
   
   var lastJSON = null;
   var hasDrawn = false;
   
   var allUsers = [];
   
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
      /*
      TODO:
      -Create or delete nodes on entry or exit from machine
      -messages
      */
      var newData = false;
      for(i in json){
         if(lastJSON == undefined || json[i]['id'] != lastJSON[i]['id']){
            newData = true;
         }
      }
   
      if(newData){
         console.log("NEW DATA!");
         var arriving = [];
         var leaving = [];
         
         for(i in json){
            //var totalCPU = parseFloat(json[i]['cpu_user'])+parseFloat(json[i]['cpu_system']);
            //var CPUPerUser = parseInt(json[i]['unique_user_count'])/totalCPU;
            
            var machine = machines[json[i]['machine_id']];
            var users = $.parseJSON(json[i]['users']);
            
            if(hasDrawn && lastJSON[i]['users'] != undefined && users != undefined){
               var lastUsers = $.parseJSON(lastJSON[i]['users']);
               
               machineLeaving = setDiff(lastUsers,users);
               for(i in machineLeaving){
                  leaving.push({'name':machineLeaving[i],'machine':machine});
               }
               
               machineArriving = setDiff(users,lastUsers);
               for(i in machineArriving){
                  arriving.push({'name':machineArriving[i],'machine':machine});
               }
            }else{
               for(i in users){
                  arriving.push({'name':users[i],'machine':machine});
               }
            }
         }
         
         console.log("Pre-count: "+ allUsers.length);
         console.log("Arriving: " + arriving.length);
         console.log("Leaving: "+ leaving.length);
         
         allUsers = allUsers.concat(arriving);
         if(leaving.length > 0){
            allUsers = setDiff(allUsers,leaving,compNodes);
         }
         console.log("Post-count: "+ allUsers.length);
      }
      
      var width = $(window).width();
      var height = $(window).height();
      
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
         
         vis.selectAll("circle").data(allUsers).transition().duration(500)
            .attr("cx", function(){ counterX++; return (counterX%cols)*diameterPerUser+diameterPerUser/2;})
            .attr("cy", function(){ counterY++; return Math.floor(counterY/cols)*diameterPerUser+diameterPerUser/2;})
            .attr("r", function(d){ return diameterPerUser/2*.9;})
            .attr("id",function(d){ return d['machine']+"#"+d['name'];})
            .style("fill",function(d){return color(d.machine);});
      }
               
      hasDrawn = true;
      lastJSON = json;
      hideBlackOut();
      clearTimeout(redrawTimer);
      redrawTimer = setTimeout(drawGraph, 30000);
   }
   
   function sortNodes(a,b){
      return a['name']>b['name'] ? 1 : a['name']<b['name'] ? -1 : a['machine'] < b['machine'] ? 1 : -1;
   }
   
   function compNodes(a,b){
      return a['name']==b['name'] && a['machine']==b['machine'];
   }
   
   function throwError(error){
      alert("Error: "+ error + " Refresh the page.");
   }
   
   function setDiff(A,B,comp){
      return A.filter(function(x) { return B.indexOf(x) < 0 });
   }
})();
