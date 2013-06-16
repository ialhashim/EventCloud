
var username;
var eid;
var eventname = '';

var itemCount = 4;
			
var cf;  
	
$(document).ready(function() { 
	username = getParameterByName('username');
	eid = getParameterByName('eid');
	
	// Get event name
	$.get(eventsManager, { request: "name", eid: eid }, function(data){ 
		eventname = data.name; 
		$("h2#greeting").replaceWith( "<h2 id='greeting'> " + toTitleCase(username) + " @ " + eventname + " </h2>" );
	});
	
	// Disable scrolling
	$(document.body).on('touchmove',function(e){
	    if(!$('#swiper-main-container').has($(e.target)).length)
	        e.preventDefault();
	});
	
	initialSlides();
});

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
	    //your validation
	    
		$("#hiddenSubmit").trigger('click');
	});
	
	// Upload then submit
	$('#hiddenFile').click();
	
	// AJAX submit
	$('#hiddenSubmit').click(function(){
		console.log($('#tempForm')[0]);
		
	    var formData = new FormData($('#tempForm')[0]);
	    formData.append("eid", eid);
	    formData.append("username", username);
	    
	    $.ajax({
	        url: uploadURL,  //server script to process data
	        type: 'POST',
	        xhr: function() {  // custom xhr
	            var myXhr = $.ajaxSettings.xhr();
	            if(myXhr.upload){ // check if upload property exists
	                myXhr.upload.addEventListener('progress',function(){}, false); // for handling the progress of the upload
	            }
	            return myXhr;
	        },
	        //Ajax events
	        beforeSend: function(){  },
	        success: function(){ postUpload(); console.log('Upload okay!'); },
	        error: function(){  console.log('ERROR: upload.');  },
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
//
function captureVideo() {
	// Launch device video recording application, 
	// allowing user to capture up to 2 video clips
	navigator.device.capture.captureVideo(captureSuccess, captureError);
}

function captureSuccess(mediaFiles) {
	var i, len;
	for (i = 0, len = mediaFiles.length; i < len; i += 1) {
		uploadVideoFile(mediaFiles[i]);
	}
}

function captureError(error) {
	if (error != CAPTURE_NO_MEDIA_FILES) {
		var msg = 'An error occurred during capture: ' + error.code;
		navigator.notification.alert(msg, null, 'Uh oh!');
	}
}

// Photo
//
function capturePhoto() {
	navigator.camera.getPicture(uploadPhotoFile, photoError, {
		quality : 50,
		destinationType : navigator.camera.DestinationType.FILE_URI
	});
}

function photoError(message) {
	var msg = 'An error occurred during capture: ' + error.code;
	navigator.notification.alert(msg, null, 'Uh oh!');
}

// Upload files to server
function uploadVideoFile(mediaFile) {
	var ft = new FileTransfer(),
    	path = mediaFile.fullPath,
    	name = mediaFile.name;
	var options = new FileUploadOptions();
	options.fileName = name;
	
	// Submission parameters
	{
		var params = {};
		params.eid = eid;
		params.username = username;
		
		getLocation();
		
		options.params = params;
	}
	
    ft.upload(path, uploadURL, up_win, up_fail, options, true);
}

function uploadPhotoFile(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

	// Submission parameters
	{
		var params = {};
		params.eid = eid;
		params.username = username;
		
		getLocation();
		
		options.params = params;
	}

    var ft = new FileTransfer();
    ft.upload(imageURI, uploadURL, up_win, up_fail, options, true);
}

function up_win(r) {
    console.log("Upload OK, Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    postUpload();
}

function up_fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}

function getLocation(){
	var onLocationSuccess = function(position) {
	    console.log('Coordinates: ' + position.coords.latitude + ',' + position.coords.longitude);
	};
	
	// onError Callback receives a PositionError object
	//
	function onLocationError(error) {
	    console.log('code: '    + error.code    + '\n' +
	          'message: ' + error.message + '\n');
	}
	
	navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
}

function getPhotos(count, start, callBack){
	var data;
	
	var requestData = {
		count : count,
		start : start,
		eid: eid
	};

	var request = $.ajax({
		url : galleryURL,
		type : "GET",
		data : requestData,
		success: function( d ){
			callBack(d);
		}
	}); 
}

function postUpload(){
	
}

var currentStart = 0;
var slidesCount = 3;
var mainSwiper;

function resizeSwiper(){
	var width = $('body').width();
	var height = $('body').height();
	
	// Sizes
	$('#swiper-main-container').css('width', width);
	$('#swiper-main-container').css('height', height);     
	
	var slideWidth = (width) / slidesCount;
	var slideHeight = height * 0.5;
	
	$('.swiper-slide').css('width', slideWidth);
	$('.swiper-slide').css('height', slideHeight);
	
	// Placements
	$('#swiper-main-container').css('top', ( ($('body').height() * 0.5) - (slideHeight * 0.5) ));
	
	mainSwiper.reInit();
}

function initialSlides() {
	
    //$.each( $data, function( i, el ) {
    //	var slideHeight = $(el).height();
    //	$(el).appendTo( '.swiper-wrapper' ).wrap('<div class="swiper-slide" style="height:' + slideHeight + 'px" />');
	//});
	
	var count = slidesCount;
	var start = currentStart;
	
	getPhotos(count, start, function(d){
			
		$data = $(d);
		
		$.each( $data, function( i, el ) {
	    	var slideHeight = $(el).height();
	    	$(el).appendTo( '.swiper-wrapper' ).wrap('<div class="swiper-slide" style="height:' + slideHeight + 'px" />');
		});
		
	    mainSwiper = $('.swiper-container').swiper({
			//Your options here:
			pagination : '.pagination-main',
			slidesPerSlide : slidesCount,
			mousewheelControl: true,
			preventClassNoSwiping: true,
			//etc..
			onTouchMove: function(){
				
			},
			onTouchStart: function(){
				
				var idx = mainSwiper.activeIndex + slidesCount;
				
				getPhotos(3, idx, function(d){ 
					$newData = $(d);
					
					// Skip when on new slides arrive
					if(!$newData.length) return;
					
					console.log( $newData );
			
					$.each( $newData, function( i, el ) {
						var slideWidth = $(el).width();
				    	var slideHeight = $(el).height();
				    	var h = Math.max(slideWidth, slideHeight);
				    	
				    	mainSwiper.appendSlide( mainSwiper.createSlide( $(el).html() ) );
				    	//mainSwiper.removeSlide(0);
				    	
						$(".thumbnail-item").hover(
						  function () {
						    $(this).attr("controls", 'controls');
						  },
						  function () {
						    $(this).removeAttr('controls');
						  }
						);
					});
				});
			}
		});
		
	    // Automatically resize
	    resizeSwiper();
	    $(window).resize(function() {
		  resizeSwiper();
		});
		
	});
}

