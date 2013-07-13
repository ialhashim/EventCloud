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
		global $chunkThreshold;
		
		$ext = strtolower(right($tempFile, 3));
		
		// Add media record to DB
		$mid = -1;
		{
			// Check last chunk time, create new if needed
			$chunks = $db->Select( 'chunks', array('eid' => $eid), '*', strsql('index'). ' DESC ');
			
			// Treat all results as an array
			if(array_key_exists('cid',$chunks)) $chunks[0] = $chunks;
			
			$chunk = $chunks[0];
			
			if( chunkTime($chunk) > $chunkThreshold )
			{
				// Increase chunk index
				$newCIDX = $chunk['index'] + 1;
				
				// Create new chunk
				$chunk['cid'] = $db->InsertReturnId( array('eid' => $eid, 'index' => $newCIDX, 'length' => $chunkThreshold), 'chunks' );
			}
			
			$vars = array('uid'=> $uid, 'uid' => $uid, 'cid' => $chunk['cid'], 'type' => $ext);
			$vars['meta'] = "";
			$vars['lat'] = 0;
			$vars['long'] = 0;
			//$vars['timestamp'] = date("Y-m-d H:i:s", filemtime($tempFile));
			
			if(!empty($_POST['creationdate'])){
				$d = date_create_from_format("D M j G:i:s T Y", $_POST['creationdate']);
				//$vars['timestamp'] = $d->format('Y-m-d H:i:s');
			}
				
			
			$mid = $db->InsertReturnId($vars, 'media');
			
			// Default media caption
			$event = $db->Select( 'events', array("eid" => $eid) );
			$caption = $event['name'] . ' / '. $mid;
			$db->Update('media', array('caption' => $caption), array("mid" => $mid));
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
            if(!isset($myFile['special']))
            	$success = move_uploaded_file($myFile["tmp_name"], $finalFileName);
			else{
				$success = copy($myFile["tmp_name"], $finalFileName);
				unlink( $myFile["tmp_name"] );
			}
            
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
		if(is_array($chunks) && array_key_exists('cid',$chunks)) 
			$chunks = array(0 => $chunks); // Treat all results as an array
		return $chunks;
    }
    
    function getChunkByIndex( $cidx, $eid ){
		$chunks = getAllChunks( $eid );
		return $chunks[$cidx];
    }
	
	function getLatestChunk( $eid ){
		global $chunkThreshold;
		
		$chunks = getAllChunks( $eid );
		if(is_array($chunks))
		{
			$l = count($chunks) - 1;
			
			// Only give ready chunks
			if(chunkTime($chunks[$l]) < $chunkThreshold)
				$l = max(0, $l - 1);
			
			return $chunks[$l];
		}
		else 
			return "";
	}
	
	function getMediaForChunk( $cid, $count = -1 ){
		global $db;
		
		// Get all media of chunk 'id', sorted by their time stamp
		$media = $db->Select( 'media', array( "cid" => $cid ), '*', strsql('timestamp') );
		if($count > 0) $media = array_slice( $media, 0, $count );
		
		return $media;
	}
	
    // Update requests
    if(!empty($_POST['request']) && $_POST['request'] == "updateCoord")
    {
		echo updateMediaLocation( $_POST['mid'], $_POST['latitude'], $_POST['longitude'] );
		die();
    }
	
	// Upload images via browser capture
	if(!empty($_POST['request']) && $_POST['request'] == "uploadCaptured")
    {
    	$tempFolder = $upload_dir.$eid.'/tmp/';
		
    	$decocedData = base64_decode( $_POST['data'] );
    	
		$tempUID = uniqid(rand(), true);
		$tempFile = $tempFolder . $tempUID . '.jpg';
		
		file_put_contents( $tempFile, $decocedData );
		$_FILES["file"] = array('name' => $tempFile, 'error' => UPLOAD_ERR_OK, 'tmp_name' => $tempFile, 'special' => true);
		
		echo saveUploadedMedia();
    	die();
	}
	
	// Upload videos via browser capture
	if(!empty($_POST['request']) && $_POST['request'] == "uploadCapturedVideo")
    {
    	$fps = $_POST['fps'];
    	
    	$tempFolder = $upload_dir.$eid.'/tmp/';
		$tempUID = uniqid(rand(), true);
		$tempFile = $tempFolder . $tempUID. '-';
		$seqFormat = '%04d';
	
    	// Extract data into frames
    	$tmpFiles = array();
		$jsonVideoFrames = json_decode( $_POST['data'] );
		for ($i = 0; $i < count($jsonVideoFrames); $i++)
		{
			$frame = base64_decode( $jsonVideoFrames[$i] );
			$decocedFrames[] = $frame;
			
			$curFile = $tempFile . sprintf($seqFormat, $i) . '.jpg';
			file_put_contents( $curFile, $frame );
			$tmpFiles[] = $curFile;
		}
		
		// Create video from images
		$ffmpeg_cmd = "ffmpeg -i ". $tempFile . $seqFormat . '.jpg' . " -r " . $fps . " " . $tempFile . ".mp4";
		@system($ffmpeg_cmd);
		
		// Fake upload
		$tempFile .= '.mp4';
		$_FILES["file"] = array('name' => $tempFile, 'error' => UPLOAD_ERR_OK, 'tmp_name' => $tempFile, 'special' => true);
		
		// Delete temporary frame files
		foreach ($tmpFiles as $file)  unlink($file);
		
		// Save media
		echo saveUploadedMedia();
		die();
	}

	// Get media information
	if(!empty($_POST['request']) && $_POST['request'] == "getInfo")
    {
    	global $db;
		
		$media = $db->Select('media' , array("mid" => $mid) );
		$media['author'] = $db->Select( 'users', array( "uid" => $media['uid'] ) );
		$chunk = $db->Select('chunks', array("cid"=>$media['cid']) );
		$media['event'] = $db->Select('events', array("eid"=>$chunk['eid']));
		
    	echo json_encode( $media );
		die();
	}
	
	// Get media representation
	if(!empty($_POST['request']) && $_POST['request'] == "getRepImage")
    {
  		global $db;
    	global $upload_dir;     	
    	
		$media = $db->Select('media' , array("mid" => $mid) );
		$basename = getMediaBasename( $mid, $media['type'] );
    	$fullImage = $upload_dir.$eid."/full/".$basename;
    	$mid = new Imagick( $fullImage );
		$mid->setImageFormat("jpeg");
		$mid->scaleImage(1920,0);
    	echo json_encode( array('fullImage' => $fullImage, 'data' => base64_encode($mid->getImageBlob())) );
    	die();
	}
	
	// Uploadify hack
	if(!empty($_FILES) && !empty($_FILES['Filedata'])){
		$_FILES["file"] = $_FILES['Filedata'];
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
		
		if(is_array($result[0]))
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
	
	// Get chunk of given 'mid'
	if(!empty($_POST['request']) && $_POST['request'] == "getChunkByMid")
    {
    	global $db;
    	global $upload_dir;     	
		$media = $db->Select('media' , array("mid" => $mid) );
		
		$chunkMedia = getMediaForChunk( $media['cid'], $count );
		
		// Treat all results as an array
		if(array_key_exists('mid',$chunkMedia)) { $chunkMedia = array(0 => $chunkMedia); };
		
		echo json_encode( $chunkMedia );
		die();
	}
?>
	
