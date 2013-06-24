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
    
    // Update requests
    if(!empty($_POST['request']) && $_POST['request'] == "updateCoord")
    {
		echo updateMediaLocation( $_POST['mid'], $_POST['latitude'], $_POST['longitude'] );
		die();
    }
    
    // By default, upload media sent with this script's request
    if(!empty($_FILES["file"]) && empty($_POST['manual']))
	{
    	echo saveUploadedMedia();
		die();
	}
?>
	
