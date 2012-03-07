<?php
date_default_timezone_set('America/Chicago');
$dbname = 'labotz1_EWSGraph';
$dbuser = 'labotz1_databot';
$dbpass = 'Me^G8eXD?=!v';
$host = 'dcs-projects.cs.illinois.edu';

$SECRET_KEY = "Zw6n2zedQx87FtRrsluuHhot04XQrX4r";


$dbconn = mysql_connect($host, $dbuser, $dbpass) or die (json_encode(array("error" => "Could not connect to database")));
mysql_select_db($dbname);

$request = mysql_real_escape_string($_GET['request']);

if($request == "data"){
   $query = "SELECT snapshots.machine_id,snapshots.time,cpu_user,cpu_system,unique_user_count,users,id FROM snapshots JOIN (SELECT MAX(time) as time,machine_id FROM snapshots GROUP BY machine_id) AS s ON s.machine_id=snapshots.machine_id AND s.time=snapshots.time"; 
   $result =  mysql_query($query);
   $data = array();
   while($r = mysql_fetch_assoc($result)) {
       $data[] = $r;
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
