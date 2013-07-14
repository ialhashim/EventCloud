<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
	include_once('global.php');
	
	function GoogleStaticMap( $width, $height, $lat, $long, $zoom = 17 )
	{
		$latlng = $lat . "," . $long;
		
		$parts = array(
			'center'  => $latlng,
			'zoom'    => $zoom,
			'size'    => $width.'x'.$height,
			'maptype' => 'roadmap',
			'sensor'  => 'false',
			'format'  => 'png',
			'scale'   => '2',
			'visual_refresh' => 'true'
		);      
		$requestURL = "http://maps.googleapis.com/maps/api/staticmap?".http_build_query($parts);
			
		// Get image file from Google Maps
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $requestURL);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$file = curl_exec($ch);
		curl_close($ch);
		
		//file_put_contents($imgFile, $file);
		return array('url' => $requestURL,'data' => base64_encode($file));
	}
	
	$result = array();

	$db = connectDB();
	$event = $db->Select('events', array("eid"=>$eid));
	$user = $db->Select('users', array("uid"=>$uid));
	$media = $db->Select('media', array("mid"=>$mid));
		
	$vars = $_POST;
	
	$result['postStuff'] = $vars;
	$result['event'] = $event;
	$result['user'] = $user;
	$result['media'] = $media;
	$result['mapImage'] = GoogleStaticMap( $vars['width'], $vars['height'], $event['lat'], $event['long'], $vars['zoom'] );
	
	echo json_encode( $result );
	die();
?>
	
