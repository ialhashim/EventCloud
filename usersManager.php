<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
	include_once('global.php');
	
	function insertUser($username){
		global $db;
		$db->Insert(array('uid'=> getUID($username), 'name' => $username), 'users', true);
		return intval( getUID($username) );
	}
	
	function getUID( $username ){
		global $db;
		$result = $db->Select( 'users', array("name" => $username) );
		return $result['uid'];
	}
	
	function getUsername( $uid ){
		global $db;
		$result = $db->Select( 'users', array("uid" => $uid) );
		return $result['name'];
	}
	
	if(strlen($username) > 0){
		echo insertUser( $username );
	} else {
		echo getUsername( $uid );
	}
	die();	
?>