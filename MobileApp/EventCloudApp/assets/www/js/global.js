/* When using local host */
var website = 'https://96.49.252.141/'; // home
var website = 'https://54.214.248.120/'; // Amazon

var uploadURL = website + "mediaManager.php";
var mediaURL = website + "mediaManager.php";
var galleryURL = website + "gallery.php";
var eventsManager = website + "eventsManager.php";
var usersManager = website + "usersManager.php";
var mapView = website + "mapView.php";

var amazon_s3 = 'https://s3.amazonaws.com/';
var bucket = 'eventfulcloud-uploads/';
var bucketOutput = 'eventfulcloud-3d/';

function getMediaURI( mid, type, eid, folder ){
	folder = folder ? folder : '';
	return amazon_s3 + bucket + eid + folder + getMediaBasename( mid, type );
}

/* Default page display */
var fadeSpeed = 250;
$(document).ready(function() {
	$('#mainScreen').css('transition-duration', fadeSpeed + 'ms');
	$('#mainScreen').css({
		opacity : 1
	});

	$('#mainScreen').on("click", ".outlink", function(event) {
		event.preventDefault();

		$('#mainScreen').animate({
			opacity : '0'
		}, 1);
		$('a').fadeOut(fadeSpeed, function() {
			window.location = event.currentTarget.href;
		});

		return false;
	});
	
	$(document).on("click", ".outlinkFade", function(event) {
		event.preventDefault();
		$('body').fadeOut(function(){
			$('a').fadeOut(fadeSpeed, function() {
				window.location = event.currentTarget.href;
			});
		});
		return false;
	});
});

// Find out if we support flash
var flashEnabled = !!(navigator.mimeTypes["application/x-shockwave-flash"] || window.ActiveXObject && new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

function debug( $item ){
	if($item == "") $item = "[empty string]";
	$item = '<pre>' + htmlEncode($item) + '</pre>';
	$('#debug').append( $item );
}

/* jQuery: small extensions */
jQuery.fn.outerHTML = function(s) {
	return s ? this.before(s).remove() : jQuery("<p>").append(this.eq(0).clone()).html();
};

/* Copy specific CSS styles */
jQuery.fn.copyCSS = function(style, toNode) {
	var self = $(this), styleObj = {}, has_toNode = typeof toNode != 'undefined' ? true : false;
	if (!$.isArray(style)) {
		style = style.split(' ');
	}
	$.each(style, function(i, name) {
		if (has_toNode) {
			toNode.css(name, self.css(name));
		} else {
			styleObj[name] = self.css(name);
		}
	});
	return ( has_toNode ? self : styleObj );
}

/* Get number of stuff in an object */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function executeAsync(func) {
	setTimeout(func, 0);
}

function encode_utf8(s) {
	return unescape(htmlentities(s));
}

function decode_utf8(s) {
	return htmlentities(escape(s));
}

function lastToken(str, delimiter) {
	delimiter = delimiter ? delimiter : '/';
	var xs = str.split( delimiter );
	return xs.length > 1 ? xs.pop() : null;
}

/* Change to title case */
function toTitleCase(str) {
	return str.replace(/(?:^|\s)\w/g, function(match) {
		return match.toUpperCase();
	});
}

function fulltrim(str){return str.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');};

/// Form actions
function actionSubmitForm($sender, $form, callBack) {

	if ($sender.is('a'))
		eventType = 'click';
	if ($sender.is('form'))
		eventType = 'submit';

	$sender.on(eventType, function() {
		$('*').blur();
		event.preventDefault();
		$('#mainScreen').animate({
			opacity : '0'
		}, 1);
		$('a').fadeOut(fadeSpeed, function() {
			callBack();
		});
		return false;
	});
}

function defaultValues($item, defaultText) {
	$item.on('focus', function() {
		var $this = $(this);
		if ($this.val() == defaultText) {
			$this.val('');
			$this.css('color', 'hsl(208, 50%, 30%)');
		}
	}).on('blur', function() {
		var $this = $(this);
		if ($this.val() == '') {
			$this.val(defaultText);
			$this.css('color', 'hsl(0, 0%, 70%)');
		}
	});

	$item.css('color', 'hsl(0, 0%, 70%)');
}

/* Extract url variables */
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(location.search);
	return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getUserName(userid) {
	var username = '';
	$.ajax({
		url : usersManager,
		data : {
			uid : userid
		},
		type : "POST",
		async : false,
		success : function(data) {
			username = data;
		}
	});
	return username;
}

function getEventStart(eid) {
	var eventStart = '';
	$.ajax({
		url : eventsManager,
		data : {
			request : 'startTime',
			eid : eid
		},
		type : "POST",
		async : false,
		success : function(data) {
			eventStart = data;
		}
	});
	return eventStart;
}

/* Time functions */
function msToTime(s, isIncludeMS) {

	function addZ(n) {
		return (n < 10 ? '0' : '') + n;
	}

	var ms = s % 1000;
	s = (s - ms) / 1000;
	var secs = s % 60;
	s = (s - secs) / 60;
	var mins = s % 60;
	var hrs = (s - mins) / 60;

	var tail = '.' + ms;
	if (!isIncludeMS) tail = '';

	return addZ(hrs) + ':' + addZ(mins) + ':' + addZ(secs) + tail;
}

function eventClock( eventStart ){
	var from = new Date( eventStart ); 
	var to = new Date();
	var millisecond = Math.max(0, (new Date()) - from ); 

	$('#timer').text( msToTime(millisecond) );
}

/*! sprintf.js | Copyright (c) 2007-2013 Alexandru Marasteanu <hello at alexei dot ro> | 3 clause BSD license */
(function(e){function r(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}function i(e,t){for(var n=[];t>0;n[--t]=e);return n.join("")}var t=function(){return t.cache.hasOwnProperty(arguments[0])||(t.cache[arguments[0]]=t.parse(arguments[0])),t.format.call(null,t.cache[arguments[0]],arguments)};t.format=function(e,n){var s=1,o=e.length,u="",a,f=[],l,c,h,p,d,v;for(l=0;l<o;l++){u=r(e[l]);if(u==="string")f.push(e[l]);else if(u==="array"){h=e[l];if(h[2]){a=n[s];for(c=0;c<h[2].length;c++){if(!a.hasOwnProperty(h[2][c]))throw t('[sprintf] property "%s" does not exist',h[2][c]);a=a[h[2][c]]}}else h[1]?a=n[h[1]]:a=n[s++];if(/[^s]/.test(h[8])&&r(a)!="number")throw t("[sprintf] expecting number but found %s",r(a));switch(h[8]){case"b":a=a.toString(2);break;case"c":a=String.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=h[7]?a.toExponential(h[7]):a.toExponential();break;case"f":a=h[7]?parseFloat(a).toFixed(h[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=String(a))&&h[7]?a.substring(0,h[7]):a;break;case"u":a>>>=0;break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(h[8])&&h[3]&&a>=0?"+"+a:a,d=h[4]?h[4]=="0"?"0":h[4].charAt(1):" ",v=h[6]-String(a).length,p=h[6]?i(d,v):"",f.push(h[5]?a+p:p+a)}}return f.join("")},t.cache={},t.parse=function(e){var t=e,n=[],r=[],i=0;while(t){if((n=/^[^\x25]+/.exec(t))!==null)r.push(n[0]);else if((n=/^\x25{2}/.exec(t))!==null)r.push("%");else{if((n=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t))===null)throw"[sprintf] huh?";if(n[2]){i|=1;var s=[],o=n[2],u=[];if((u=/^([a-z_][a-z_\d]*)/i.exec(o))===null)throw"[sprintf] huh?";s.push(u[1]);while((o=o.substring(u[0].length))!=="")if((u=/^\.([a-z_][a-z_\d]*)/i.exec(o))!==null)s.push(u[1]);else{if((u=/^\[(\d+)\]/.exec(o))===null)throw"[sprintf] huh?";s.push(u[1])}n[2]=s}else i|=2;if(i===3)throw"[sprintf] mixing positional and named placeholders is not (yet) supported";r.push(n)}t=t.substring(n[0].length)}return r};var n=function(e,n,r){return r=n.slice(0),r.splice(0,0,e),t.apply(null,r)};e.sprintf=t,e.vsprintf=n})(typeof exports!="undefined"?exports:window);
function getMediaBasename( mid, type ){
	return sprintf("%010d", parseInt(mid)) + '.' + type;
}

function forceResizeWindow(){
	var evt = document.createEvent('UIEvents');
    evt.initUIEvent('resize', true, false,window,0);
    window.dispatchEvent(evt);
}

// Haversine Algorithm
function distGPS(lat1, long1, lat2, long2, isMeter) {
    var _eQuatorialEarthRadius = 6378.1370;
    var _d2r = (Math.PI / 180.0);

    function HaversineInM(lat1, long1, lat2, long2) {
        return 1000.0 * HaversineInKM(lat1, long1, lat2, long2);
    }

    function HaversineInKM(lat1, long1, lat2, long2) {
        var dlong = (long2 - long1) * _d2r;
        var dlat = (lat2 - lat1) * _d2r;
        var a = Math.pow(Math.sin(dlat / 2.0), 2.0) + Math.cos(lat1 * _d2r) * Math.cos(lat2 * _d2r)
                * Math.pow(Math.sin(dlong / 2.0), 2.0);
        var c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
        var d = _eQuatorialEarthRadius * c;

        return d;
    }

	if(isMeter) return HaversineInM(lat1, long1, lat2, long2)
	else return HaversineInKM(lat1, long1, lat2, long2);
}

/* Mobile: orientation */
var previousOrientation = window.orientation;
var checkOrientation = function(){
    if(window.orientation !== previousOrientation){
        previousOrientation = window.orientation;
    }
    
    forceResizeWindow();
};

window.addEventListener("orientationchange", checkOrientation, false);

// (optional) Android doesn't always fire orientationChange on 180 degree turns
setInterval(checkOrientation, 5000);

/* Need these? */
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry)/)) {
	document.addEventListener("deviceready", onDeviceReady, false);
} else {
	//onDeviceReady(); //this is the browser
}

function onDeviceReady() {

}
