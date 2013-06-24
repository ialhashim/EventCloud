<?php
	header('Content-Type: application/json');
	
	include_once('global.php');
	include_once('mediaManager.php');

	$result = array();
	
	// Return result based on request type
	if($request == "all"){
		$result = $db->ExecuteSQL("SELECT * FROM events");
	}
	
	if($request == "name"){
		$result = $db->Select( 'events', array("eid" => $eid) );
	}
	
	if($request == "clearAll"){
		$result = $db->ExecuteSQL( "TRUNCATE TABLE events" );
		$result = $db->ExecuteSQL( "TRUNCATE TABLE chunks" );
		$result = $db->ExecuteSQL( "TRUNCATE TABLE media" );
		
		// Delete all media files and folders
		deleteDir( $upload_dir );
		makePublicFolder( $upload_dir );
	}
	
	if($request == "create"){
		$name = $_POST["eventname"];
		$chunks = intval($_POST["numchunks"]);
		$maptype = $_POST["maptype"];
		$lat = $_POST["latitude"];
		$long = $_POST["longitude"];
		
		$vars = array('name' => $name, 'chunks' => $chunks, 'maptype' => $maptype, 'lat' => $lat, 'long' => $long);
		
		// Create new event
		$eid = $db->NewInsertID( 'events' );
		$result = $db->Insert( $vars, 'events' );
		
		if(!$result) 
			$eid = -1;
		else{
			makePublicFolder($upload_dir.$eid);
			makePublicFolder($upload_dir.$eid.'/tmp');
			makePublicFolder($upload_dir.$eid.'/full');
			makePublicFolder($upload_dir.$eid.'/poster');
			
			// Make event poster using maps
			if($maptype == 'real'){
				$zoom = 17;
				$latlng = $lat . "," . $long;
				
				$parts = array(
			        'center'  => $latlng,
			        'zoom'    => $zoom,
			        'size'    => '500x500',
			        'maptype' => 'roadmap',
			        'sensor'  => 'false',
			        'format'  => 'png',
			        'visual_refresh' => 'true'
			    );      
			    $requestURL = "http://maps.googleapis.com/maps/api/staticmap?".http_build_query($parts);
					
				$eventPoster = $upload_dir.$eid.'/eventPoster.png';
				
				// Get image file from Google Maps
				{
					$ch = curl_init();
					curl_setopt($ch, CURLOPT_URL, $requestURL);
					curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
					$file = curl_exec($ch);
					curl_close($ch);
					
			    	file_put_contents($eventPoster, $file);
				}
			}
			
			// Add default initial images
			{
				$tempFolder = $upload_dir.$eid.'/tmp/';
			
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

				// Add an initial chunk[0]
				$db->Insert(array('eid' => $eid, 'index' => 0), 'chunks');
				
				for($i = 0; $i < 3; $i++)
				{
					$mid = insertMedia($slide_files[$i], $eid, $uid);
					updateMediaLocation($mid, $lat, $long);
				}
			}
		}
		
		$result = intval($eid);
	}
	
	echo json_encode($result);
?>
