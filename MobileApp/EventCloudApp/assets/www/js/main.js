/* Global variables */
var eid;
var userid;
var username;
var eventname;

var itemCount = 4;

var $mediaViewer;
var $mediaViewerItem;

$(document).ready(function() { 
	$("#debug").hide();
	
	$("#mainScreen").fadeTo(0,0);
	
	userid = getParameterByName('uid');
	username = getUserName( userid );
	eid = getParameterByName('eid');
	
	// Get event name
	$.post(eventsManager, { request: "name", eid: eid }, function(data){ 
		eventname = data.name; 
		$("h2#greeting").replaceWith( "<h2 id='greeting'> " + toTitleCase(username) + " @ " + eventname + " </h2>" );
		
		setInterval(eventClock, 1000, [data.start.replace(/-/g, '/')]);
	});
	
	// Disable scrolling
	$(document.body).on('touchmove',function(e){
	    //if(!$('#swiper-main-container').has($(e.target)).length)
	        e.preventDefault();
	});
	
	// Single reference copy of spinner element
	$s = $('<div id="refSpinner" class="spinner-item"></div>').spin( { color: '#FFF', shadow: true } );
	$refSpinner = $('<div class="spinner-container"></div>').append( $s );
	
	initialSlides();

	/// Media Capture:
	$mediaCapture = $("#media-capture");
	$mediaCapture.fadeOut(0);

	/// Media Viewer:
	$mediaViewer = $("#media-viewer");
	$mediaViewerItem = $("#media-viewer-item");
	$mediaViewer.fadeOut(0);
		
	// Show media viewer on double click
	$(document).on("dblclick doubletap", ".interactive", showMediaViewer);
	
	// Escape to close any sub-window
	$(document).keyup(function(e) {
	  if (e.keyCode == 27) { cancelCapture(); hideMediaViewer(); }   // ESC
	});
});

function showMediaViewer(){
	$media = $(this);
	$parent = $(this).parent();
	
	$('#highRes').remove();
	
	// Scale and position media viewer
	$mediaViewer.css('width', $media.width());
	$mediaViewer.css('height', $media.height());
	$mediaViewer.css('top', $media.offset().top);
	$mediaViewer.css('left', $media.offset().left);
	
	// Save initial style so we can return to
	$mediaViewer.data('startStyle', $mediaViewer.copyCSS('width height top left') );
	
	// Media item itself
	$mediaViewerItem.css('width', $media.width());
	$mediaViewerItem.css('height', $media.height());
	
	// Set media item to selected one
	$img = $mediaViewerItem.children('figure').find(">:first-child");
	$img.replaceWith( $media.parent().html().replace('interactive','lowRes') );
	$img.css('z-index', -999);
	
	// Get media data
	if($parent.attr('type') == undefined) $parent = $parent.parent(); // for video
	var mediaType = $parent.attr('type');
	var mediaCaption = $parent.attr('caption');
	var mediaID = $parent.attr('mid');
	
	$mediaCaption = $("#mediaCaption");
	$mediaCaption.hide(); $mediaCaption.empty();
	$mediaCaption.removeClass('clicked');
	$mediaCaption.removeClass('not');
	
	// Dynamic caption
	{
		$caption = $('<div id="captionContainer"/>');
		$caption.append( $('<h2>').text( mediaCaption ) );
		$caption.append( $('<div class="captionSpinner"/>') );
		
		// Get media information
		$.post(mediaURL, {request:'getInfo', mid: mediaID}, function(data){
			var mediaInfo = JSON.parse( data );
			
			var info = $("<div/>");
			info.append( $("<h3/>").text( mediaInfo.author.name ) );
			info.append( $("<h4/>").text( mediaInfo.timestamp ) );
			 
			$('#captionContainer').children('.captionSpinner').replaceWith( info.html() );		
		});
		
		// Add MapView and 3DView links
		{
			
		}
		
		$mediaCaption.append( $caption );
		
		$('.captionSpinner').spin('small');
	}
	
	// Maximize to full screen
	$mediaViewer.fadeIn(0, function(){
		$mediaViewer.animate( { width: '101%', height: '100%', top:0, left:0}, 'slow');
		$mediaViewer.promise().done(function() {
			
			var mediaURI = website + 'uploads/' + eid + '/full/' + getMediaBasename( mediaID, mediaType );
	
			// For images
			if(mediaType != 'mp4')
				$('#mediaViewport').prepend("<img id='highRes' class='thumbnail-item' style='opacity:0;position:absolute' src='" + mediaURI + "' />");
			
			// For videos
			if(mediaType == 'mp4')
			{
				var vid = "<video controls id='highRes' class='thumbnail-item' style='display:none;position:absolute'>";
				vid += "<source src='" + mediaURI + "' type='video/mp4'/>";
				vid += "</video>";
				
				$('#mediaViewport').prepend( vid );
			}
			
			$highRes = $('#highRes');
			
			$mediaViewerItem.animate( {width: '100%', height: '100%'}, function(){
				$highRes.css( 'opacity', 1 );
				$mediaCaption.show();
				
				$highRes.on('click', function(){
					$('.lowRes').hide();
					
					$('#highRes').toggleClass('clicked');
					$('#mediaCaption').toggleClass('clicked');
				});
			} );
			
		});
	});
	
	// Events bug fix
	{
		$(document).off("dblclick doubletap", ".interactive", showMediaViewer);
		// Hide media viewer on double click
		$mediaViewer.on("dblclick doubletap", hideMediaViewer );
	}
}

function hideMediaViewer(){
	$('#mediaCaption').addClass('not');
	$('#highRes').addClass('not');
	
	// Give some time for caption to disappear
	setTimeout(function(){
		$('#mediaCaption').hide();
		initStyle = $mediaViewer.data('startStyle');
		$mediaViewer.animate( initStyle, function(){
			$mediaViewer.fadeOut('slow');
		});
	}, 150);

	// Events bug fix
	{
		$mediaViewer.off("dblclick doubletap", hideMediaViewer );
		$(document).on("dblclick doubletap", ".interactive", showMediaViewer);
	}
}

/// Spinner stuff
var $refSpinner;
(function($) {
	$.fn.spin = function(opts, color) {
                if (arguments.length == 1 && opts == false) {
                        return this.each(function() {
                                var $this = $(this),
                                data = $this.data();
 
                                if (data.spinner) {
                                        data.spinner.stop();
                                        delete data.spinner;
                                }
                        });
                }
		var presets = {
			"tiny": { lines: 8, length: 2, width: 2, radius: 3 },
			"small": { lines: 8, length: 4, width: 3, radius: 5 },
			"large": { lines: 10, length: 8, width: 4, radius: 8 }
		};
		if (Spinner) {
			return this.each(function() {
				var $this = $(this),
					data = $this.data();
				
				if (data.spinner) {
					data.spinner.stop();
					delete data.spinner;
				}
				if (opts !== false) {
					if (typeof opts === "string") {
						if (opts in presets) {
							opts = presets[opts];
						} else {
							opts = {};
						}
						if (color) {
							opts.color = color;
						}
					}
					data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
				}
			});
		} else {
			throw "Spinner class not available.";
		}
	};
})(jQuery);

var currentStart = 0;
var slidesCount = 3;
var numActiveSlides = 12;
var mediaUID = 1;
var packetUID = 1;
var binUID = 1;
var slideWidth;
var slideHeight;
var photoStream;
var updater;

function resizeSwiper( className, numSlides, myswiper ){
	var width = $('body').width();
	var height = $('#mainScreen').height();
	
	slideWidth = (width) / numSlides;
	slideHeight = height * 0.5;
	
	// Sizes
	$('.' + className).css('width', width);
	$('.' + className).css('height', slideWidth);     
	
	//$('.' + className + ' > .swiper-slide').css('width', slideWidth);
	//$('.' + className + ' > .swiper-slide').css('height', slideHeight);
	
	// Placements
	$('.' + className).css('top', ( (height * 0.5) - (slideHeight * 0.5) ));
	
	// Refresh
	if(!myswiper == undefined)
		myswiper.reInit();
		
	$(".swiper-vertical").height( slideWidth + 'px' );
	$(".block").height( slideWidth + 'px' );
}

function makeSliderH( swiperClassID, options, initialSlides ){
	var swiperContainer = $("<div/>");
	swiperContainer.addClass( swiperClassID );
	swiperContainer.addClass( 'swiper-container' );
	swiperContainer = swiperContainer.append( "<div class='pagination-main'> </div> <div class='swiper-wrapper'> </div>" );
			
	// Load initial set of slides if any
	$.each( initialSlides, function( i, el ) {
    	$(el).appendTo( swiperContainer.children('.swiper-wrapper') ).wrap('<div class="swiper-slide" />');
	});
	
	return { container: swiperContainer, swiper: swiperContainer.swiper( options ) };
}

function makeSliderV( swiperClassID, options, slides, specialClass ){
	var swiperContainer = $("<div/>");
	swiperContainer.addClass( swiperClassID );
	swiperContainer.addClass( 'swiper-container' );
	swiperContainer.addClass( 'swiper-vertical' );
	swiperContainer.css('width', '100%');
	swiperContainer.css('height', slideHeight);

	swiperContainer = swiperContainer.append( "<div class='swiper-wrapper' style='height:200px;width:200px'> </div>" );
	
	options = {
		mode: 'vertical',
		slidesPerView: 1
	}
	
	$.each( slides, function( k, v ) {
		el = $("<div/>");
		el.addClass( 'swiper-slide' ).addClass( 'vslide' );
		el.html( getThumbnail(v,specialClass) );
		el.appendTo( swiperContainer.children('.swiper-wrapper') );
	});
	
	var main_slide = $("<div/>").addClass( 'swiper-slide' ).append( swiperContainer[0] );
	swiperContainer.appendTo( main_slide );
	
	var swiper = swiperContainer.swiper( options );
	swiper.reInit();
	
	return { container: main_slide, swiper: swiper };
}

/* ENUMS */
var ALL_MEDIA = -1;
var LATEST_CHUNK = -1;

var binCount = 3;

function getMediaForChunk(eid, cidx, callback, isFlat, isReversed, count){
	
	var r = {eid: eid, cidx: cidx};
	r.request = ( cidx != LATEST_CHUNK ) ? r.request = 'getChunk' : 'getLatestChunk';
	
	$.post(mediaURL, r, function(data) {
		if( fulltrim(data).length == 0 ) return;
		
		$chunk_media = JSON.parse( data );
		
		$chunk = $chunk_media[0];
		$media = $chunk_media[1];
		
		chunkTime = new Date( $chunk.start );
		chunkLength = $chunk.length; // seconds
		
		// Bin media into [X] slots
		var $bins = new Object();
		
		if ($media instanceof Array) {
			for(var i = 0; i < $media.length; i++){
				mediaTime = new Date( $media[i].timestamp );
				diffSeconds = Math.max(0, (mediaTime - chunkTime) / 1000);
				b = parseInt( (diffSeconds / chunkLength) * binCount );
				if(!$bins[b]) $bins[b] = new Array();
				$bins[b].push( $media[i] );
			}
		} else {
			// For single items..
			$bins[0] = new Array();
			$bins[0].push( $media );
		}
		
		if(isFlat){
			$flat = new Object();
			var i = 0;
			$.each($bins, function( _k, _v ){ $.each(_v, function( k, v ){	$flat[i++] = [ v ];	});	});
			$bins = $flat;
		}
		
		if(isReversed){
			$reversed = new Object();
			$.each($bins, function( i, v ){ 
				var numItems = Object.size( $bins ) - 1;
				$reversed[numItems - i] = v; 
			});
			$bins = $reversed;
		}
		
		callback( $bins );
	});
}

function initialSlides() {
	
	photoStream = makeSliderH( 'photoStream', {
			slidesPerView : slidesCount,
			pagination : '.pagination-main',
			mode:'horizontal',
			initialSlide : 0,
			speed : 600,
			onSlideChangeEnd: function( swiper ){
				//console.log('Last Direction: ' + swiper.lastDirection);
				var count = slidesCount;
						
				/*if(swiper.lastDirection === 'next')
				{
					// Start dynamic loading when we are at the middle
					if(swiper.activeIndex >= 0.5 * numActiveSlides)
					{
						var start = swiper.virtualIndex + numActiveSlides;
						var $media = $( getMoreMedia( start, count ) );
						swiper.virtualIndex += $media.children().length;
						swiper.removeStartAddEnd( $media );	
					}			
				}
				
				if(swiper.lastDirection === 'prev')
				{
					if(swiper.activeIndex <= 0.5 * numActiveSlides)
					{
						var start = swiper.virtualIndex - count;
						var $media = $( getMoreMedia( start, count ) );
						var c = $media.children().length;
						
						if(swiper.virtualIndex - c >= 0)
						{
							swiper.virtualIndex -= c;
							swiper.removeEndAddStart( $media );	
						}
					}
				}*/
			},
			onSwiperCreate: function( swiper ){
				
				// Add main photo stream
				$("#gallery").append( swiper.container );
				swiper.reInit();
				
			    // Automatically resize
			    resizeSwiper('photoStream', slidesCount, swiper);
			    $(window).resize(function() { resizeSwiper('photoStream', slidesCount, swiper);	});
			    
			    // Always get first chunk
				getMediaForChunk(eid, 0, function($bins){
					$.each($bins, function( k, v ){
						vslider = makeSliderV( 'vswiper-' + (binUID++), {}, v );
						swiper.prependSlide( vslider.container[0] );
						forceResizeWindow();
					});	
					
					// Remove dummy slide
					swiper.removeLastSlide();
					
					$("#mainScreen").fadeTo('fast', 1, function(){
						updater = setInterval(updateLatest, 1000);
					});
				}, true, true, ALL_MEDIA);
			}
	}, $("<div id = 'dummy'> </div>")); // End of photo stream creation
}

var lastChunk = 1;
function updateLatest(){
	getMediaForChunk(eid, LATEST_CHUNK, function($bins){
		
		// Skip if same as existing chunk
		curChunk = $bins[0][0]['cid'];
		
		if(curChunk == lastChunk) return;
		else lastChunk = curChunk;
		
		$.each($bins, function( k, mediaBin ){
			vslider = makeSliderV( 'vswiper-' + (binUID++), {}, mediaBin, 'interactive' );
			photoStream.swiper.appendSlide( vslider.container[0] );
			forceResizeWindow();
			
			photoStream.swiper.swipeTo( photoStream.swiper.getLastSlide().index() );
		});
		
		// Resize for videos
		forceResizeWindow();
		
	}, false, false, ALL_MEDIA);
}

function getThumbnail( media, specialClass ){
	if(specialClass == undefined) specialClass = '';
	
	var mediaURI = website + 'uploads/' + eid + '/' + getMediaBasename( media.mid, media.type );
	
	var mediaAttrib = " mid=" + media.mid + " type='" + media.type + "'" + " caption='" + media.caption + "'";
	
	if(media.type != "mp4"){
		return "<div class='thumbnail' " + mediaAttrib + "><img " + mediaAttrib + " class='thumbnail-item " + specialClass + "' src='" + mediaURI + "'/></div>" ;
	}else{
		var posterURI = website + 'uploads/' + eid + '/poster/' + getMediaBasename( media.mid, 'png' );
		var videoItem = "<div class='thumbnail' " + mediaAttrib + " >";
		videoItem += "<div class='block " + specialClass + "'>";
		videoItem += "<video controls class='centered videoMedia thumbnail-item NoSwiping " + specialClass + "' poster='" + posterURI + "' muted>";
		videoItem += "<source src='" + mediaURI + "' type='video/mp4'>";
		videoItem += '</video>';
		videoItem += '</div>';
		videoItem += "</div>";
		return videoItem;
	}
}	


