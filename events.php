<?php
	header('Content-Type: application/json');
	
	include_once('mysql.php');
	include_once('global.php');
	$mysql = new MySQL($MYSQL_NAME, $MYSQL_USER, $MYSQL_PASS);

	// Save options into variables
	if(isset($_GET["request"]))	$request = $_GET["request"]; else $request = "";
	if(isset($_GET["eid"]))	$eid = $_GET["eid"]; else $eid = -1;
	
	$result = array();
	
	// Return result based on request type
	if($request == "all"){
		$result = $mysql->ExecuteSQL("SELECT * FROM events");
	}
	
	if($request == "name"){
		$result = $mysql->Select( 'events', array("eid" => $eid), 'name' );
	}

	echo json_encode($result);
?>
