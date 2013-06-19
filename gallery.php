<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
	include_once('global.php');
    $verbose = true;
	
	// Assign correct upload path
	$upload_dir .= $eid.'/';
	$upload_url .= $eid.'/';
	
	$images = glob($upload_dir."*.{jpg,png,gif}", GLOB_BRACE);
	$videos = glob($upload_dir."*.{mp4}", GLOB_BRACE);

	$media_files = array();

	// Fill array with media
	foreach($images as $image) $media_files[] = array('type' => 'image', 'file' => $image, 'time' => filectime($image));
	foreach($videos as $video) $media_files[] = array('type' => 'video', 'file' => $video, 'time' => filectime($video));
	
	// Sort by time
	//usort($media_files, function($a, $b) {return $a['time'] - $b['time'];});
	usort($media_files, function($a, $b) {return $a['file'] > $b['file'];});
		
	$media_count = count($media_files);
	
	// Slice based on given arguments
	if(isset($_POST["start"])) $start = intval($_POST["start"]); else $start = 0;
	if(isset($_POST["count"])) $count = intval($_POST["count"]); else $count = 3;
	
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
			echo '<div class="thumbnail">';
			
			// Loading image
			//echo '<div class="loading-icon-wrapper">';
			//echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
			//echo '</div>';
			
			// Actual image
			makeImageItem( basename($filename), $upload_url, $server_address );

			echo '</div>';
		}
		
		/// Videos
		if($type == "video")
		{
			$vid = basename($filename);

			echo '<div class="thumbnail">';
			
			// Loading image
			//echo '<div class="loading-icon-wrapper">';
			//echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
			//echo '</div>';
			
			// Actual video
			makeVideoItem($vid, $upload_url, $server_address);
				
			echo '</div>';
		}
	} 
	
	//echo "<!-- Start={$start}, Count={$count} -->";
	
	function makeImageItem($img, $upload_url, $server_address, $withLink = false){
		if($withLink)
			echo '<a href='.$server_address.$upload_url.'full/'.$img.'><img class="thumbnail-item" src="'.$server_address.$upload_url.$img.'" /></a>';
		else
			echo '<img class="thumbnail-item" src="'.$server_address.$upload_url.$img.'" />';
	}
	
	function makeVideoItem($vid, $upload_url, $server_address, $withLink = false){
		$posterFullPath = $server_address.$upload_url."poster/".str_replace("mp4", "png", $vid);
		$vidThumbFullPath = $server_address.$upload_url.$vid;
			
		if($withLink){
			
		}else{
			echo "<video class='thumbnail-item NoSwiping' poster='$posterFullPath' muted>";
			echo "<source src='{$vidThumbFullPath}' type='video/mp4'>";
			echo '</video> <br />';
		}
	}
?>
