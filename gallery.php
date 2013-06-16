<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
	include_once('global.php');
    $verbose = true;
	
	// Assign correct upload path
	if(!empty($_POST["eid"])) $eid = intval( $_POST['eid'] );
	if(!empty($_GET["eid"])) $eid = intval( $_GET['eid'] );
	
	$upload_dir .= $eid.'/';
	$upload_url .= $eid.'/';
	
	$images = glob($upload_dir."*.{jpg,png,gif}", GLOB_BRACE);
	$videos = glob($upload_dir."*.{mp4}", GLOB_BRACE);

	$media_files = array();

	// Fill array with media
	foreach($images as $image) $media_files[] = array('type' => 'image', 'file' => $image, 'time' => filectime($image));
	foreach($videos as $video) $media_files[] = array('type' => 'video', 'file' => $video, 'time' => filectime($video));
	
	// Sort by time
	usort($media_files, function($a, $b) {return $a['time'] - $b['time'];});
		
	$media_count = count($media_files);
	
	// Slice based on given arguments
	if(isset($_GET["start"])) $start = intval($_GET["start"]); else $start = 0;
	if(isset($_GET["count"])) $count = intval($_GET["count"]); else $count = 3;
	
	// Circular access test
	if(true)
	{
		$media_files = array_shift_circular($media_files, -$start);
		$start = 0;
	}
	
	$media_files = array_slice($media_files, $start, $count);
	
	foreach($media_files as $media) {
		$type = $media['type'];
		$filename = $media['file'];
		$time = $media['time'];
		
		/// Images
		if($type == "image")
		{
			$img = basename($filename);
			$imgFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url.$img;
			
			echo '<div class="thumbnail">';
			
			// Loading image
			//echo '<div class="loading-icon-wrapper">';
			//echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
			//echo '</div>';
			
			// Actual image
			echo '<img class="thumbnail-item" src="'.$imgFullPath.'" />';
			
			echo '</div>';
		}
		
		/// Videos
		if($type == "video")
		{
			$vid = basename($filename);
			$vidThumbFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url.$vid;
			$posterFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url."poster/".str_replace("mp4", "png", $vid);
			
			echo '<div class="thumbnail">';
			
			// Loading image
			//echo '<div class="loading-icon-wrapper">';
			//echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
			//echo '</div>';
			
			// Actual video
			echo "<video class='thumbnail-item NoSwiping' poster='$posterFullPath' muted>";
			echo "<source src='{$vidThumbFullPath}' type='video/mp4'>";
			echo '</video> <br />';
				
			echo '</div>';
		}
	} 
	
	//echo "<!-- Start={$start}, Count={$count} -->";
	
?>
