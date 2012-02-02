<?php
$dbname = 'labotz1_EWSGraph';
$dbuser = 'labotz1_databot';
$dbpass = 'Me^G8eXD?=!v';
$host = 'dcs-projects.cs.illinois.edu';

$dbconn = mysql_connect($host, $dbuser, $dbpass) or die ('Could not connect to database: ' . mysql_error());
mysql_select_db($dbname);

$machines = array();
$data = array();

$query = "SELECT machine_id,cpu_user,time FROM `snapshots`"; 
$result =  mysql_query($query);
while($row = mysql_fetch_array($result)){
  $m_id = $row['machine_id'];
  if(!array_key_exists($m_id,$machines)){
    $machines[$m_id] = sizeof($data);
    array_push($data,array());
  }
  array_push($data[$machines[$m_id]],array('x' => $row['time'], 'y' => $row['cpu_user']));
}

mysql_close($dbconn);

$json = json_encode($data);

echo($json);
?>
