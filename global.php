<?php

// Assume server is in VANCOUVER
date_default_timezone_set('America/Vancouver');
			
$MYSQL_NAME = "event_cloud";
$MYSQL_USER = "root";
$MYSQL_PASS = "chixchix";

// Global DB object
include_once('mysql.php');
$db = new MySQL($MYSQL_NAME, $MYSQL_USER, $MYSQL_PASS);

//$upload_dir = "/var/www/html/uploads/";
$upload_dir = dirname(__FILE__). "/uploads/";
$upload_url = "/uploads/";
$server_address = 'http://96.49.252.141';

// Development paths
{
	$host= gethostname();
	$ip = gethostbyname($host);
	$server_address = 'http://' . $ip;
	
	$h = parse_url( $_SERVER['HTTP_REFERER'] );
	$server_address = $h[ "scheme" ] . "://" . $h['host'];
}


// Global variables sent to PHP scripts - its research code :P
if(isset($_POST["request"]))	$request 	= $_POST["request"]; else 	$request 	= "";
if(isset($_POST["username"]))	$username	= $_POST["username"]; else 	$username	= "";
if(isset($_POST["eid"]))		$eid 		= $_POST["eid"]; 	else 	$eid 		= -1;
if(isset($_POST["uid"]))		$uid 		= $_POST["uid"]; 	else 	$uid 		= -1;
if(isset($_POST["mid"]))		$mid 		= $_POST["mid"]; 	else 	$mid 		= -1;
if(isset($_POST["cid"]))		$cid 		= $_POST["cid"]; 	else 	$cid 		= -1;

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
	$thumb = new Imagick($fromImageFile);
	$thumb->setCompressionQuality(100); 
	$thumb->resizeImage($resolution, $resolution, Imagick::FILTER_CATROM, 1, true);
	
	$ext = right($fromImageFile, 4);
	
	$newNameFull = $toImageFile;

	$thumb->setImageCompression(imagick::COMPRESSION_JPEG); 
	$thumb->setImageCompressionQuality(100); 
	$thumb->stripImage(); 
	$thumb->writeImage($newNameFull);
	$thumb->destroy();
	
	// set proper permissions on the new file
	chmod($newNameFull, 0644);			
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
		
		// Create poster image
		$posterFile = str_replace("mp4", "png", $base);
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -r 1/1 -vf scale=".round_down_pow2($resolution).":-1 -f mjpeg {$path}/poster/$posterFile";
		system($ffmpeg_cmd);
		
		// Create short clip
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -t 00:00:05 -vol 0 -vf scale=".round_down_pow2($resolution).":-1 $newNameFull";
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
