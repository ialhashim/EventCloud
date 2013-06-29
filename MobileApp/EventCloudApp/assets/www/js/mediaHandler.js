
// Upload file
//
function uploadFile(){
	$("<form/>", { action: uploadURL, enctype:"multipart/form-data", id: 'tempForm' }).appendTo("body");
	$("#tempForm").hide();
	
	// Add hidden fields
	$("<input/>", { type: 'file', name:"file", id: 'hiddenFile' }).appendTo("#tempForm");
	$("<input/>", { type: 'button', value:'upload', id: 'hiddenSubmit' }).appendTo("#tempForm");
	
	// File validation and submit upon change
	$('#hiddenFile').change(function(){
	    var file = this.files[0];
	    name = file.name;
	    size = file.size;
	    type = file.type;
		$("#hiddenSubmit").trigger('click');
	});
	
	// Upload window appears
	$('#hiddenFile').click();
	
	// Submit form via AJAX
	$('#hiddenSubmit').click(function(){
	    var formData = new FormData($('#tempForm')[0]);
	    formData.append("eid", eid);
	    formData.append("uid", userid);
	    
	    $.ajax({
	        url: uploadURL,  //server script to process data
	        type: 'POST',
	        xhr: function() {  // custom XHR
	            var myXhr = $.ajaxSettings.xhr();
	            if(myXhr.upload){ // check if upload property exists
	                myXhr.upload.addEventListener('progress',function(){}, false); // for handling the progress of the upload
	            }
	            return myXhr;
	        },
	        //Ajax events
	        beforeSend: function(){  },
	        success: function(){ console.log('File upload OK'); },
	        error: function(){ up_fail( {code:'error code', source:'', target:''} ); },
	        complete: function(e, xhr, settings)
	        {
	       		postUpload(e.responseText); 
	       		$tempForm = $("#tempForm");
	       		$tempForm.remove();
	        },
	        // Form data
	        data: formData,
	        //Options to tell JQuery not to process data or worry about content-type
	        cache: false,
	        contentType: false,
	        processData: false
	    });
	});
}

// Video
function captureVideo() {
	navigator.device.capture.captureVideo(captureMediaSuccess, captureMediaError);
}

// Photo
function capturePhoto() {
	// This is better way to keep all EXIF
	//navigator.device.capture.captureImage(captureMediaSuccess, captureMediaError);
	
	// This is for development and be able to send smaller files
	{
		var options = {  quality: 10 };
		navigator.camera.getPicture(function(imageURI){
			var options = new FileUploadOptions();
		    options.fileKey="file";
		    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
		    options.mimeType="image/jpeg";
			{
				var params = {};
				params.eid = eid;
				params.uid = userid;
				options.params = params;
			}
		    var ft = new FileTransfer();
		    ft.upload(imageURI, uploadURL, up_win, up_fail, options, true);
		}, function(){}, { quality: 50, destinationType: Camera.DestinationType.FILE_URI }); 	
	}
}

function captureMediaError(error) {
	if (error != CAPTURE_NO_MEDIA_FILES) {
		var msg = 'An error occurred during capture: ' + error.code;
		navigator.notification.alert(msg, null, 'Uh oh!');
	}
}

function captureMediaSuccess(mediaFiles) {
	var i, len;
	for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		uploadMediaFile(mediaFiles[i]);
	}
}

// Upload files to server
function uploadMediaFile(mediaFile) {
	var ft = new FileTransfer(),
    	path = mediaFile.fullPath,
    	name = mediaFile.name;
	var options = new FileUploadOptions();
	options.fileName = name;
	
	// Submission parameters
	{
		var params = {};
		params.eid = eid;
		params.uid = userid;
		
		options.params = params;
	}
	
    ft.upload(path, uploadURL, up_win, up_fail, options, true);
}

function up_win(r) {
    console.log("Upload OK, Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    
    postUpload( r.response );
}

function up_fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

function postUpload( mid )
{
	navigator.geolocation.getCurrentPosition(function(position){
		
		// Send location of this new media
    	var params = {
    		request: 'updateCoord',
    		mid: mid,
    		latitude: position.coords.latitude,
    		longitude: position.coords.longitude
    	};
    	
    	$.post(uploadURL, params, function(d){
    		console.log( d );
    		
    		// Show in gallery	
    		
    	});

	}, 
		// Location service failed
		function (error) {console.log('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	});
}
