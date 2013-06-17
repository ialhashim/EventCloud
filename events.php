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
	
	if($request == "create"){
		$name = $_GET["eventname"];
		$chunks = intval($_GET["numchunks"]);
		
		$vars = array('name' => $name, 'chunks' => $chunks);
		
		// Create new event
		$eid = $mysql->NewInsertID( 'events' );
		$result = $mysql->Insert( $vars, 'events' );
		
		if(!$result) 
			$eid = -1;
		else{
			mkdir($upload_dir.$eid, 0777);
			mkdir($upload_dir.$eid.'/tmp', 0777);
			mkdir($upload_dir.$eid.'/full', 0777);
			mkdir($upload_dir.$eid.'/poster', 0777);
		}
		
		$result = intval($eid);
	}
	
	if($request == "clearAll"){
		$query = "TRUNCATE TABLE events";
		$result = $mysql->ExecuteSQL($query);
	}
	
	echo json_encode($result);
?>
