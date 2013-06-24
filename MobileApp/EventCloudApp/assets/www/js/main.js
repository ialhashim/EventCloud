/* Global variables */
var eid;
var userid;
var username;
var eventname;
var eventStart;

var itemCount = 4;

$(document).ready(function() { 
	userid = getParameterByName('uid');
	username = getUserName( userid );
	eid = getParameterByName('eid');
	
	// Get event name
	$.post(eventsManager, { request: "name", eid: eid }, function(data){ 
		eventname = data.name; 
		eventStart = data.start;
		$("h2#greeting").replaceWith( "<h2 id='greeting'> " + toTitleCase(username) + " @ " + eventname + " </h2>" );
		
		setInterval(eventClock, 1000);
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
		success: function( d ){
			callBack(d);
		}
	}); 
}

var currentStart = 0;
var slidesCount = 3;
var numActiveSlides = 12;
var mainSwiper;
var mediaUID = 1;
var packetUID = 1;

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
	
	if(!mainSwiper == undefined)
		mainSwiper.reInit();
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

function initialSlides() {
	
	var count = slidesCount;
	
	getInitialMedia(numActiveSlides, 0, function(d){
			
		// Load initial set of slides
		$initData = $(d);
		$.each( $initData, function( i, el ) {
	    	var slideHeight = $(el).height();
	    	$(el).appendTo( '.swiper-wrapper' ).wrap('<div class="swiper-slide" style="height:' + slideHeight + 'px" />');
		});
		
		// Generate left over slides
		//leftOver = numActiveSlides - $initData.length;
		//for (var i = 0; i < leftOver; i++){ 
			//$emptyItem = $refSpinner.clone();
		//	$($refSpinner.html()).appendTo( '.swiper-wrapper' ).wrap('<div class="swiper-slide" />');
		//}
		
	    mainSwiper = $('.swiper-container').swiper({
			//Your options here:
			slidesPerView : slidesCount,
			preventClassNoSwiping: true,
			pagination : '.pagination-main',
			mode:'horizontal',
			initialSlide : 0,
			onSlideChangeEnd: function(){
				//console.log('Last Direction: ' + mainSwiper.lastDirection);
				var count = slidesCount;
						
				if(mainSwiper.lastDirection === 'next')
				{
					// Start dynamic loading when we are at the middle
					if(mainSwiper.activeIndex >= 0.5 * numActiveSlides)
					{
						var start = mainSwiper.virtualIndex + numActiveSlides;
						var $media = $( getMoreMedia( start, count ) );
						mainSwiper.virtualIndex += $media.children().length;
						mainSwiper.removeStartAddEnd( $media );	
					}
								
				}
				
				if(mainSwiper.lastDirection === 'prev')
				{
					if(mainSwiper.activeIndex <= 0.5 * numActiveSlides)
					{
						var start = mainSwiper.virtualIndex - count;
						var $media = $( getMoreMedia( start, count ) );
						var c = $media.children().length;
						
						if(mainSwiper.virtualIndex - c >= 0)
						{
							mainSwiper.virtualIndex -= c;
							mainSwiper.removeEndAddStart( $media );	
						}
					}
				}
			}
		});
		
		$(document).on('mousemove mousewheel',function(e) {
			$("#vidx").text( 'v = ' + mainSwiper.virtualIndex + ", active idx = " + mainSwiper.activeIndex);
		});
		
	    // Automatically resize
	    resizeSwiper();
	    $(window).resize(function() {
		  resizeSwiper();
		});
	});
}

function eventClock()
{
	var from = new Date( eventStart ); 
	var to = new Date();
	var millisecond = (new Date()) - from; 

	$('#timer').text( msToTime(millisecond) );
}


