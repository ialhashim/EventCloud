<?php

$MYSQL_NAME = "event_cloud";
$MYSQL_USER = "root";
$MYSQL_PASS = "chixchix";

//$upload_dir = "/var/www/html/uploads/";
$upload_dir = dirname(__FILE__). "/uploads/";
$upload_url = "/uploads/";

function startsWith($haystack, $needle){
    return !strncmp($haystack, $needle, strlen($needle));
}

function endsWith($haystack, $needle){
    $length = strlen($needle);
    if ($length == 0)
        return true;
    return (substr($haystack, -$length) === $needle);
}

function createThumbnailImage($fromImageFile, $resolution, $toImageFile) { 
	$thumb = new Imagick($fromImageFile);
	$thumb->setCompressionQuality(100); 
	$thumb->resizeImage($resolution, $resolution, Imagick::FILTER_CATROM, 1, true);
	
	// When a folder is given
	if(!endsWith($toImageFile, '.jpg')){
		$fileCount = count (glob ($toImageFile.'*.jpg'));
		$newName = $toImageFile . sprintf("%08d",$fileCount + 1) . '.jpg';
	}else{
		$newName = $toImageFile;
	}

	$thumb->setImageCompression(imagick::COMPRESSION_JPEG); 
	$thumb->setImageCompressionQuality(100); 
	$thumb->stripImage(); 
	$thumb->writeImage($newName);
	$thumb->destroy();
	
	// set proper permissions on the new file
	chmod($newName, 0644);					
} 

require 'videoThumbnail.php';
function createThumbnailVideo($fromVideoFile, $resolution, $numFrames, $toVideoFile) { 
	// where ffmpeg is located, such as /usr/sbin/ffmpeg
	$ffmpeg = 'ffmpeg';

	// the input video file
	$video = $fromVideoFile;

	// extract one frame at 10% of the length, one at 30% and so on
	$frames = array('10%', '30%', '50%', '70%', '90%');
	
	$N = 5;
	
	$frames = array();
	for ($i = 1; $i < $N; $i++) {
		$frames[] = (((float)$i / $N) * 100).'%';
	}

	// set the delay between frames in the output GIF
	$joiner = new VideoThumbnailJoin(1);
	
	// loop through the extracted frames and add them to the joiner object
	$allFrames = new VideoThumbnail($video, $frames, $resolution.'x'.$resolution, $ffmpeg);
	foreach ($allFrames as $key => $frame) {
		$joiner->add($frame);
	}
	
	// When a folder is given
	if(!endsWith($toVideoFile, '.gif')){
		$fileCount = count (glob ($toVideoFile.'*.gif'));
		$newName = $toVideoFile . sprintf("%08d",$fileCount + 1) . '.gif';
	}else{
		$newName = $toVideoFile;
	}
	
	$joiner->save($newName);
	
	// set proper permissions on the new file
	chmod($newName, 0644);	
}

?>
