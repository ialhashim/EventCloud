/* Global variables */
eid = getParameterByName('eid');
mid = getParameterByName('mid');
userid = getParameterByName('uid');
username = getUserName( userid );

var myevent;
var mapViewer = new Object();
var G = google.maps;
	
$(window).bind('resize', function () { 
	resizeMap();
});

$(document).ready(function() { 
	$("#debug").hide();
	
	$("#overlay").css('opacity', 0);
	
	// Limit of free Google Maps
	var w = 640;
	var h = 640;
	var zoom = 17;
	
	vars = { eid: eid, mid: mid, uid: userid, width: w, height: h, zoom: zoom};
	
	// Load map image
	$.post( mapView, vars, function(d){
		var data = JSON.parse( d );
		
		myevent = data.event;
		$('#eventNameCaption').text( myevent.name + ' / ' );
		
		$('#mapContent').append('<img class="mainMap" src="data:image/png;base64,' + data.mapImage.data + '"/>');
		
		resizeMap();
		
		var mapCorners = getCorners(myevent.lat, myevent.long, zoom, w, h);
		myevent.map = { center: {lat:myevent.lat,long:myevent.long}, corners: mapCorners, zoom: zoom, w:w, h:h };

		$('#mapContent').animate({opacity: 1}, function() { loadMedia(); });
	});
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
	if(delta > 0) return; // hack for now..
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
}

function dot(x,y,color,specialStyle){
	color = color ? color : '';
	$dot = $('<span class="dot '+color+'" x="'+x+'" y="'+y+'" style="'+specialStyle+'"> <i class="icon-circle"></i> </span>');
	return $dot;
}

function randomDots(count, maxWidth, maxHeight, color){
	var allDots = new Array();
	for(var i = 0; i < count; i++)
		allDots.push( dot( Math.random(), Math.random(), color ) );
	return allDots;
}

/* Utilities */
var MERCATOR_RANGE = 256;

function bound(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

function radiansToDegrees(rad) {
  return rad / (Math.PI / 180);
}

function MercatorProjection() {
  this.pixelOrigin_ = new google.maps.Point( MERCATOR_RANGE / 2, MERCATOR_RANGE / 2);
  this.pixelsPerLonDegree_ = MERCATOR_RANGE / 360;
  this.pixelsPerLonRadian_ = MERCATOR_RANGE / (2 * Math.PI);
};

MercatorProjection.prototype.fromLatLngToPoint = function(latLng, opt_point) {
  var me = this;

  var point = opt_point || new google.maps.Point(0, 0);

  var origin = me.pixelOrigin_;
  point.x = origin.x + latLng.lng() * me.pixelsPerLonDegree_;
  // NOTE(appleton): Truncating to 0.9999 effectively limits latitude to
  // 89.189.  This is about a third of a tile past the edge of the world tile.
  var siny = bound(Math.sin(degreesToRadians(latLng.lat())), -0.9999, 0.9999);
  point.y = origin.y + 0.5 * Math.log((1 + siny) / (1 - siny)) * -me.pixelsPerLonRadian_;
  return point;
};

MercatorProjection.prototype.fromPointToLatLng = function(point) {
  var me = this;

  var origin = me.pixelOrigin_;
  var lng = (point.x - origin.x) / me.pixelsPerLonDegree_;
  var latRadians = (point.y - origin.y) / -me.pixelsPerLonRadian_;
  var lat = radiansToDegrees(2 * Math.atan(Math.exp(latRadians)) - Math.PI / 2);
  return new google.maps.LatLng(lat, lng);
};

function getCorners(lat,lon,zoom,mapWidth,mapHeight){
	var proj = new MercatorProjection();
	var corners = new Object();
    var scale = Math.pow(2,zoom);
    var centerPx = proj.fromLatLngToPoint( new G.LatLng(parseFloat(lat), parseFloat(lon)) );
    // SW
    {
	    var SWPoint = {x: (centerPx.x -(mapWidth/2)/ scale) , y: (centerPx.y + (mapHeight/2)/ scale)};
	    var SWLatLon = proj.fromPointToLatLng(SWPoint);
	    corners.sw = {lat:SWLatLon.jb, long:SWLatLon.kb};
   	}
   	// NE
    {
    	var NEPoint = {x: (centerPx.x +(mapWidth/2)/ scale) , y: (centerPx.y - (mapHeight/2)/ scale)};
    	var NELatLon = proj.fromPointToLatLng(NEPoint);
    	corners.ne = {lat:NELatLon.jb, long:NELatLon.kb};
    }
    // SE
    {
	    var SWPoint = {x: (centerPx.x +(mapWidth/2)/ scale) , y: (centerPx.y + (mapHeight/2)/ scale)};
	    var SWLatLon = proj.fromPointToLatLng(SWPoint);
	    corners.se = {lat:SWLatLon.jb, long:SWLatLon.kb};
   	}
   	// NW
    {
    	var NEPoint = {x: (centerPx.x -(mapWidth/2)/ scale) , y: (centerPx.y - (mapHeight/2)/ scale)};
    	var NELatLon = proj.fromPointToLatLng(NEPoint);
    	corners.nw = {lat:NELatLon.jb, long:NELatLon.kb};
    }
    return corners;
}

function jRanged(mn, val, mx){
	return Math.max(mn, Math.min(mx,val) );
}

function getPixel(lat, long, map){
	var pixel = { x:0, y: 0};
	var corners = map.corners;
	var range = {lat: corners.se.lat - corners.nw.lat, long:corners.se.long - corners.nw.long};
	pixel.x = jRanged(0, (long - corners.nw.long) / (range.long), 1);
	pixel.y = jRanged(0, (lat - corners.nw.lat) / (range.lat), 1);
	
	return pixel;	
}

/* Loading and displaying media */
function loadMedia(){
	$.post(mediaURL, { request:'getChunkByMid', mid: mid}, function(data){
		var chunk = JSON.parse( data );
		
		// Add point at center of event
		$('#overlay').append( dot(0.5, 0.5, 'blue', 'font-size:small;') );
		//$('#overlay').append( randomDots(60, $('body').width(), $('body').height(), 'red') );
		
		for (var i in chunk) {
			var media = chunk[i];
			var isFull = '/';
	    	var mediaURI = website + 'uploads/' + eid + isFull + getMediaBasename( media.mid, media.type );
	    	
			var coord = getPixel( media.lat, media.long, myevent.map );
			$('#overlay').append( dot(coord.x, coord.y, 'red') );
		}
		
		resizeMap();
		$('#overlay').animate({opacity: 1});
	});
}

