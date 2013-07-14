<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    $verbose = true;
    
	require 'external/aws.phar';
	use Aws\S3\S3Client;
	use Aws\S3\Enum\CannedAcl;

	// Instantiate the S3 client with your AWS credentials and desired AWS region
	$s3 = S3Client::factory(array(
		'key'    => 'AKIAJEX7EXMYDG2LMPYA',
		'secret' => 'feTOnWfF9s90v1Y1UAtXEYjweU9ogd5cfPFDh85Z',
	));
		
	$bucket = 'eventfulcloud-uploads';

	function putFile( $filename, $folder = ''){
		global $s3;
		global $bucket;
		
		$s3->putObject(array(
			'Bucket' => $bucket,
			'Key'    => $folder . '/' . basename($filename),
			'Body'   => fopen($filename, 'r'),
			'ACL'    => CannedAcl::PUBLIC_READ
		));
	}
	
	function moveFileToCloud( $filename, $folder = ''){
		putFile( $filename, $folder );
		unlink( $filename );
	}
	
	function getFile( $basename, $folder = ''){
		global $s3;
		global $bucket;
		return 'https://s3.amazonaws.com/' . $bucket . '/' . $folder . '/' . $basename;
	}
	
	function removeFolder( $folder ){
		global $s3;
		global $bucket;
		
		return $s3->deleteMatchingObjects( $bucket, $folder );
	}
	
	function clearBucket(){
		global $s3;
		global $bucket;
		$s3->clearBucket($bucket);
	}
?>
