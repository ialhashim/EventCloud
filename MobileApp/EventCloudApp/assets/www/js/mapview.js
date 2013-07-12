/* Global variables */
eid = getParameterByName('eid');
mid = getParameterByName('mid');
userid = getParameterByName('uid');
username = getUserName( userid );

var event;
var mapViewer = new Object();

$(window).bind('resize', function () { 
	resizeMap();
});

$(document).ready(function() { 
	$("#debug").hide();
	
	// Limit of free Google Maps
	var w = 640;
	var h = 640;
	
	vars = { eid: eid, mid: mid, uid: userid, width: w, height: h};
	
	// Load map image
	$.post( mapView, vars, function(d){
		var data = JSON.parse( d );
		
		event = data.event;
		$('#eventNameCaption').text( event.name + ' / ' );

		$('#mapContent').append('<img class="mainMap" src="data:image/png;base64,' + data.mapImage.data + '"/>');
		$('#mapContent').animate({opacity: 1}, function() { loadMedia(); } );
	});
	
	resizeMap();
});

function resizeMap(){
	var allHeight = $('#mainScreen').height();
	var headerHeight = $('.header').outerHeight( true );
	mapViewer.height = allHeight - headerHeight;
	mapViewer.width = $('#mainScreen').width();
	
	$("#map").height( mapViewer.height );
	$("#mapContent").width( mapViewer.width );
	
	$("#overlay").width( mapViewer.width );
	$("#overlay").height( mapViewer.height );
	
	var delta = (mapViewer.height - $("#mapContainer").height()) / 2.0;
	$('#mapContainer').css('margin-top', delta + "px");
	
	// reposition all dots
	$( ".dot" ).each(function( index ) {
		$dot = $(this);
		
		var x = parseFloat($dot.attr('x'));
		var y = parseFloat($dot.attr('y'));
	
		var start = 0;
		var y = y * mapViewer.width;
	
		$dot.css('left', x * mapViewer.width);
		$dot.css('top', y + start);
	});
	
	console.log( mapViewer );
}

function dot(x,y,color){
	color = color ? color : '';
	$dot = $('<span class="dot '+color+'" x="'+x+'" y="'+y+'"> <i class="icon-circle"></i> </span>');
	return $dot;
}

function randomDots(count, maxWidth, maxHeight, color){
	var allDots = new Array();
	for(var i = 0; i < count; i++)
		allDots.push( dot( Math.random(), Math.random(), color ) );
	return allDots;
}

function loadMedia(){
	$.post(mediaURL, { request:'getChunkByMid', mid: mid}, function(data){
		var chunk = JSON.parse( data );
		
		for(var i = 0; i < chunk.length; i++){
			var media = chunk[i];
			var isFull = '/';
	    	var mediaURI = website + 'uploads/' + eid + isFull + getMediaBasename( media.mid, media.type );
	    	

		};
		
		// Add point at center of event
		$('#overlay').append( dot(0.5, 0.5, 'blue') );
		
		$('#overlay').append( randomDots(60, $('body').width(), $('body').height(), 'red') );

	});
}

