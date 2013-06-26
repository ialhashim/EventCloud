<?php
    // Enable full error checking
    ini_set('display_errors',1);
    error_reporting(E_ALL);
    
    $verbose = true;
    
	include_once('global.php');
	include_once('mediaManager.php');
?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
    <head>
        <title>EventCloud : Media Upload</title>
        <link rel="stylesheet" type="text/css" href="style.css">
		
    </head>

    <body>
    
    
    <div id="systemInfo">
    <?php
        // Print some system details
        if( $verbose ){
            echo "<p class='message-box info'> Current PHP version: " . phpversion(). "</p>";
        }
    ?>
    </div>
    
    
    <div id="uploadResult">
    <?php
    	if(!empty($_FILES["file"]))
		{
	    	$log = "";
        	$mid = saveUploadedMedia($log);
			echo $log;
			echo "<p class='message-box info'> New media ID: " . $mid. "</p>"; 		
		}
    ?>
    </div>
    
    <div id="uploadForm">
        <form action="index.php" method="post" enctype="multipart/form-data">
        <span>Event ID:</span><input type="text" name="eid" value="1">
        <span>User ID:</span><input type="text" name="uid" value="1">
        <input type="hidden" name="manual" value="manual">
        <input type="file" name="file"> <input type="submit" value="Upload media">
        </form>
    </div>
	
	<div>
		<a href="MobileApp/EventCloudApp/assets/www">Go to App page</a> <br/>
		<a href="/EventfulCloud.apk">EventCloud APK</a>
	</div>
	
	<div id="showGoogleMaps">
		<form name="coord">
			<input name="coords"/>
		</form>
		<a onclick=" coords = (document.coord.coords.value + '').replace(' ', ','); window.location.href = 'https://maps.google.ca/maps?q=' + coords; " href="#">Map it</a>
	</div>
	
	<a href="rtsp://96.49.252.141:8554/test.sdp">Stream</a>
	
    </body>
</html>
