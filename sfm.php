<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    $verbose = true;
    
	include_once('global.php');
	include_once('external/pel/src/PelJpeg.php');
    
    $bundler = '/etc/bundler/RunBundler.sh '; // path to bundler script
	
	//$db = connectDB();
    //$event = $db->Select( 'events', array("eid" => $eid) );

    $mediaFolder = $upload_dir.$eid.'/full';
    $bundleFolder = $upload_dir.$eid.'/bundle';
    
    makePublicFolder( $bundleFolder );
    
	$images = glob($mediaFolder."/*.{jpg}", GLOB_BRACE);

	$useWidth = 640;
	
	// Fill array with media
	foreach($images as $image_filename){	
		// Read image and EXIF info
		$input_jpeg = new PelJpeg($image_filename);
		$exif = $input_jpeg->getExif();
		$image = new Imagick();
		$image->readImageBlob( $input_jpeg->getBytes() );

		// Scale down
		$original_w = $image->getImageWidth();
		$scale = $useWidth / $original_w;
		$scaled_w = $original_w * $scale;
		$image->scaleImage($scaled_w, 0);
		$output = $bundleFolder . "/" . basename($image_filename);
		$image->writeImage($output);
		
		// Output scaled and write EXIF info back
		$output_jpeg = new PelJpeg( $output );
		if ($exif != null) $output_jpeg->setExif($exif);
		$output_jpeg->saveFile( $output );
	}
	
    $cmd = $bundler . $bundleFolder;

    echo $cmd;
    //system( $cmd );
?>
