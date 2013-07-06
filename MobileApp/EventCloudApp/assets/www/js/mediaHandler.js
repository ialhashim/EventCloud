
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

var localMediaStream = null;
var context = null;
    	
function captureMediaFromBrowser( captureIcon, buttonIcon, callback ){
	$mediaCapture = $("#media-capture");
		
	// Large placeholder
	$("#captureIcon").html( captureIcon );
	
	// Capture button as camera
	{
		$snapMedia = $("#snapMedia"); $snapMedia.empty();
		$snapMedia.append( buttonIcon );
		$snapMedia.off('click').on('click', function(e){ 
			e.preventDefault(); 
			callback(); 
			return false; 
		} );
		if(buttonIcon.indexOf("facetime") !== -1) 
			$snapMedia.attr('class', 'green button'); 
		else 
			$snapMedia.attr('class', 'blue button'); 
		$snapMedia.focus();
	}
	
	// Hide video record red circle
	$("#rec-icon").hide();
	
	// Show capture window
	$mediaCapture.fadeIn( function(){
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    	navigator.getUserMedia({video:true}, function (stream) {
        	$("#captureDevice").attr( 'src', window.URL.createObjectURL(stream) );
        	localMediaStream = stream;
    	}, function(){ console.log('fail'); } );
	} );
}

function cancelCapture(){
	$mediaCapture = $("#media-capture").fadeOut(function(){
		$("#captureDevice").attr( 'src', '');
		if(localMediaStream != null) localMediaStream.stop(); // Stop camera
		if(context != null) context.clearRect (0,0,640,480); // Clear canvas
	});
}

// Video
function captureVideo() {
	
	/// 0) Desktop-like capture
	if( !isInsidePhoneGap )
	{
		captureMediaFromBrowser( '&#xf03d;', ' <i class="icon-facetime-video"> </i> ', function(){
			// Draw image to a canvas
			var canvas = document.querySelector('canvas');
			context = canvas.getContext("2d");
			var media = document.querySelector('#captureDevice');
			
			var fps = 15;
			var interval = 5; // seconds
			var videoFrames = new Array();
			
			// Blink red circle while recording
			$recIcon = $("#rec-icon");
			hidden = true;
			var blinkRecord = window.setInterval(function(){
				if(hidden){
					$recIcon.show();
					hidden = false;
				}
				else{
					$recIcon.hide();
					hidden = true;
				}
			}, 500);
			
			var videoCapture = window.setInterval(function(){
				context.drawImage(media, 0, 0, 640, 480);
				var data = canvas.toDataURL('image/jpeg', 0.4);
				var output = data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
				
				videoFrames.push( output );
				
				// End of video length
				if(videoFrames.length > fps * interval){
					window.clearInterval( videoCapture );
					window.clearInterval( blinkRecord );
					$recIcon.hide();
					
					// Setup upload data
					var params = {
						request: 'uploadCapturedVideo',
						eid: eid,
						uid: userid,
						fps: fps,
						data: JSON.stringify(videoFrames)
					};
					
					// Upload and process response
					$.post(uploadURL, params, function(d){	
						postUpload(d); 	
						cancelCapture();
					});
				}
			}, 1000 / fps );
		} );
		return;
	}
	
	navigator.device.capture.captureVideo(captureMediaSuccess, captureMediaError);
}

// Photo
function capturePhoto() {
	
	// We have three capture options:
	
	/// 0) Desktop-like capture
	if( !isInsidePhoneGap )
	{
		captureMediaFromBrowser( '&#xf030;', ' <i class="icon-camera"> </i> ', function(){
			// Draw image to a canvas
			var canvas = document.querySelector('canvas');
			context = canvas.getContext("2d");
			var media = document.querySelector('#captureDevice');
			context.drawImage(media, 0, 0, 640, 480);
			var data = canvas.toDataURL('image/jpeg', 0.8);
			var output = data.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

			// Setup upload data
			var params = {
				request: 'uploadCaptured',
				eid: eid,
				uid: userid,
				data: output
			};
			
			// Upload and process response
			$.post(uploadURL, params, function(d){	
				postUpload(d); 	
				cancelCapture();
			});
		} );
		return;
	}
	
	/// 1) This is a better way to keep all EXIF
	{
		//navigator.device.capture.captureImage(captureMediaSuccess, captureMediaError);
	}
	
	/// 2) This is for development and be able to send smaller files
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
