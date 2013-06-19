<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
	include_once('global.php');
	
	function insertMedia($file, $eid, $uid, $meta = '')
	{
		global $db;
		global $upload_dir;
		
		$newName = '';
		
		// Create previews
		if(endsWith($file,'.jpg') || endsWith($file,'.png'))	
			$newName = createThumbnailImage($file, 500, $upload_dir.$eid."/");
		
		if(endsWith($file,'.mp4'))	
			$newName = createThumbnailVideo($file, 500, 5, $upload_dir.$eid."/");
				
		// Move full version from a temporary location
		$fullFileName = $upload_dir.$eid."/full/".$newName;
		moveFile( $file, $fullFileName );
		
		// Add media record to DB
		$mid = -1;
		{
			$chunk = array_slice( $db->Select( 'chunks', array('eid' => $eid), 'cid' ), -1, 1, true );
			
			$vars = array('uid'=> $uid, 'uid' => $uid, 'cid' => $chunk['cid'], 'type' => right($file,3));
			$vars['meta'] = "";
			$vars['lat'] = 0;
			$vars['long'] = 0;
			
			$mid = $db->InsertReturnId($vars, 'media');
		}
		
		return getMedia( $mid );
	}
	
	function deleteMedia( $mid )
	{
		echo "not implemented yet..";
	}
	
	function getMedia( $mid )
	{
		global $db;
		global $upload_dir;
		
		$media = $db->Select( 'media', array("mid" => $mid) );
		$event = $db->Select('chunks', array("cid"=>$media['cid']), 'eid');
		
		$basename = sprintf("%08d",$mid) . '.' . $media['type'];
		
		return $upload_dir.$event['eid'].'/'.$basename;
	}
?>
	
