<?php
	// Enable full error checking
	ini_set('display_errors',1);
	error_reporting(E_ALL);
	$verbose = true;
	include_once('global.php');

	set_include_path(get_include_path() . PATH_SEPARATOR . 'external/phpseclib');
	
	include_once('Net/SSH2.php');
	include_once('Crypt/RSA.php');
	
	//$key = new Crypt_RSA();
	//$key->loadKey(file_get_contents('privatekey'));
	
	//$ssh = new Net_SSH2('www.domain.tld');
	//if (!$ssh->login('username', $key)) {
	//    exit('Login Failed');
	//}
	
	//echo $ssh->exec('pwd');
	//echo $ssh->exec('ls -la');
?>
