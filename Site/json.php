<?php
date_default_timezone_set('America/Chicago');
$dbname = 'labotz1_EWSGraph';
$dbuser = 'labotz1_databot';
$dbpass = 'Me^G8eXD?=!v';
$host = 'dcs-projects.cs.illinois.edu';

$variables = array("user_count" => "User Count",
                   "unique_user_count" => "Unique User Count",
                   "task_count" => "Task Count",
                   "cpu_user" => "CPU User",
                   "cpu_system" => "CPU System",
                   "cpu_total" => "Total CPU",
                   "mem_used" => "Memory Used",
                   "mem_free" => "Memory Free",
                   "cpu_per_user" => "CPU per User");

$dbconn = mysql_connect($host, $dbuser, $dbpass) or die (json_encode(array("error" => "Could not connect to database")));
mysql_select_db($dbname);

$data = array();

$request = mysql_real_escape_string($_GET['request']);

if($request == "data"){
   $var = mysql_real_escape_string($_GET['var']);
   if(!array_key_exists($var,$variables)){
      $data['error'] = "Invalid variable";
   }else{
      if($var == "cpu_per_user"){
         $var = '(cpu_user+cpu_system)/unique_user_count';
      }elseif($var == "cpu_total"){
         $var = 'cpu_user + cpu_system';
      }
      $start = date("Y-m-d",mysql_real_escape_string($_GET['start'])/1000);
      $end = date("Y-m-d",strtotime("+1 day",mysql_real_escape_string($_GET['end'])/1000));
      $machines = array();
      $query = "SELECT machine_id,time,user_count,".$var." FROM `snapshots`";
      $query .="WHERE time >= '".$start."' AND time < '".$end."' AND machine_id IN (SELECT machine_id FROM `machines` WHERE active=1) ORDER BY time,machine_id"; 
      $result =  mysql_query($query);
      while($row = mysql_fetch_array($result)){
         $m_id = $row['machine_id'];
         if(!array_key_exists($m_id,$machines)){
            $machines[$m_id] = sizeof($data);
            array_push($data,array());
         }
         $value = floatval($row[$var]);
         if($row['user_count'] < 0){
            $value = 0;
         }
         array_push($data[$machines[$m_id]],array('x' => strtotime($row['time'])*1000, 'y' => $value));
      }
   }
}else if($request == "meta"){
   $machines =  array();
   $query = "SELECT id,name FROM `machines` WHERE active=1";
   $result = mysql_query($query);
   while($row = mysql_fetch_array($result)){
      $machines[$row['id']] = $row['name'];
   }
   
   $data['machines'] = $machines;
   $data['vars'] = $variables;
}else{
   $data['error'] = "Invalid request type";
}

mysql_close($dbconn);

$json = json_encode($data);

echo($json);
?>
