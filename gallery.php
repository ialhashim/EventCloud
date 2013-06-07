<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
    $upload_dir = "/var/www/html/uploads/";

	$images = glob($upload_dir."*.png");
	foreach($images as $image) {
		echo '<img src="'.$image.'" /><br />';
	}

?>
