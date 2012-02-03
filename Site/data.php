<?php
$dbname = 'labotz1_EWSGraph';
$dbuser = 'labotz1_databot';
$dbpass = 'Me^G8eXD?=!v';
$host = 'dcs-projects.cs.illinois.edu';

$dbconn = mysql_connect($host, $dbuser, $dbpass) or die ('Could not connect to database: ' . mysql_error());
mysql_select_db($dbname);

$machines = array();
$data = array();

$query = "SELECT machine_id,time,user_count FROM `snapshots`"; 
$result =  mysql_query($query);
while($row = mysql_fetch_array($result)){
   $m_id = $row['machine_id'];
   if(!array_key_exists($m_id,$machines)){
      $machines[$m_id] = sizeof($data);
      array_push($data,array());
   }
   array_push($data[$machines[$m_id]],array('x' => strtotime($row['time'])*1000, 'y' => intval($row['user_count'])));
}

mysql_close($dbconn);

$json = json_encode($data);

echo($json);
?>
