<?php

	include_once('mysql.php');
	include_once('global.php');
	$mysql = new MySQL($MYSQL_NAME, $MYSQL_USER, $MYSQL_PASS);

	$result = $mysql->ExecuteSQL("SELECT * FROM events");

	echo var_export( $result, true );
		
?>
