<?php
	// Enable full error checking
	ini_set('display_errors',1);
	//error_reporting(E_ALL);
	$verbose = true;
	include_once('global.php');

	set_include_path(get_include_path() . PATH_SEPARATOR . 'external/phpseclib');

	include_once('external/phpseclib/Net/SSH2.php');
	include_once('external/phpseclib/Crypt/RSA.php');

	$ssh = new Net_SSH2( $workerNode );
	$key = new Crypt_RSA();
	$key->loadKey(file_get_contents('HPC/hpc.pem'));
	$ssh->login('ubuntu', $key);

	$resolution = 200;
	if(isset($_POST['res'])) $resolution = $_POST['res'];
	if(isset($_GET['res'])) $resolution = $_GET['res'];

	$cmd  = "cd EventCloud;";
	$cmd .= "./cleanEvent.sh $eid all;";
	$cmd .= "./makeEvent.sh $eid $resolution;";
	$cmd .= "cd output/1/pmvs/models;";
	$cmd .= "../../../../CMVS-PMVS/bin/ply2json option-0000.ply;";
	$cmd .= "cd ../../../..;";
	$cmd .= "./uploadToCloud.sh $eid;";

	$tmpscript = newGuid() . ".sh";

	echo "Executing.."; flush();
	echo $ssh->exec( "echo \"" . $cmd . "\" > " . $tmpscript );
	echo "<pre>";
	echo $ssh->exec( "cat " . $tmpscript );
	echo $ssh->exec( "chmod +x " . $tmpscript );
	echo "</pre>";

	echo " [ Execute script ] ";
	$finalCmd = "nohup ./" . $tmpscript . " > /dev/null 2>&1 &";
	echo "<pre>";
	echo $finalCmd;
	echo $ssh->exec( $finalCmd );
	echo $ssh->exec( "rm " . $tmpscript ); // Clean up
	echo "</pre>";
	echo "Done.";
	
?>
