<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
	include_once('global.php');
	
	function chunkTime( $chunk ){
		$time1 = new Datetime($chunk['start']);
		$time2 = new Datetime();
		$interval =  $time2->getTimestamp() - $time1->getTimestamp();
		return $interval;
	}
	
	function insertMedia($tempFile, $eid, $uid, $meta = '')
	{
		global $db;
		global $upload_dir;
		
		$ext = right($tempFile, 3);
		
		// Add media record to DB
		$mid = -1;
		{
			// Check last chunk time, create new if needed
			$chunkThreshold = 30; // seconds
			$chunks = $db->Select( 'chunks', array('eid' => $eid), '*', strsql('index'). ' DESC ');
			
			// Treat all results as an array
			if(array_key_exists('cid',$chunks)) $chunks[0] = $chunks;
			
			$chunk = $chunks[0];
			
			if( chunkTime($chunk) > $chunkThreshold )
			{
				// Increase chunk index
				$newCIDX = $chunk['index'] + 1;
				
				// Create new chunk
				$chunk['cid'] = $db->InsertReturnId( array('eid' => $eid, 'index' => $newCIDX), 'chunks' );
			}
			
			$vars = array('uid'=> $uid, 'uid' => $uid, 'cid' => $chunk['cid'], 'type' => $ext);
			$vars['meta'] = "";
			$vars['lat'] = 0;
			$vars['long'] = 0;
			//$vars['timestamp'] = date("Y-m-d H:i:s", filemtime($tempFile));
			
			$mid = $db->InsertReturnId($vars, 'media');
		}
		
		// Create previews
		$basename = getMediaBasename( $mid, $ext );
		$thumbFilename = $upload_dir.$eid."/".$basename;

		if($ext == 'jpg' || $ext == 'png')	createThumbnailImage($tempFile, 500, $thumbFilename);
		if($ext == 'mp4')					createThumbnailVideo($tempFile, 500, 5, $thumbFilename);
				
		// Move full version from a temporary location
		$fullFileName = $upload_dir.$eid."/full/".$basename;
		moveFile( $tempFile, $fullFileName );
		
		return $mid;
	}
	
	function updateMediaLocation( $mid, $lat, $long )
	{
		global $db;
		
		$vars = array();
		$vars['lat'] = $lat;
		$vars['long'] = $long;
		
		$db->Update('media', $vars, array("mid" => $mid));
		
		// Return file name
		return getMediaFilename( $mid );
	}
	
	function deleteMedia( $mid )
	{
		echo "not implemented yet..";
	}
	
	function getMediaBasename( $mid, $type )
	{
		$basename = sprintf("%010d",$mid) . '.' . $type;
		return $basename;
	}
	
	function getMediaFilename( $mid )
	{
		global $db;
		global $upload_dir;
		
		$media = $db->Select('media' , array("mid" => $mid) );
		$event = $db->Select('chunks', array("cid"=>$media['cid']), 'eid');
		
		$basename = getMediaBasename( $mid, $media['type'] );
		
		return $upload_dir.$event['eid'].'/'.$basename;
	}
	
	function saveUploadedMedia( &$log = "" )
	{
		global $upload_dir;
		global $eid;
		global $uid;
		
		$mid = -1;
		
		if (empty($_FILES["file"]) || empty($_POST['eid'])) return $mid;
		
        $myFile = $_FILES["file"];
		
        // Check upload is fine
        if ($myFile["error"] !== UPLOAD_ERR_OK) {
            $log .= "<p class='message-box error'> ERROR: An error occurred with the upload. Here is what I got: </p>";
            $log .= "<p'><pre>" . var_export($_FILES,true) . "</pre></p>";
        }
        
        // Check directory
        if (file_exists($upload_dir.$eid.'/') && is_writable($upload_dir.$eid.'/'))
            $log .= "<p class='message-box ok'> Info: Directory ok :) </p>";
        else 
            $log .= "<p class='message-box error'> ERROR: Upload directory is not writable, or does not exist: [ " . $upload_dir.$eid.'/' . " ] </p>" ;
        
        // ensure a safe filename
        $name = preg_replace("/[^A-Z0-9._-]/i", "_", $myFile["name"]);
        
        if(strlen($name))
        {
            $finalFileName =  $upload_dir.$eid.'/tmp/' . $name;
            
			// Erase if exists
			if( file_exists($finalFileName) )
			    unlink($finalFileName); //remove the file
			
            // preserve file from temporary directory
            $success = move_uploaded_file($myFile["tmp_name"], $finalFileName);
            
            if (!$success) 
                $log .= "<p class='message-box error'>Unable to save file : " . $myFile["name"]  . "</p>";    
            else
            {
            	$mid = insertMedia($finalFileName, $eid, $uid);

                $log .= "<p class='message-box ok'> File uploaded :) </p>";
            }
        }
		
		return $mid;
    }
    
    function getAllChunks( $eid ){
    	global $db;
    	$chunks = $db->Select( 'chunks', array( "eid" => $eid ), '*', strsql('index'). ' ASC ');
		if(is_array($chunks) && array_key_exists('cid',$chunks)) $chunks[0] = $chunks; // Treat all results as an array
		return $chunks;
    }
    
    function getChunkByIndex( $cidx, $eid ){
		$chunks = getAllChunks( $eid );
		return $chunks[$cidx];
    }
	
	function getLatestChunk( $eid ){
		$chunks = getAllChunks( $eid );
		if(is_array($chunks))
			return end($chunks);
		else 
			return "";
	}
	
	function getMediaForChunk( $cid, $count = -1 ){
		global $db;
		
		// Get all media of chunk 'id', sorted by their time stamp
		$media = $db->Select( 'media', array( "cid" => $cid ), '*', strsql('timestamp') );
		
		if($count > 0){
			$media = array_slice( $media, 0, $count );
		}
		
		return $media;
	}
	
    // Update requests
    if(!empty($_POST['request']) && $_POST['request'] == "updateCoord")
    {
		echo updateMediaLocation( $_POST['mid'], $_POST['latitude'], $_POST['longitude'] );
		die();
    }
    
    // By default, upload media sent with this script
    if(!empty($_FILES["file"]) && empty($_POST['manual']))
	{
    	echo saveUploadedMedia();
		die();
	}
	
	$count = -1; if(!empty($_POST['count'])) $count = $_POST['count'];
	
	// Get specific chunk by its index
	if(!empty($_POST['request']) && $_POST['request'] == "getChunk")
    {
    	$result = array();
		$result[] = getChunkByIndex( $_POST['cidx'], $eid );
		
		if(is_array($latestChunk))
		{
			$result[] = getMediaForChunk( $result[0]['cid'], $count );
			echo json_encode( $result );
			die();
		}
	}
	
	// Get latest chunk
	if(!empty($_POST['request']) && $_POST['request'] == "getLatestChunk")
    {
    	$result = array();
		$latestChunk = getLatestChunk( $eid );
		
		if(is_array($latestChunk))
		{
			$result[] = $latestChunk;
			$result[] = getMediaForChunk( $latestChunk['cid'], $count );
			echo json_encode( $result );
			die();
		}
	}
	
?>
	
