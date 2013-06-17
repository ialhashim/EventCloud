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
	
	if($request == "clearAll"){
		$query = "TRUNCATE TABLE events";
		$result = $mysql->ExecuteSQL($query);
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
			$upload_dir .= $eid;
			makePublicFolder($upload_dir);
			makePublicFolder($upload_dir.'/tmp');
			makePublicFolder($upload_dir.'/full');
			makePublicFolder($upload_dir.'/poster');
			
			// Add default initial images
			{
				$tempFolder = $upload_dir.'/tmp/';
			
				include_once('drawAwesome.php');
				
				$slide_files = array();
				
				// Slide 1
				{
					$items = array();
						
					// Main logo
					$top = 0.2;
					$items[] = pictureItem	( 0.10, $top + 0.11, $icons['cloud'], 'hsb(57%,50%,40%)', 3.0, 0 );
					$items[] = pictureItem	( 0.16, $top + 0.15, $icons['cloud'], 'hsb(57%,50%,55%)', 2.5, 1 ); /*light*/
					$items[] = textItem		( 0.305, $top + 0.255, 'Eventful Cloud', 'black', 1, 2 );
					$items[] = textItem		( 0.3, $top + 0.25, 'Eventful Cloud', 'white', 1, 3 );
					
					// Background clouds
					$items[] = pictureItem	( -0.25, -0.22, $icons['cloud'], 'rgba(100%,100%,100%, 0.1)', 6.0, 0 );
					$items[] = pictureItem	( 0.5, 0.2, $icons['cloud'], 'rgba(100%,100%,100%, 0.1)', 6.0, 0 );
					$items[] = pictureItem	( 0.0, 0.6, $icons['cloud'], 'rgba(100%,100%,100%, 0.05)', 6.0, 0 );
					
					$slide_files[0] = drawAwesomeImage( $items, 500, 500, $tempFolder, 'rgb(90,128,170)' );
				}
				
				// Slide 2
				{
					$items = array();
					
					$items[] = textItem		( 0.1, 0.1, 'you can..', 'rgba(100%,100%,100%, 0.8)', 1, 0 );
					$items[] = pictureItem	( 0.1, 0.3, $icons['camera'], 'hsb(57%,50%,100%)', 1.0, 0 );
					$items[] = textItem		( 0.25, 0.3, 'Snap photos', 'white', 1, 0 );
					
					$items[] = pictureItem	( 0.1, 0.5, $icons['video'], 'hsb(30%,50%,100%)', 1.0, 0 );
					$items[] = textItem		( 0.25, 0.5, 'Capture videos', 'white', 1, 0 );
					
					$items[] = pictureItem	( 0.1, 0.7, $icons['upload'], 'hsb(20%,50%,100%)', 1.0, 0 );
					$items[] = textItem		( 0.25, 0.7, 'Upload media', 'white', 1, 0 );
								
					$slide_files[1] = drawAwesomeImage( $items, 500, 500, $tempFolder, '#ff8604' );
				}
				
				// Slide 3
				{
					$items = array();
					
					$items[] = pictureItem	( 0.5, 0.5, $icons['arrow-right'], 'white', 4.0, 0 );
					$items[] = pictureItem	( 0.51, 0.51, $icons['arrow-right'], 'black', 4.0, 0 );
					
					$items[] = textItem		( 0.1, 0.1, 'Enjoy!', 'white', 2, 0 );
								
					$slide_files[2] = drawAwesomeImage( $items, 500, 500, $tempFolder, '#49a430' );
				}

				foreach ($slide_files as $file) {
					handleFile($file, $upload_dir.'/');
				}
			}
		}
		
		$result = intval($eid);
	}
	
	echo json_encode($result);
?>
