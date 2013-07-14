<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    $verbose = true;
    
	include_once('global.php');
    
    $bundler = '/etc/bundler/RunBundler.sh '; // path to bundler script
	
    $event = $db->Select( 'events', array("eid" => $eid) );

    $mediaFolder = $upload_dir.$eid;
    $bundleFolder = $upload_dir.$eid.'/bundle';
    
    makePublicFolder( $bundleFolder );
    
    // Copy to event's bundle folder
    system( 'cp ' . $mediaFolder . '/*.jpg ' . $bundleFolder );
    
    $cmd =  'sudo '. $bundler . $bundleFolder;

    echo $cmd;
    system( $cmd );
?>
