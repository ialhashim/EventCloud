<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
	include_once('global.php');
	
    $verbose = true;
    
	$images = glob($upload_dir."*.{jpg,png,gif}", GLOB_BRACE);
	$videos = glob($upload_dir."*.{mp4}", GLOB_BRACE);
	
	echo "<div id='gallery'>";
	
	// Images
	foreach($images as $image) {
		$img = basename($image);
		$imgFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url.$img;
		
		echo '<div class="thumbnail">';
		
		// Loading image
		echo '<div class="loading-icon-wrapper">';
		echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
		echo '</div>';
		
		// Actual image
		echo '<img class="thumbnail-item" src="'.$imgFullPath.'" /><br />';
		
		echo '</div>';
	} 
	
	// Videos
	foreach($videos as $video) {
		$vid = basename($video);
		$vidFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url.$vid;
		$posterFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url."poster/".str_replace("mp4", "png", $vid);
		
		echo '<div class="thumbnail">';
		
		// Loading image
		echo '<div class="loading-icon-wrapper">';
		//echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
		echo '</div>';
		
		// Actual video
		echo "<video class='thumbnail-item' poster='$posterFullPath'>";
		echo "<source src='{$vidFullPath}' type='video/mp4'>";
		echo '</video> <br />';
			
		echo '</div>';
	}
	
	echo "</div>";
	
?>
