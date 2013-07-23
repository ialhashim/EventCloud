<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    $verbose = true;
  
	include_once('global.php');

	echo "Preparing scripts.."; flush();
	system("s3cmd get s3://eventfulcloud-app/HPC.tar.gz");
	system("tar -xvf HPC.tar.gz");
	system("cd HPC");
	
	$resolution = 300;
	$reconCmd = "sh doJob.sh " . $eid . " " . $resolution;
	
	echo "Executing: " . $reconCmd; flush();
	system( $reconCmd );
	
	echo "Reconstruction done."; flush();
?>
