<?php

/// Global parameters

// Server location
$server_address = 'https://' . $_SERVER['REMOTE_ADDR'];

// Worker
$workerNode = 'ec2-54-218-167-210.us-west-2.compute.amazonaws.com'; 

// Media location
$upload_dir = dirname(__FILE__). "/uploads/";
$upload_url = "/uploads/";

// Event parameters
$chunkThreshold = 20; // seconds

date_default_timezone_set('UTC');
			
$MYSQL_HOST = "eventfulcloud.clfp4bwzq9e9.us-west-2.rds.amazonaws.com";
$MYSQL_NAME = "event_cloud";
$MYSQL_USER = "root";
$MYSQL_PASS = "chixchix";

// Global DB object
include_once('mysql.php');

function connectDB(){
	global $MYSQL_HOST;
	global $MYSQL_NAME;
	global $MYSQL_USER;
	global $MYSQL_PASS;
	$db = new MySQL($MYSQL_NAME, $MYSQL_USER, $MYSQL_PASS, $MYSQL_HOST);
	return $db;
}

// Global variables sent to PHP scripts - its research code :P
if(isset($_POST["request"]))	$request 	= $_POST["request"]; else 	$request 	= "";
if(isset($_POST["username"]))	$username	= $_POST["username"]; else 	$username	= "";
if(isset($_POST["eid"]))		$eid 		= $_POST["eid"]; 	else 	$eid 		= -1;
if(isset($_POST["uid"]))		$uid 		= $_POST["uid"]; 	else 	$uid 		= -1;
if(isset($_POST["mid"]))		$mid 		= $_POST["mid"]; 	else 	$mid 		= -1;
if(isset($_POST["cid"]))		$cid 		= $_POST["cid"]; 	else 	$cid 		= -1;

// Using GET for easy debugging
if(isset($_GET["eid"]))    	    $eid 		= $_GET["eid"];

function echov($var){
	echo "<pre>";
	echo var_export($var);
	echo "</pre>";
}

function startsWith($haystack, $needle){
    return !strncmp($haystack, $needle, strlen($needle));
}

function endsWith($haystack, $needle){
    $length = strlen($needle);
    if ($length == 0)
        return true;
    return (substr($haystack, -$length) === $needle);
}

function right($string,$chars){ 
    $vright = substr($string, strlen($string)-$chars,$chars); 
    return $vright; 
} 

function newGuid() { 
    $s = strtoupper(md5(uniqid(rand(),true))); 
    $guidText = 
        substr($s,0,8) . '-' . 
        substr($s,8,4) . '-' . 
        substr($s,12,4). '-' . 
        substr($s,16,4). '-' . 
        substr($s,20); 
    return $guidText;
}

function round_down_pow2($x) {
   $x = $x | ($x >> 1); 
   $x = $x | ($x >> 2); 
   $x = $x | ($x >> 4); 
   $x = $x | ($x >> 8); 
   $x = $x | ($x >>16); 
   return $x - ($x >> 1); 
} 

function moveFile($fromFileName, $toFileName){
	if (copy($fromFileName,$toFileName)) {
	  unlink($fromFileName);
	}	
}

function readableTime($time){
	return date("F d Y H:i:s", $time);
}

function createThumbnailImage($fromImageFile, $resolution, $toImageFile) {
	$cmd = "convert $fromImageFile -resize \"{$resolution}x{$resolution}^\" -gravity center -crop {$resolution}x{$resolution}+0+0 $toImageFile"; 
	system($cmd);
	
	// set proper permissions on the new file
	chmod($toImageFile, 0644);			
} 

function getVideoDimensions($video) {
	$width = 0;
	$height = 0;
	$command = "ffmpeg -i " . $video . ' -vstats 2>&1';
	$output = shell_exec ( $command );
	if ( preg_match('/Video:.*?0x.*?([0-9]+)x([[0-9]+)/', $output , $regs) ) {
		$width = $regs[1];
		$height = $regs[2];
	} 
	return array ('width' => $width, 'height' => $height );
}

function createThumbnailVideo($fromVideoFile, $resolution, $seconds, $toThumbnailFile) { 

	$uid = newGuid();
	$ext = 'mp4';
	
	$seconds = min(9, $seconds);
	
	$newNameFull = $toThumbnailFile;
	
	if($ext == 'mp4')
	{
		$base = basename($newNameFull);
		$path = dirname($newNameFull);
		
		$filters = '"';
		
		// Cropping
		if(false)
		{
			$s = getVideoDimensions($fromVideoFile);
			$h = min( $s['width'], $s['height'] );
			$t = ($s['height'] - $h) * 0.5;
			$l = ($s['width'] - $h) * 0.5;
			$filters .= "crop=$h:$h:$t:$l,";
		}
		
		// Scaling
		$filters .= "scale=". round_down_pow2($resolution).":-1";
		
		// End of filters
		$filters .= '"';
		
		// Create poster image
		$posterFile = str_replace("mp4", "png", $base);
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -r 1/1 -vf $filters -f mjpeg {$path}/poster/$posterFile";
		system($ffmpeg_cmd);
		
		// Create short clip
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -t 00:00:03 -vol 0 -vf $filters  $newNameFull";
		
		echov($ffmpeg_cmd);
		
		system($ffmpeg_cmd);
	}

	// set proper permissions on the new file
	chmod($newNameFull, 0644);	
}

function makePublicFolder($folderpath){
	if(!file_exists($folderpath))
		mkdir($folderpath, 0777);
}

function deleteDir($path){
    return is_file($path) ?
            @unlink($path) :
            array_map(__FUNCTION__, glob($path.'/*')) == @rmdir($path);
}

function array_shift_circular(array $array, $steps = 1)
{
    if ($steps === 0) {
        return $array;
    }

    $l = count($array);

    if ($l === 0) {
        return $array;
    }
    
    $steps = $steps % $l;
    $steps *= -1;

    return array_merge(array_slice($array, $steps),
                       array_slice($array, 0, $steps));
}

?>
