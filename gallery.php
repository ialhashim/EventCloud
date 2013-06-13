<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
	include_once('global.php');
	
    $verbose = true;
    
	$images = glob($upload_dir."*.{jpg,png,gif}", GLOB_BRACE);
	
	echo "<div id='gallery'>";
	
	foreach($images as $image) {
		$img = basename($image);
		
		$imgFullPath = 'http://'.$_SERVER['SERVER_ADDR'].$upload_url.$img;
		//$imgFullPath = $upload_url.$img;
		
		echo '<div class="thumbnail">';
		
		echo '<div class="loading-icon-wrapper">';
		echo '<i class="loading-icon icon-refresh icon-spin" style=""></i>';
		echo '</div>';
		
		echo '<img class="thumbnail-img" src="'.$imgFullPath.'" /><br />';
		
		echo '</div>';
	} 
	
	echo "</div>";
	
?>
