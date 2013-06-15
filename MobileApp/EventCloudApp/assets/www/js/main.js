
var username;
var eid;
var eventname = '';

// For jCarousel
var itemCount = 4;
			
$(document).ready(function() { 
	username = getParameterByName('username');
	EID = getParameterByName('eid');
	
	// Get event name
	$.get(eventsManager, { request: "name", eid: EID }, function(data){ 
		eventname = data.name; 
		$("h2#greeting").replaceWith( "<h2 id='greeting'> " + toTitleCase(username) + " @ " + eventname + " </h2>" );
	});
	
	postUpload();
	
	// Disable scrolling
	$(document.body).on('touchmove',function(e){
	    if(!$('.scroll-pane').has($(e.target)).length)
	        e.preventDefault();
	});
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
        
	//var options = new FileUploadOptions();
	//options.fileName = name;
	
    ft.upload(path, uploadURL, up_win, up_fail, { fileName: name }, true);
}

function uploadPhotoFile(imageURI) {
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
    options.mimeType="image/jpeg";

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

function resizeCarousel(){
	// Style
	//scale = 2;
	//itemWidth = scale * $(document).height() / (visibleCount);
	itemWidth = $(document).width() / itemCount;
	
	galleryWidth = itemWidth * (itemCount+2);
	
	$('.jcarousel-item').css('width', itemWidth); 
	$('.jcarousel-item').css('height', 'auto'); 
	
	$('.jcarousel-container-horizontal').css('width', galleryWidth - itemWidth*4); 
	
	$('.jcarousel-clip-horizontal').css('height', itemWidth); 
	$('.jcarousel-clip-horizontal').css('width', galleryWidth - itemWidth*4); 
	
	$('.jcarousel-list-horizontal').css('width', galleryWidth ); 
	$('.jcarousel-list-horizontal').css('height', itemWidth); 

	var y = ($(document).height()*0.5) - (itemWidth * 0.9);
	$('div.jcarousel-skin-tango').css('top', y); 
	$('div.jcarousel-skin-tango').css('position', 'absolute');
}

function postUpload() {
   var request = $.ajax({
        url: galleryURL,
        type: "post"
    });

    // callback handler that will be called on success
    request.done(function (response, textStatus, jqXHR){
        console.log("Hooray, ajax worked!");
        
        $("#mycarousel").html('');
        
        var oldGallery = false;
        
        if(oldGallery){
        	// Refresh gallery
   	        $("#gallery").replaceWith(response);
   	        
   	        tdClass = "";

   			$("#gallery").wrapInner("<table cellspacing='30'><tr>");
   			$(".thumbnail").wrap("<td class='+" + tdClass + "+'></td>");
   			
			// Hide loading icon
			$("img").one('load', function() {
			  $(this).prev().hide();
			}).each(function() {
			  if(this.complete) $(this).load();
			});
			
			$("video").each(function(){
				$(this).get(0).play();
			});
        } else {
			var $gallery = $( $.parseHTML( response ) );
			
			//$.each( $gallery, function( i, el ) {
			//	$("<li/>", {}).append(el).appendTo("#mycarousel");
			//});
			
			// jCarousel it!
			$('#mycarousel').jcarousel({
	        	// Configuration goes here
	        	itemLoadCallback: mycarousel_itemLoadCallback
	    	});

	    	resizeCarousel();
	    	
	    	$(window).resize(function() {
	    		resizeCarousel( itemCount );
	    	});
	    	
	    	// Hide loading icon
			$("img").one('load', function() {
			  $(this).prev().hide();
			}).each(function() {
			  if(this.complete) $(this).load();
			});
		}
    });
}


function mycarousel_itemLoadCallback(carousel, state)
{
    if (carousel.prevFirst != null) {
        // Remove the last visible items to keep the list small
        for (var i = carousel.prevFirst; i <= carousel.prevLast; i++) {
            // jCarousel takes care not to remove visible items
            carousel.remove(i);
        }
    }

    var per_page = carousel.last - carousel.first + 1;
    var currPage = 0;
    var f,l;
    var cr = carousel;

    for (var i = carousel.first; i <= carousel.last; i++) {
        var page = Math.ceil(i / per_page);

        if (currPage != page) {
            currPage = page;

            f = ((page - 1) * per_page) + 1;
            l = f + per_page - 1;

            f = f < carousel.first ? carousel.first : f;
            l = l > carousel.last ? carousel.last : l;

            if (carousel.has(f, l)) {
                continue;
            }

            mycarousel_makeRequest(carousel, f, l, per_page, page);
        }
    }
};

function mycarousel_makeRequest(carousel, first, last, per_page, page)
{
    // Lock carousel until request has been made
    //carousel.lock();

    $.get(
        galleryURL,
        {
            'count': per_page,
            'start': page
        },
        function(data) {
            mycarousel_itemAddCallback(carousel, first, last, data, page);
        }
    );
};

function mycarousel_itemAddCallback(carousel, first, last, data, page)
{
	$data = $(data);
	console.log( $data );
	
	// Set size
    carousel.size(1000);
	
	$.each( $data, function( i, el ) {
		carousel.add(i, el);
	});
	
	resizeCarousel();
};

