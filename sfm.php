<?php
	// Enable full error checking
	ini_set('display_errors',1);
	error_reporting(E_ALL);
	$verbose = true;
	include_once('global.php');

	system("s3cmd get s3://eventfulcloud-app/HPC.tar.gz");
	system("tar -xvf HPC.tar.gz");
	
	$resolution = 300;
	$reconCmd = "cd HPC; sh doJob.sh " . $eid . " " . $resolution;
	
	system( $reconCmd );	
?>
