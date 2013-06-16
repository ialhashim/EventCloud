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
	
	// When a folder is given
	if(!endsWith($toImageFile, '.jpg')){
		$fileCount = count (glob ($toImageFile.'*.jpg'));
		$newNameFull = $toImageFile . sprintf("%08d",$fileCount + 1) . '.jpg';
	}else{
		$newNameFull = $toImageFile;
	}

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
	
	// When a folder is given
	if(!endsWith($toThumbnailFile, $ext)){
		$fileCount = count (glob ($toThumbnailFile.'*'.$ext));
		$newName = sprintf("%08d",$fileCount + 1) . '.' . $ext;
		$newNameFull = $toThumbnailFile . $newName;
		$newNamePath = $toThumbnailFile;
	}else{
		$newNameFull = $toThumbnailFile;
	}

	echo "<pre>";
		
	if($ext == 'gif')
	{
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -t 00:00:0{$seconds} -vf scale=$resolution:-1 {$newNamePath}tmp/{$uid}%02d.png";
		$convert_cmd = "convert -delay 4 -loop 0 {$newNamePath}tmp/{$uid}*.png $newNameFull";
		$convert_cmd_pause = "convert $newNameFull ( -clone 0 -set delay 100 ) -layers OptimizePlus -layers OptimizeTransparency +map $newNameFull";
	
		system($ffmpeg_cmd);
		system($convert_cmd);
		system($convert_cmd_pause);
		
		array_map('unlink', glob( $toThumbnailFile."tmp/{$uid}*.png" ) );
	}
	
	if($ext == 'mp4')
	{
		// Create poster image
		$posterFile = str_replace("mp4", "png", $newName);
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -r 1/1 -vf scale=".round_down_pow2($resolution).":-1 -f mjpeg {$newNamePath}poster/$posterFile";
		system($ffmpeg_cmd);
		
		// Create short clip
		$ffmpeg_cmd = "ffmpeg -i $fromVideoFile -t 00:00:05 -vol 0 -vf scale=".round_down_pow2($resolution).":-1 $newNameFull";
		system($ffmpeg_cmd);
	}

	// set proper permissions on the new file
	echo "File:".$newNameFull;
	chmod($newNameFull, 0644);	
	
	echo "</pre>";
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
