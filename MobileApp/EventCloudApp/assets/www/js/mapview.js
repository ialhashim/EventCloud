/* Global variables */

eid = getParameterByName('eid');
mid = getParameterByName('mid');
userid = getParameterByName('uid');
username = getUserName( userid );

$(document).ready(function() { 
	$("#debug").hide();
	
	// Limit of free Google Maps
	var w = 640;
	var h = 640;
	
	vars = { eid: eid, mid: mid, uid: userid, width: w, height: h};
	
	// Load map image
	$.post( mapView, vars, function(d){
		var data = JSON.parse( d );
		console.log( data );
		
		$('#mapContainer').append('<img class="mainMap" src="data:image/png;base64,' + data.mapImage.data + '"/>');
		$('#overlay').append( randomDots(60, $('body').width(), $('body').height()) );
		
		$('#mapContainer').animate({opacity: 1});
	});
});

function dot(x,y){
	$dot = $('<span class="dot"> <i class="icon-circle"></i> </span>');
	$dot.css('top', y);
	$dot.css('left', x);
	return $dot;
}

function randomDots(count, maxWidth, maxHeight){
	var allDots = new Array();
	for(var i = 0; i < count; i++)
		allDots.push( dot( Math.random() * maxWidth, Math.random() * maxHeight ) );
	return allDots;
}
