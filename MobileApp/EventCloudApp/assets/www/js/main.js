/* Global variables */
var eid;
var userid;
var username;
var eventname;

var itemCount = 4;

$(document).ready(function() { 
	userid = getParameterByName('uid');
	username = getUserName( userid );
	eid = getParameterByName('eid');
	
	// Get event name
	$.post(eventsManager, { request: "name", eid: eid }, function(data){ 
		eventname = data.name; 
		$("h2#greeting").replaceWith( "<h2 id='greeting'> " + toTitleCase(username) + " @ " + eventname + " </h2>" );
		
		setInterval(eventClock, 1000, [data.start]);
	});
	
	// Disable scrolling
	$(document.body).on('touchmove',function(e){
	    if(!$('#swiper-main-container').has($(e.target)).length)
	        e.preventDefault();
	});
	
	// Single reference copy of spinner element
	$s = $('<div id="refSpinner" class="spinner-item"></div>').spin( { color: '#FFF', shadow: true } );
	$refSpinner = $('<div class="spinner-container"></div>').append( $s );
	
	initialSlides();
});

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
var slideWidth;
var slideHeight;

function getInitialMedia(count, start, callBack){
	var requestData = {
		count : count,
		start : start,
		eid: eid
	};
	var request = $.ajax({
		url : galleryURL,
		type : "POST",
		data : requestData,
		success: function( d ){	callBack(d); }
	}); 
}

function resizeSwiper( className, numSlides, myswiper ){
	var width = $('body').width();
	var height = $('body').height();
	
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
}

function getMoreMedia( start, count ){
	var packetid = "packet-" + (packetUID++);
	var $media = $('<div>', {class:  packetid});
	
	// bounds check
	if(start < 0) return $media;
	
	var requestData = {
		start : start,
		count : count,
		eid: eid
	};
	
	for(var i = 0; i < count; i++){
		var myuid = "uid-" + (mediaUID++);
		$media.append( $refSpinner.clone().addClass( myuid ) );
	}
	
	$.ajax({
  		type: 'POST',
  		url: galleryURL,
  		data: requestData,
  		success: function(d) {
  			$data = $(d);
  			
  			N = $media.children().length;
  			
			for(var i = 0; i < N; i++)
			{
				var oldMediaItem = $media.children()[i];

				var filterClass = $(oldMediaItem).attr('class');
				myuid = filterClass ? filterClass.split(' ').pop() : 'undefined';

				if(i < $data.length){
					$('.' + myuid).replaceWith( $data[i] );	
				}else{
					$('.' + myuid).css('display', 'none');
				}
			}
		},
  		async:true
	});
	
	return $media.clone();
}

function makeSliderV( swiperClassID, options, initialSlides ){
	var swiperContainer = $("<div/>");
	swiperContainer.addClass( swiperClassID );
	swiperContainer.addClass( 'swiper-container' );
	swiperContainer.css('width', '100%');
	swiperContainer.css('height', slideHeight);

	swiperContainer = swiperContainer.append( "<div class='swiper-wrapper' style='height:200px;width:200px'> </div>" );
	
	options = {
		mode: 'vertical',
		slidesPerView: 1
	}
	
	for(var i = 0; i < 10; i++){
		el = $("<div/>");
		el.addClass( 'swiper-slide' );
		el.addClass( 'vslide' );
		el.html( '<div class="thumbnail"><img class="thumbnail-item" src="http://96.49.252.141/uploads/1/0000000002.png"></div>' );
		el.appendTo( swiperContainer.children('.swiper-wrapper') );
	}
	
	var slide = $("<div/>");
	slide.addClass( 'swiper-slide' );
	swiperContainer.appendTo( slide );
	
	return { container: slide, swiper: swiperContainer.swiper( options ) };
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

function initialSlides() {
	
	var count = slidesCount;
	
	getInitialMedia(numActiveSlides, 0, function(d){

		var photoStream = makeSliderH( 'photoStream', {
			slidesPerView : slidesCount,
			pagination : '.pagination-main',
			mode:'horizontal',
			initialSlide : 0,
			onSlideChangeEnd: function( swiper ){
				//console.log('Last Direction: ' + swiper.lastDirection);
				var count = slidesCount;
						
				if(swiper.lastDirection === 'next')
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
				}
			},
			onSwiperCreate: function( swiper ){
				
				// Add main photo stream
				$("#gallery").append( swiper.container );
				swiper.reInit();
				
			    // Automatically resize
			    resizeSwiper('photoStream', slidesCount, swiper);
			    $(window).resize(function() {
				  resizeSwiper('photoStream', slidesCount, swiper);
				});
		
				// Test vertical stream
				vslider = makeSliderV('test');
				console.log( vslider.container[0] );
				$vslide = $("<div>").addClass('swiper-slide').append( vslider.container[0] );
				vslider.swiper.reInit();
				
				swiper.prependSlide( vslider.container[0] );
				//$("#gallery").append( vslider.container );
				
				$(window).resize(function() {  $(".test").height( slideWidth + 'px');	});
				$(".test").height( slideWidth + 'px');
			}
		}, $(d));
		
	}); // end of getInitialMedia
}

