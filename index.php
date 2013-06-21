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
        if (!empty($_FILES["file"]) && !empty($_POST['eid'])) 
        {
        	// Assign correct upload path
        	$eid = intval( $_POST['eid'] );
			
            $myFile = $_FILES["file"];
			
            // Check upload is fine
            if ($myFile["error"] !== UPLOAD_ERR_OK) {
                echo "<p class='message-box error'> ERROR: An error occurred with the upload. Here is what I got: </p>";
                echo "<p'><pre>" . var_export($_FILES,true) . "</pre></p>";
            }
            
            // Check directory
            if (file_exists($upload_dir.$eid.'/') && is_writable($upload_dir.$eid.'/'))
            {
                echo "<p class='message-box ok'> Info: Directory ok :) </p>";
                //mkdir($upload_dir."ok_upload",0700);
            }
            else 
            {
                echo "<p class='message-box error'> ERROR: Upload directory is not writable, or does not exist: [ " . $upload_dir.$eid.'/' . " ] </p>" ;
            }
            
            // ensure a safe filename
            $name = preg_replace("/[^A-Z0-9._-]/i", "_", $myFile["name"]);
            
            if(strlen($name))
            {
                $finalFileName =  $upload_dir.$eid.'/tmp/' . $name;
                
				// Erase if exists
				if(file_exists($finalFileName))
				    unlink($finalFileName); //remove the file
				
                // preserve file from temporary directory
                $success = move_uploaded_file($myFile["tmp_name"], $finalFileName);
                
                if (!$success) 
                {
                    echo "<p class='message-box error'>Unable to save file : " . $myFile["name"]  . "</p>";    
                }
                else
                {
                	insertMedia($finalFileName, $eid, $uid);

                    echo "<p class='message-box ok'> File uploaded :) </p>";
                }
            }
            
            // Show upload data
            if( $verbose ){
                //echo "<p class='message-box info'><pre>" . var_export($_FILES,true) . "</pre></p>";
            }
        }
    ?>
    </div>
    
    <div id="uploadForm">
        <form action="index.php" method="post" enctype="multipart/form-data">
        <input type="text" name="eid" value="1">
        <input type="text" name="uid" value="1">
        <input type="file" name="file"> <input type="submit" value="Upload media">
        </form>
    </div>
	
	<a href="MobileApp/EventCloudApp/assets/www">Test</a> <br/>
	<a href="/EventCloudApp.apk">EventCloud APK</a>
    
    </body>
</html>
