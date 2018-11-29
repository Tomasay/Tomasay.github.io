<?php
		// Part A
		if(array_key_exists('filename',$_REQUEST)){
        	$fileName =$_REQUEST['filename'];
        } 
		else {
        	echo "<strong>Need a <em>filename</em> to fetch!</strong>";
        	exit(); 
        }
        
        // Part B
        if(array_key_exists('format',$_REQUEST)){
        	$format= $_REQUEST['format'];
        } else {
        	$format = "text/xml";
        }
        
        // Part C
     	$fileData = file_get_contents($fileName);
     	
        // Part D
		header("content-type: $format");
    	echo $fileData;
?>