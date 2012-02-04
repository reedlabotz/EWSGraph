<?php
date_default_timezone_set('America/Chicago');
$dbname = 'labotz1_EWSGraph';
$dbuser = 'labotz1_databot';
$dbpass = 'Me^G8eXD?=!v';
$host = 'dcs-projects.cs.illinois.edu';

$variables = array("user_count" => "User Count",
                   "task_count" => "Task Count",
                   "cpu_user" => "CPU User",
                   "cpu_system" => "CPU System",
                   "mem_used" => "Memory Used",
                   "mem_free" => "Memory Free");

$dbconn = mysql_connect($host, $dbuser, $dbpass) or die (json_encode(array("error" => "Could not connect to database")));
mysql_select_db($dbname);

$data = array();

$request = mysql_real_escape_string($_GET['request']);

if($request == "data"){
   $var = mysql_real_escape_string($_GET['var']);
   if(!array_key_exists($var,$variables)){
      $data['error'] = "Invalid variable";
   }else{
      $start = date("Y-m-d H:i:s",mysql_real_escape_string($_GET['start'])/1000);
      $end = date("Y-m-d H:i:s",mysql_real_escape_string($_GET['end'])/1000);
      $machines = array();
      $query = "SELECT machine_id,time,".$var." FROM `snapshots` JOIN `machines` ON `snapshots`.machine_id=`machines`.id ";
      $query .="WHERE `machines`.active=1 AND `snapshots`.time >= '".$start."' AND `snapshots`.time <= '".$end."'"; 
      $result =  mysql_query($query);
      while($row = mysql_fetch_array($result)){
         $m_id = $row['machine_id'];
         if(!array_key_exists($m_id,$machines)){
            $machines[$m_id] = sizeof($data);
            array_push($data,array());
         }
         array_push($data[$machines[$m_id]],array('x' => strtotime($row['time'])*1000, 'y' => floatval($row[$var])));
      }
   }
}else if($request == "vars"){
   $data = $variables;
}else if($request == "machines"){
   $query = "SELECT id,name FROM `machines` WHERE active=1";
   $result = mysql_query($query);
   while($row = mysql_fetch_array($result)){
      $data[$row['id']] = $row['name'];
   }
}else{
   $data['error'] = "Invalid request type";
}

mysql_close($dbconn);

$json = json_encode($data);

echo($json);
?>
